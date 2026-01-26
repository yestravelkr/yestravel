module.exports = {
  name: '여기는 development.js 입니다.',
  envPrefix: 'D', // 개발 환경
  cors: {
    origin: (origin, callback) => {
      // 허용할 도메인 목록
      const allowedOrigins = [
        'http://localhost:5173', // 백오피스 개발 서버
        'http://localhost:3001', // 기타 프론트엔드 개발 서버
        'http://localhost:3000', // 동일 origin
      ];
      
      // *.dev.yestravel.co.kr 및 dev.yestravel.co.kr 패턴 매칭
      const devPattern = /^https?:\/\/([a-zA-Z0-9-]+\.)?dev\.yestravel\.co\.kr$/;
      
      // origin이 없는 경우 (같은 origin 요청, Postman 등)
      if (!origin) {
        return callback(null, true);
      }
      
      // ALB를 통한 요청의 경우 IP 주소가 올 수 있음 (http://43.200.138.237 등)
      // 이 경우 모든 IP 요청을 허용 (내부 ALB를 통한 요청으로 간주)
      const ipPattern = /^https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$/;
      if (ipPattern.test(origin)) {
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
