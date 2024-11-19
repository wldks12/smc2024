import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = ({ setUserEmail }) => { // props로 setUserEmail 받기
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      console.log('로그인 요청 중...');
      const response = await fetch(`${apiUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include' // 쿠키를 포함하여 요청
      });
      console.log('응답 상태:', response.status);

      const data = await response.json();
      console.log('응답 데이터:', data);

      if (response.ok) {
        setUserEmail(email); // React 상태만 업데이트
        alert('로그인 성공');
        navigate('/');
      } else {
        alert(data.message || '로그인에 실패했습니다.');
      }
    } catch (err) {
      console.error('로그인 오류:', err);
      alert('로그인 중 오류가 발생했습니다.');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default LoginPage;
