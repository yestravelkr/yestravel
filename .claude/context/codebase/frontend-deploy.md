---
name: frontend-deploy
description: 프론트엔드 배포 인프라 - GitHub Actions + S3 + CloudFront 구조, 신규 앱 추가 가이드
keywords: [배포, deploy, S3, CloudFront, GitHub Actions, workflow_dispatch, 프론트엔드]
---

# 프론트엔드 배포 (S3 + CloudFront)

## 아키텍처

```
main push (apps/xxx/** 변경)
  ├→ dev 빌드 → S3 development/ → CloudFront invalidation (자동)
  └→ prod 빌드 → S3 build-prod/{hash}/ (저장만)

workflow_dispatch (수동 버튼)
  └→ S3 build-prod/{hash}/ → S3 production/ → CloudFront invalidation
```

## S3 버킷 구조

```
yestravel-{app}/
├── development/           # dev 자동 배포
├── build-prod/{hash}/     # prod 빌드 저장 (hash별 보관)
└── production/            # prod 수동 배포
```

## 현재 배포 현황

| 앱 | S3 버킷 | dev CF | prod CF | dev 도메인 | prod 도메인 |
|---|---|---|---|---|---|
| Shop | yestravel-shop | E2KAQAJ0LLB2BZ | E2V7Y5SR17VEZ1 | dev.yestravel.co.kr | (미연결) |
| Backoffice | yestravel-backoffice | E2164WNANED9OJ | E2EKIW1A7TFMPO | backoffice.dev.yestravel.co.kr | backoffice.yestravel.co.kr |
| Partner | yestravel-partner | E3N652F7EN3EG2 | E1S31QHMWQKJUZ | partner.dev.yestravel.co.kr | (미연결) |

## GitHub Secrets

| Secret | 용도 |
|---|---|
| AWS_ACCESS_KEY_ID | AWS 인증 (공통) |
| AWS_SECRET_ACCESS_KEY | AWS 인증 (공통) |
| SHOP_CF_DEV_DISTRIBUTION_ID | Shop dev CF |
| SHOP_CF_PROD_DISTRIBUTION_ID | Shop prod CF |
| BACKOFFICE_CF_DEV_DISTRIBUTION_ID | Backoffice dev CF |
| BACKOFFICE_CF_PROD_DISTRIBUTION_ID | Backoffice prod CF |
| PARTNER_CF_DEV_DISTRIBUTION_ID | Partner dev CF |
| PARTNER_CF_PROD_DISTRIBUTION_ID | Partner prod CF |

## ACM 인증서

| 인증서 | ARN | 커버 범위 |
|---|---|---|
| *.yestravel.co.kr | eefccd74-455a-4d1f-9d29-f76fb53eb3bd | 1단계 서브도메인 (backoffice.yestravel.co.kr 등) |
| *.dev.yestravel.co.kr | 7ea89b5f-0244-4105-ac76-ce0aed3d21e8 | dev 2단계 서브도메인 (backoffice.dev.yestravel.co.kr 등) |

## 워크플로우 구조

| 워크플로우 | 트리거 | 역할 |
|---|---|---|
| build-{app}.yml | PR 브랜치 push (main 제외) | 빌드 체크만 |
| deploy-{app}.yml | main push (paths 필터) | 빌드 + dev 배포 + prod 빌드 저장 |
| deploy-{app}.yml | workflow_dispatch | prod 배포 (S3 복사) |

## CloudFront OAC

모든 앱이 동일한 OAC 사용: `E2HL7BEJLV4JN5` (yestravel-shop-oac)

## Route53

호스팅 존: `Z08926832K4AI4DSSN870` (yestravel.co.kr)

---

## 신규 앱 추가 가이드

새 프론트엔드 앱을 추가할 때 아래 순서를 따른다.

### Step 1: S3 버킷 생성

```bash
aws s3api create-bucket --bucket yestravel-{app} --region ap-northeast-2 \
  --create-bucket-configuration LocationConstraint=ap-northeast-2

aws s3api put-public-access-block --bucket yestravel-{app} \
  --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
```

### Step 2: CloudFront 배포 생성 (dev + prod)

각각 OriginPath를 `/development`와 `/production`으로 설정한다.

```bash
aws cloudfront create-distribution --distribution-config '{
  "CallerReference": "yestravel-{app}-dev-TIMESTAMP",
  "Comment": "YesTravel {App} - Development",
  "Enabled": true,
  "Origins": {
    "Quantity": 1,
    "Items": [{
      "Id": "yestravel-{app}-dev",
      "DomainName": "yestravel-{app}.s3.ap-northeast-2.amazonaws.com",
      "OriginPath": "/development",
      "S3OriginConfig": {"OriginAccessIdentity": ""},
      "OriginAccessControlId": "E2HL7BEJLV4JN5"
    }]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "yestravel-{app}-dev",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": {"Quantity": 2, "Items": ["GET","HEAD"], "CachedMethods": {"Quantity": 2, "Items": ["GET","HEAD"]}},
    "CachePolicyId": "658327ea-f89d-4fab-a63d-7e88639e58f6",
    "Compress": true
  },
  "DefaultRootObject": "index.html",
  "CustomErrorResponses": {"Quantity": 1, "Items": [{"ErrorCode": 403, "ResponsePagePath": "/index.html", "ResponseCode": "200", "ErrorCachingMinTTL": 10}]},
  "PriceClass": "PriceClass_200"
}'
```

prod도 동일하게 OriginPath만 `/production`으로 변경하여 생성.

### Step 3: S3 버킷 정책

```bash
aws s3api put-bucket-policy --bucket yestravel-{app} --policy '{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"Service": "cloudfront.amazonaws.com"},
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::yestravel-{app}/*",
    "Condition": {
      "StringEquals": {
        "AWS:SourceArn": [
          "arn:aws:cloudfront::715590725747:distribution/{DEV_CF_ID}",
          "arn:aws:cloudfront::715590725747:distribution/{PROD_CF_ID}"
        ]
      }
    }
  }]
}'
```

### Step 4: CloudFront에 커스텀 도메인 연결

- `*.yestravel.co.kr` 인증서 → 1단계 서브도메인용
- `*.dev.yestravel.co.kr` 인증서 → dev 2단계 서브도메인용

### Step 5: Route53 DNS 레코드 추가

```bash
aws route53 change-resource-record-sets --hosted-zone-id Z08926832K4AI4DSSN870 --change-batch '{
  "Changes": [{
    "Action": "UPSERT",
    "ResourceRecordSet": {
      "Name": "{app}.dev.yestravel.co.kr",
      "Type": "CNAME",
      "TTL": 300,
      "ResourceRecords": [{"Value": "{dev-cf-domain}.cloudfront.net"}]
    }
  }]
}'
```

### Step 6: GitHub Secrets 추가

- `{APP}_CF_DEV_DISTRIBUTION_ID`
- `{APP}_CF_PROD_DISTRIBUTION_ID`

### Step 7: 워크플로우 파일 생성

`deploy-shop.yml`을 복사하여 앱 이름, S3 버킷, 환경변수를 변경.

### Step 8: 기존 build 워크플로우 수정

`build-{app}.yml`의 `branches-ignore`를 `main`으로 설정.

## 관련 파일

- `.github/workflows/deploy-shop.yml`
- `.github/workflows/deploy-backoffice.yml`
- `.github/workflows/deploy-partner.yml`
- `.github/workflows/build-shop.yml`
- `.github/workflows/build-backoffice.yml`
- `.github/workflows/build-partner.yml`