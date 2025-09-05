module.exports = {
  name: '여기는 development.js 입니다.',
  cors: {
    origin: (origin, callback) => {
      // 허용할 도메인 목록
      const allowedOrigins = [
        'http://localhost:5173', // 백오피스 개발 서버
        'http://localhost:3001', // 기타 프론트엔드 개발 서버
        'http://localhost:3000', // 동일 origin
      ];
      
      // *.dev.yestravel.co.kr 패턴 매칭
      const devPattern = /^https?:\/\/[a-zA-Z0-9-]+\.dev\.yestravel\.co\.kr$/;
      
      // origin이 없는 경우 (같은 origin 요청)
      if (!origin) {
        return callback(null, true);
      }
      
      // 허용 목록에 있거나 dev 패턴과 일치하는 경우
      if (allowedOrigins.includes(origin) || devPattern.test(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Not allowed by CORS ${origin}`));
      }
    },
    credentials: true
  }
};
