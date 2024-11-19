import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // useNavigate 훅 가져오기

const SignUpPage = () => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // useNavigate 훅 사용

  const handleSignUp = async () => {
    // 입력 값 검증
    if (!name || !email || !password) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (response.ok) {
        alert('회원가입이 성공적으로 완료되었습니다.');
        navigate('/'); // 성공 시 '/' 경로로 이동
      } else {
        // 서버가 JSON 응답을 반환하지 않을 가능성 처리
        const data = await response.json().catch(() => null);
        const errorMessage = data ? data.message : '회원가입에 실패했습니다.';
        alert(`회원가입 실패: ${errorMessage}`);
      }
    } catch (err) {
      console.error('회원가입 오류:', err);
      alert('회원가입 중 오류가 발생했습니다.');
    }
  };

  return (
    <div>
      <h2>회원가입</h2>
      <div>
        <label>이름:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label>이메일:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label>비밀번호:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <button onClick={handleSignUp}>회원가입</button>
    </div>
  );
};

export default SignUpPage;
