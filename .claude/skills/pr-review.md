---
name: pr-review
description: Systematic PR (Pull Request) code review with structured checklist approach. Use when reviewing GitHub/GitLab PR diffs, code changes, merge requests, or when user asks to review code changes with phrases like "review this PR", "check this code change", "review my merge request", or provides diff/patch content.
---

# PR Review Skill

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
