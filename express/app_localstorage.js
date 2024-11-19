const express = require('express');
const app = express();

// EJS 템플릿 엔진 설정
app.set('view engine', 'ejs');
app.set('views', './views'); // 템플릿 파일 경로 설정

// JSON 및 URL 인코딩된 데이터 처리 미들웨어
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// 라우터 설정
const indexRouter = require('./routes/index');
app.use('/', indexRouter);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
