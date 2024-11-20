import React from 'react';
import './style.css'; // 작성한 CSS 파일을 import

function App() {
    return (
        <div>
            <Header />
            <Nav />
            <Slider />
        </div>
    );
}

function Header() {
    return (
        <header>
            <div className="logo">SAMSUNG</div>
        </header>
    );
}

function Nav() {
    return (
        <nav>
            <ul>
                <li><a href="#none">인기상품</a></li>
                <li><a href="#none">삼성가전</a></li>
                <li><a href="#none">충전선/이어폰</a></li>
                <li><a href="#none">추천상품</a></li>
                <li><a href="#none">로그인</a></li>
                <li><a href="#none">게시판</a></li>
            </ul>
        </nav>
    );
}

function Slider() {
    return (
        <div className="slid">
            <div className="slide-item">
                <img src="/img/unnamed1.png" alt="삼성 휴대폰2" />
                <img src="/img/unnamed2.png" alt="삼성 휴대폰3" />
                <img src="/img/unnamed3.png" alt="삼성 휴대폰4" />
            </div>
        </div>
    );
}

export default App;
