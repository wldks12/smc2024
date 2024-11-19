// UserContext.js
import React, { createContext, useState } from 'react';

// UserContext 생성
export const UserContext = createContext();

// UserProvider 컴포넌트 정의
export const UserProvider = ({ children }) => {
  const [userEmail, setUserEmail] = useState('guest'); // 기본값 "guest"

  return (
    <UserContext.Provider value={{ userEmail, setUserEmail }}>
      {children} {/* 모든 하위 컴포넌트에 컨텍스트를 제공 */}
    </UserContext.Provider>
  );
};
