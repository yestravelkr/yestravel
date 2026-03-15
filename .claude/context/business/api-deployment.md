---
name: api-deployment
description: API 서버 빌드/배포 자동화 - Docker 이미지 빌드, ECR 푸시, Elastic Beanstalk 배포
keywords: [배포, deploy, API, Docker, ECR, Elastic Beanstalk, CI/CD, 자동배포]
estimated_tokens: ~200
---

# API 배포

## 목적

API 서버 코드가 main 브랜치에 병합되면 자동으로 Docker 이미지를 빌드하고 개발 환경에 배포하여, 개발팀이 수동 배포 없이 최신 API를 즉시 사용할 수 있도록 한다.

## 핵심 기능

| 기능 | 설명 | 사용자 관점 |
|------|------|------------|
| 자동 빌드 | main push 시 Docker 이미지 자동 빌드 | 개발자가 별도 빌드 작업 불필요 |
| 캐시 최적화 | GHA 캐시로 Docker 빌드 시간 단축 | 배포 대기 시간 감소 |
| 환경별 배포 | develop 자동 배포, staging 수동 배포 | 개발 환경은 즉시 반영, 스테이징은 안전하게 관리 |
| 프론트엔드 변경 무시 | 프론트엔드만 변경 시 API 배포 스킵 | 불필요한 배포 방지로 리소스 절약 |

## 사용자 흐름

### 개발 환경 배포

1. 개발자가 main 브랜치에 API 관련 코드 병합
2. GitHub Actions가 자동으로 API 빌드 및 Docker 이미지 생성
3. ECR에 이미지 푸시 후 Elastic Beanstalk 개발 환경 자동 업데이트
4. 개발 환경에서 최신 API 즉시 사용 가능

### 스테이징 배포

1. v* 태그 생성 시 빌드 및 ECR 푸시까지 자동 수행
2. Elastic Beanstalk 애플리케이션 버전 생성 (배포는 수동)
3. 운영팀이 스테이징 환경에 수동으로 버전 배포

## 비즈니스 규칙

- 프론트엔드(backoffice, partner, shop) 변경만 있을 경우 API 배포를 트리거하지 않는다
- 개발 환경은 main push 시 자동 배포하여 빠른 피드백 루프를 유지한다
- 스테이징은 태그 기반으로 버전만 생성하고, 배포는 수동으로 수행하여 안정성을 확보한다

## 관련 Codebase Context

- [github-actions-ci](../codebase/github-actions-ci.md)
