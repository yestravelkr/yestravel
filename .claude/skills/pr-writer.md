---
name: pr-writer
description: PR(Pull Request) 작성 스킬. 기능 구현 완료 후 PR 생성, 커밋 메시지 작성, PR 본문 작성 시 사용.
estimated_tokens: ~500
---

# PR Writer Skill

PR 생성 및 커밋 메시지 작성 가이드.

## PR 작성 워크플로우

### Step 1: 변경사항 분석

```bash
git status                          # 변경된 파일 확인
git diff main...HEAD               # main 대비 전체 변경사항
git log main..HEAD --oneline       # 커밋 히스토리
```

### Step 2: 영향 범위 분석

**⚠️ 필수: PR 작성 전 다른 코드에 미치는 영향을 분석할 것**

분석 항목:
- **API 변경**: Input/Output 스키마 변경 시 호출하는 클라이언트 코드 확인
- **타입 변경**: 공유 타입 변경 시 사용처 전체 확인
- **컴포넌트 Props 변경**: 해당 컴포넌트를 사용하는 모든 곳 확인
- **유틸/헬퍼 함수 변경**: import하는 모든 파일 확인
- **Entity/Schema 변경**: Repository, Service, Migration 영향 확인

```bash
# 변경된 export를 사용하는 파일 검색
grep -r "import.*변경된함수명" --include="*.ts" --include="*.tsx"

# 변경된 타입/인터페이스 사용처 검색
grep -r "변경된타입명" --include="*.ts" --include="*.tsx"
```

### Step 3: PR 본문 작성

```markdown
## Summary

- **핵심 변경 1**: 간단한 설명
- **핵심 변경 2**: 간단한 설명
- **핵심 변경 3**: 간단한 설명

## 주요 변경사항

### Backend API (해당시)

**엔드포인트명:**
```typescript
// Input
{ field: type }

// Output
{ field: type }
```

### Frontend (해당시)

**컴포넌트/페이지 설명:**
- 주요 기능 1
- 주요 기능 2

**페이지 구조:** (복잡한 UI의 경우)
```
┌─────────────────────────────────┐
│ 섹션 1                          │
├─────────────────────────────────┤
│ 섹션 2                          │
└─────────────────────────────────┘
```

## 영향 범위

### Breaking Changes (해당시)
- 변경된 API/타입과 영향받는 코드 목록

### 관련 파일
- 이 PR로 인해 수정이 필요할 수 있는 다른 파일들

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

### Step 4: PR 생성

```bash
# 브랜치 push
git push -u origin feature/branch-name

# PR 생성
gh pr create --base main --title "TYPE: 제목" --body "$(cat <<'EOF'
## Summary
...
EOF
)"
```

## 커밋 메시지 규칙

### 타입 (대문자)

| 타입 | 설명 | 예시 |
|-----|------|------|
| `FEAT` | 새 기능 | `FEAT: 주문서 작성 페이지 구현` |
| `FIX` | 버그 수정 | `FIX: 주문 번호 미정의 변수 버그 수정` |
| `REFACTOR` | 리팩토링 | `REFACTOR: className을 styled-components로 변경` |
| `DOCS` | 문서 작성/수정 | `DOCS: Claude 컨텍스트 문서 구조 재정리` |
| `STYLE` | 코드 스타일 (포맷팅) | `STYLE: ESLint 경고 수정` |
| `CHORE` | 빌드, 설정 변경 | `CHORE: dependencies 업데이트` |
| `TEST` | 테스트 추가/수정 | `TEST: 주문 생성 단위 테스트 추가` |

### 커밋 메시지 형식

```bash
git commit -m "$(cat <<'EOF'
TYPE: 제목 (한글, 50자 이내)

본문 (선택, 변경 이유나 상세 설명)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

### 좋은 커밋 메시지 예시

```
FEAT: 호텔 주문서 작성 페이지 구현

- HotelProductSection, UserInputSection 등 5개 섹션 컴포넌트
- FormProvider를 통한 폼 상태 관리
- orderNumber 기반 임시 주문 조회 API 연동

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

## PR 타입별 포맷

### Feature PR

```markdown
## Summary
- **새 기능**: 기능 설명

## 주요 변경사항
### Backend API
### Frontend

## 영향 범위
- 신규 기능이므로 기존 코드 영향 없음 / 또는 영향받는 코드 목록
```

### Bugfix PR

```markdown
## Summary
- **버그 수정**: 문제 설명 및 해결 방법

## 원인 분석
- 문제 원인 설명

## 수정 내용
- 변경 사항

## 영향 범위
- 수정으로 인해 영향받을 수 있는 관련 기능
```

### Refactor PR

```markdown
## Summary
- **리팩토링**: 변경 목적

## 변경 사항
- 변경 전/후 비교

## 영향 범위
- 리팩토링으로 인해 변경된 인터페이스/타입 사용처
```

### Docs PR

```markdown
## Summary
- 문서 변경 요약

## 주요 변경사항
- 추가/수정된 문서 목록
```

## 영향 범위 분석 체크리스트

PR 작성 시 반드시 확인:

| 변경 유형 | 확인 사항 |
|----------|----------|
| **API Output 변경** | 프론트엔드에서 해당 API 호출하는 모든 곳 |
| **API Input 변경** | 해당 API를 호출하는 mutation/query 사용처 |
| **공유 타입 변경** | `packages/api-types` 사용하는 모든 앱 |
| **Entity 컬럼 변경** | Repository 쿼리, Service 로직, Migration |
| **컴포넌트 Props 변경** | 해당 컴포넌트 import하는 모든 파일 |
| **유틸 함수 시그니처 변경** | 함수 호출하는 모든 곳 |
| **환경 변수 추가** | `.env.example`, 배포 환경 설정 |

## PR 생성 전 체크리스트

- [ ] `yarn lint` 통과
- [ ] `yarn build` 성공
- [ ] 커밋 메시지 규칙 준수
- [ ] Summary가 변경 내용을 명확히 설명
- [ ] 영향 범위 분석 완료
- [ ] Breaking change 명시 (해당시)
