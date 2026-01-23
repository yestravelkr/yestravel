#!/bin/bash

# .claude/hooks/generate-context-after-task.sh

echo "✅ [Hook] Context 생성 프로토콜 실행됨"

cat << 'EOF'
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTEXT GENERATION PROTOCOL (작업 완료 후)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

이번 작업에서 새로 알게 된 정보가 있다면 아래 기준에 따라 저장하세요.

---

저장 기준:

1. **도메인 지식** → `.claude/context/domain/`에 저장
   - 비즈니스 로직 (예: "상품 결제 시 Order → Payment 순서로 생성")
   - 동작 방식 (예: "예약 상품은 날짜별 재고를 체크한다")
   - 엔티티 관계 (예: "TravelProduct는 Product를 상속받는다")
   - 용어 정의 (예: "가상재고 = 예약 가능한 수량")

2. **개발 패턴** (무엇을 하는지) → `.claude/context/`에 저장
   - 기존 구현 방식 설명 (예: "결제 모듈은 토스페이먼츠 API를 사용")
   - 아키텍처 결정 (예: "STI 패턴으로 Product 상속 구조 구현")
   - 기술 스택 활용법 (예: "tRPC + NestJS 하이브리드 구조")

3. **개발 방법** (어떻게 하는지) → `.claude/skills/`에 저장
   - 새 모듈 생성 절차
   - 코딩 컨벤션, 체크리스트
   - 반복되는 작업 패턴

---

저장 형식:

파일명: `{주제}.md` (kebab-case)
위치:
  - 도메인 지식 → `.claude/context/domain/{주제}.md`
  - 개발 패턴 → `.claude/context/{카테고리}/{주제}.md`
  - 개발 방법 → `.claude/skills/{skill-name}/{주제}.md`

템플릿:
```markdown
---
title: {제목}
estimated_tokens: ~{예상 토큰}
---

# {제목}

## 요약
{한 줄 요약}

## 상세
{상세 내용}

## 관련 파일
- `path/to/file.ts`
```

---

체크리스트:

- [ ] 이번 작업에서 새로 알게 된 도메인 지식이 있는가?
- [ ] 기존 context 문서에 없는 개발 패턴을 발견했는가?
- [ ] 반복 가능한 작업 절차를 skills로 문서화할 필요가 있는가?

위 항목 중 하나라도 YES라면, 해당 내용을 적절한 위치에 저장하세요.
저장할 내용이 없다면 이 메시지를 무시하세요.

EOF
