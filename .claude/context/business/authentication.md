---
name: authentication
description: 사용자 인증 관리 - 로그인 유지, 자동 토큰 갱신, 로그아웃
keywords: [인증, 로그인, 로그아웃, 토큰, 갱신, refresh, access, auth]
---

# 인증 관리

## 목적

사용자가 한 번 로그인하면 세션이 자동으로 유지되도록 하고, 인증이 만료되면 투명하게 갱신하여 서비스 이용이 끊기지 않도록 한다.

## 핵심 기능

| 기능 | 설명 | 사용자 관점 |
|------|------|------------|
| 자동 토큰 갱신 | accessToken 만료 시 refreshToken으로 자동 갱신 | 로그인 상태가 끊기지 않고 유지됨 |
| 자동 로그아웃 | refreshToken 갱신 실패 시 즉시 로그아웃 | 인증 만료 시 로그인 페이지로 이동 |
| 동시 요청 처리 | 여러 API 호출이 동시에 401을 받아도 갱신 1회만 수행 | 페이지 전환 시 깜빡임 없이 정상 동작 |
| 서버 에러 재시도 | 일시적 서버 오류 시 자동 재시도 | 네트워크 불안정 시에도 안정적 사용 |

## 사용자 흐름

1. 사용자가 로그인 → accessToken + refreshToken 발급
2. API 호출 시 accessToken을 헤더에 포함하여 전송
3. accessToken 만료 (401 응답) → refreshToken으로 새 accessToken 자동 발급 → 원래 요청 재시도
4. refreshToken도 만료/실패 → 자동 로그아웃 → 로그인 페이지 이동

## 관련 Codebase Context

- [Shop tRPC Client](../codebase/shop-trpc-client.md)
