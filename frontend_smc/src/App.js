import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './style.css'; // CSS 파일 import

function App() {
    return (
        <Router>
            <Main /> {/* 헤더와 네비게이션은 항상 표시 */}
        </Router>
    );
}

function Main() {
    return (
        <div>
            <Header />
            <Nav />
            <Routes>
                <Route path="/" element={<Slider />} />
                <Route path="/board" element={<Board />} />
            </Routes>
        </div>
    );
}

function Header() {
    return (
        <header>
            <div className="logo">
                <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                    SAMSUNG
                </Link>
            </div>
        </header>
    );
}


function Nav() {
    const [showModal, setShowModal] = useState(false);

    const openModal = () => setShowModal(true); // 로그인 모달 열기
    const closeModal = () => setShowModal(false); // 로그인 모달 닫기

    return (
        <>
            <nav>
                <ul>
                    <li><a href="#none">인기상품</a></li>
                    <li><a href="#none">삼성가전</a></li>
                    <li><a href="#none">충전선/이어폰</a></li>
                    <li><a href="#none">추천상품</a></li>
                    <li><button className="login-btn" onClick={openModal}>로그인</button></li>
                    <li><Link to="/board">게시판</Link></li>
                </ul>
            </nav>
            {showModal && <LoginModal closeModal={closeModal} />}
        </>
    );
}

function LoginModal({ closeModal }) {
    const [isSignUp, setIsSignUp] = useState(false); // 회원가입/로그인 전환 상태
    const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 성공 상태
    const [isSignedUp, setIsSignedUp] = useState(false); // 회원가입 성공 상태

    const toggleSignUp = () => setIsSignUp((prev) => !prev);

    const handleLogin = (e) => {
        e.preventDefault(); // 기본 폼 제출 방지
        setIsLoggedIn(true); // 로그인 성공 상태로 변경
        setTimeout(() => {
            closeModal(); // 2초 후 모달 닫기
        }, 2000);
    };

    const handleSignUp = (e) => {
        e.preventDefault(); // 기본 폼 제출 방지
        setIsSignedUp(true); // 회원가입 성공 상태로 변경
        setTimeout(() => {
            toggleSignUp(); // 회원가입 완료 후 로그인 화면으로 전환
        }, 2000);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-btn" onClick={closeModal}>X</button>
                {isLoggedIn ? (
                    <div>
                        <h2>로그인 성공!</h2>
                    </div>
                ) : isSignedUp ? (
                    <div>
                        <h2>회원가입 성공!</h2>
                    </div>
                ) : isSignUp ? (
                    <div>
                        <h2>회원가입</h2>
                        <form onSubmit={handleSignUp}>
                            <input type="text" placeholder="이름" required />
                            <input type="email" placeholder="이메일" required />
                            <input type="password" placeholder="비밀번호" required />
                            <button type="submit">회원가입</button>
                        </form>
                        <p>
                            이미 계정이 있으신가요?{' '}
                            <button className="switch-btn" onClick={toggleSignUp}>로그인</button>
                        </p>
                    </div>
                ) : (
                    <div>
                        <h2>로그인</h2>
                        <form onSubmit={handleLogin}>
                            <input type="email" placeholder="이메일" required />
                            <input type="password" placeholder="비밀번호" required />
                            <button type="submit">로그인</button>
                        </form>
                        <p>
                            계정이 없으신가요?{' '}
                            <button className="switch-btn" onClick={toggleSignUp}>회원가입</button>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}



function Slider() {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 3000); // 3초마다 이미지 변경
        return () => clearInterval(interval);
    }, []);

    const images = [
        "/img/unnamed1.png",
        "/img/unnamed2.png",
        "/img/unnamed3.png",
    ];

    return (
        <div className="slide">
            <div
                className="slid"
                style={{
                    transform: `translateX(-${currentIndex * 100}%)`,
                }}
            >
                {images.map((image, index) => (
                    <img key={index} src={image} alt={`Slide ${index + 1}`} className="slide-item" />
                ))}
            </div>
        </div>
    );
}

function Board() {
    const [posts, setPosts] = useState([]); // 게시글 목록 상태
    const [newPost, setNewPost] = useState(""); // 새 글 내용 상태

    const handlePostSubmit = (e) => {
        e.preventDefault();
        if (newPost.trim() === "") return; // 공백 방지
        setPosts([...posts, newPost]); // 새 글 추가
        setNewPost(""); // 입력창 초기화
    };

    return (
        <div className="board">
            <h1>게시판</h1>
            <form onSubmit={handlePostSubmit} className="post-form">
                <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="새 글을 작성하세요"
                    rows="4"
                ></textarea>
                <button type="submit">등록</button>
            </form>
            <div className="post-list">
                {posts.map((post, index) => (
                    <div key={index} className="post-item">
                        <div className="post-header">
                            <span className="post-title">익명 {index + 1} 님</span>
                            <span className="post-date">{new Date().toLocaleString()}</span>
                        </div>
                        <p className="post-content">{post}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default App;