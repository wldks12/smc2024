const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();

app.use(cookieParser()); // 쿠키 파서 미들웨어 설정
app.set('view engine', 'ejs'); // EJS 템플릿 엔진 설정
app.set('views', './views'); // 템플릿 파일 경로

app.get('/', (req, res) => {
    let username = req.cookies.username;
    let count = parseInt(req.cookies.count) || 0;
    if (!username) {
        // 이름이 없을 때 사용자에게 이름을 입력받음
        username = '세명컴고';
        count = 1;

        res.cookie('username', username, { maxAge: 365 * 24 * 3600 * 1000 }); // 1년간 쿠키 유지
    } else {
        count += 1; // 방문 횟수 증가
    }

    // 방문 횟수를 쿠키에 저장
    res.cookie('count', count, { maxAge: 365 * 24 * 3600 * 1000 });

    // EJS 템플릿 렌더링
    res.render('index', { username, count });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
