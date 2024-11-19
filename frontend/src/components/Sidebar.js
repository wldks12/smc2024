import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ userEmail, setUserEmail, apiUrl }) => {

  // useEffect 훅을 사용하여 컴포넌트가 마운트될 때 userEmail 설정
  useEffect(() => {
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
        console.error('사용자 데이터 가져오기 오류:', error);
        setUserEmail('guest');
      }
    };

    fetchUserData();
  }, [apiUrl, setUserEmail]);

  // 로그아웃 함수
  const handleLogout = async () => {
    try {
      console.log(`${apiUrl}`);
      // 서버에 로그아웃 요청 보내기
      const response = await fetch(`${apiUrl}/logout`, {
        method: 'POST',
        credentials: 'include', // 쿠키 포함
      });

      if (response.ok) {
        setUserEmail('guest'); // 로그아웃 시 이메일을 "guest"로 설정
        alert('로그아웃 되었습니다.');
      } else {
        alert('로그아웃에 실패했습니다.');
      }
    } catch (error) {
      console.error('로그아웃 오류:', error);
      alert('로그아웃 중 오류가 발생했습니다.');
    }
  };

  // 접속 계정 설정: 로그인하지 않은 경우 "guest"로 표시
  const username = userEmail === 'guest' ? 'guest' : userEmail;

  return (
    <div className="sidebar">
      <h3>메뉴</h3>
      <p>접속 계정: {username}</p> {/* 접속 계정 표시 */}
      {userEmail !== 'guest' && (
        <button className="logout-button" onClick={handleLogout}>
          로그아웃
        </button>
      )}
      <ul>
        <li><Link to="/dashboard">대시보드</Link></li>
        <li><Link to="/board">게시판</Link></li>
        <li><Link to="/login">로그인</Link></li>
        <li><Link to="/signup">회원가입</Link></li>
      </ul>
    </div>
  );
};

export default Sidebar;
