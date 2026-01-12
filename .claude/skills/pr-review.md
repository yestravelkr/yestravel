---
name: pr-review
description: PR 코드 리뷰 스킬. GitHub PR 리뷰, 코드 변경 검토, 머지 리퀘스트 확인 시 사용.
estimated_tokens: ~400
---

# PR Review Skill

> 체크리스트 참조: `.claude/skills/fe-checklist.md`, `.claude/skills/be-checklist.md`

Systematic Pull Request review using checklist methodology.

## Review Workflow

### Step 1: Generate Review Plan

```markdown
## PR Review Plan

- [ ] **Understand PR scope**
  - Purpose:
  - Expected behavior change:

- [ ] **Review by file**
  - [ ] `file1.ts` - description
  - [ ] `file2.tsx` - description

- [ ] **Implementation quality**
  - [ ] Logic correctness
  - [ ] Error handling
  - [ ] Edge cases
  - [ ] Type safety

- [ ] **Best practices**
  - [ ] Maintainability
  - [ ] Performance
  - [ ] Security

- [ ] **Integration**
  - [ ] Breaking changes
  - [ ] API contracts

- [ ] **Documentation**
  - [ ] Comments accuracy
```

### Step 2: Execute Review

- Mark completed items with `[x]`
- Add inline comments for issues
- Categorize by severity

### Step 3: Output Summary

```markdown
## Summary: ✅ Approved / ⚠️ Changes Requested / ❌ Blocked

### 🔴 Critical (Must Fix)
### 🟡 Suggestions (Nice to Have)
### 🔵 Questions
### 🟢 Highlights
```

## Focus by PR Type

| Type | Focus Areas |
|------|-------------|
| Feature | Logic, tests, docs |
| Bugfix | Root cause, regression |
| Refactor | Behavior preservation, performance |
| Config | Security, environment compatibility |
| Dependency | Breaking changes, security vulnerabilities |

## Tech-Specific Checklists

Reference appropriate checklist based on PR content:

- **Frontend**: `.claude/skills/fe-checklist.md`
- **Backend**: `.claude/skills/be-checklist.md`
