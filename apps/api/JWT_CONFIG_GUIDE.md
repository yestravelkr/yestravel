# JWT 설정 가이드

## 개요
3개의 프론트엔드 애플리케이션(backoffice, store, influencer)별로 독립적인 JWT 토큰 설정을 제공합니다.

## 환경변수 설정

### Production (default.js)
```bash
# Backoffice JWT 설정
JWT_BACKOFFICE_ACCESS_SECRET=your_backoffice_access_secret
JWT_BACKOFFICE_REFRESH_SECRET=your_backoffice_refresh_secret

# Store JWT 설정  
JWT_STORE_ACCESS_SECRET=your_store_access_secret
JWT_STORE_REFRESH_SECRET=your_store_refresh_secret

# Influencer JWT 설정
JWT_INFLUENCER_ACCESS_SECRET=your_influencer_access_secret
JWT_INFLUENCER_REFRESH_SECRET=your_influencer_refresh_secret
```

### 각 앱별 토큰 유효기간
- **Backoffice**: Access 1시간, Refresh 30일
- **Store**: Access 2시간, Refresh 7일  
- **Influencer**: Access 4시간, Refresh 14일

## 사용법

### 코드에서 JWT 설정 접근
```typescript
import { ConfigProvider } from '@src/config';

// Backoffice JWT
const backofficeAccess = ConfigProvider.auth.jwt.backoffice.access;
const backofficeRefresh = ConfigProvider.auth.jwt.backoffice.refresh;

// Store JWT
const storeAccess = ConfigProvider.auth.jwt.store.access;
const storeRefresh = ConfigProvider.auth.jwt.store.refresh;

// Influencer JWT
const influencerAccess = ConfigProvider.auth.jwt.influencer.access;
const influencerRefresh = ConfigProvider.auth.jwt.influencer.refresh;
```

### 새로운 앱의 Auth Service 예시
```typescript
// store.auth.service.ts
const accessToken = jwtService.sign(payload, ConfigProvider.auth.jwt.store.access);
const refreshToken = jwtService.sign(payload, ConfigProvider.auth.jwt.store.refresh);

// influencer.auth.service.ts  
const accessToken = jwtService.sign(payload, ConfigProvider.auth.jwt.influencer.access);
const refreshToken = jwtService.sign(payload, ConfigProvider.auth.jwt.influencer.refresh);
```

### 새로운 앱의 Auth Middleware 예시
```typescript
// store.auth.middleware.ts
adminPayload = jwtService.verify(token, ConfigProvider.auth.jwt.store.access);

// influencer.auth.middleware.ts
adminPayload = jwtService.verify(token, ConfigProvider.auth.jwt.influencer.access);
```

## 보안 고려사항
- 각 앱별로 서로 다른 secret을 사용하여 토큰 격리
- 앱 특성에 맞는 토큰 유효기간 설정
- Production 환경에서는 강력한 secret 키 사용 필수