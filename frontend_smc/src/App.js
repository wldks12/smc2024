import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './style.css'; // CSS 파일 import

function App() {
    return (
        <Router>
            <Main />
        </Router>
    );
}

function Main() {
    return (
        <div>
            <Header />
            <Nav />
            <Routes>
                <Route path="/" element={<ImageDisplay />} />
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
    const [showModal, setShowModal] = React.useState(false);

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
    const [isSignUp, setIsSignUp] = React.useState(false);
    const [isLoggedIn, setIsLoggedIn] = React.useState(false);
    const [isSignedUp, setIsSignedUp] = React.useState(false);

    const toggleSignUp = () => setIsSignUp((prev) => !prev);

    const handleLogin = (e) => {
        e.preventDefault();
        setIsLoggedIn(true);
        setTimeout(() => {
            closeModal();
        }, 2000);
    };

    const handleSignUp = (e) => {
        e.preventDefault();
        setIsSignedUp(true);
        setTimeout(() => {
            toggleSignUp();
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

function ImageDisplay() {
    const [selectedOption, setSelectedOption] = React.useState(""); // 구매 옵션 상태 관리

    const handleOptionChange = (e) => {
        setSelectedOption(e.target.value);
    };

    const handlePurchase = () => {
        if (selectedOption === "") {
            alert("구매 옵션을 선택해주세요!");
        } else {
            alert(`"${selectedOption}" 옵션이 선택되었습니다. 구매 페이지로 이동합니다.`);
            // 구매 페이지로 이동하는 로직 추가 가능
        }
    };

    return (
        <div className="image-container">
            <img src="/img/unnamed2.png" alt="Samsung Galaxy S24+" />
            <div className="product-info">
                <h1>Galaxy S24+</h1>
                <p>차세대 스마트폰의 혁신을 경험하세요. 더 나은 성능과 디자인을 제공합니다.</p>
                <div className="purchase-options">
                    <label htmlFor="options">구매 옵션:</label>
                    <select
                        id="options"
                        value={selectedOption}
                        onChange={handleOptionChange}
                    >
                        <option value="">옵션을 선택하세요</option>
                        <option value="128GB">128GB - ₩1,000,000</option>
                        <option value="256GB">256GB - ₩1,200,000</option>
                        <option value="512GB">512GB - ₩1,400,000</option>
                    </select>
                </div>
                <div className="cta-buttons">
                    <button className="details-btn">자세히 보기</button>
                    <button className="buy-btn" onClick={handlePurchase}>
                        구매하기
                    </button>
                </div>
            </div>
        </div>
    );
}


function Board() {
    const [posts, setPosts] = React.useState([]);
    const [newPost, setNewPost] = React.useState("");

    const handlePostSubmit = (e) => {
        e.preventDefault();
        if (newPost.trim() === "") return;
        setPosts([...posts, newPost]);
        setNewPost("");
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
