// App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Footer from './components/Footer';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import BoardPage from './pages/BoardPage';
import CreateBoardPage from './pages/CreateBoardPage';
import BoardDetailPage from './pages/BoardDetailPage';
import Dashboard from './pages/Dashboard';
import './App.css';

const App = () => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const [userEmail, setUserEmail] = useState('guest');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 토큰 검증을 위해 서버에 요청
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${apiUrl}/auth/validate-token`, {
          method: 'GET',
          credentials: 'include', // 쿠키를 포함하여 요청
        });

        if (response.ok) {
          const data = await response.json();
          setUserEmail(data.email); // 서버에서 반환된 이메일 설정
        } else {
          setUserEmail('guest'); // 인증 실패 시 guest로 설정
        }
      } catch (error) {
        console.error('토큰 검증 오류:', error);
        setUserEmail('guest');
      } finally {
        setIsLoading(false); // 로딩 상태 해제
      }
    };

    fetchUserData();
  }, [apiUrl]);

  if (isLoading) {
    return <div className="loading">로딩 중...</div>;
  }

  return (
    <Router>
      <div className="app">
        <Header />
        <div className="main-content">
          <Sidebar userEmail={userEmail} setUserEmail={setUserEmail} apiUrl={apiUrl} />
          <div className="content">
            <Routes>
              <Route path="/login" element={<LoginPage setUserEmail={setUserEmail} />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/board" element={<BoardPage />} />
              <Route path="/boards/:id" element={<BoardDetailPage />} />
              <Route path="/create-board" element={<CreateBoardPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/" element={<Dashboard />} />
            </Routes>
          </div>
        </div>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
