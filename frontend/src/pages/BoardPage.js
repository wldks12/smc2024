import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BoardPage = () => {
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const [boards, setBoards] = useState([]);
    const [users, setUsers] = useState({}); // 사용자 정보를 저장할 객체
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBoards = async () => {
            try {
                // 게시글 가져오기
                const response = await fetch(`${apiUrl}/boards`);
                if (!response.ok) {
                    throw new Error(`Error fetching boards: ${response.statusText}`);
                }
                const data = await response.json();
                setBoards(data);

                // 사용자 정보를 가져오는 요청
                const usersResponse = await fetch(`${apiUrl}/users`);
                if (!usersResponse.ok) {
                    throw new Error(`Error fetching users: ${usersResponse.statusText}`);
                }
                const usersData = await usersResponse.json();

                // 사용자 정보를 userId를 키로 하는 객체로 변환
                const usersMap = {};
                usersData.forEach(user => {
                    const [id, name] = user; // 배열에서 id와 name을 추출
                    usersMap[id] = name;     // id를 키로 하고 name을 값으로 설정
                });

                setUsers(usersMap); // 사용자 정보를 상태에 저장

                // 디버깅: 데이터 확인
                console.log("Boards:", data);
                console.log("Users Map:", usersMap);
            } catch (err) {
                console.error('Error fetching boards or users:', err);
            }
        };

        fetchBoards();
    }, [apiUrl]);

    const handleCreateBoard = () => {
        navigate('/create-board');
    };

    const handleBoardClick = (id) => {
        navigate(`/boards/${id}`);
    };

    return (
        <div>
            <h2>Board</h2>
            <button onClick={handleCreateBoard}>글쓰기</button>
            <table>
                <thead>
                    <tr>
                        <th>번호</th>
                        <th>제목</th>
                        <th>작성자</th>
                        <th>작성일자</th>
                    </tr>
                </thead>
                <tbody>
                    {boards.map(board => (
                        <tr
                            key={board.id}
                            onClick={() => handleBoardClick(board.id)}
                            style={{ cursor: 'pointer' }}
                        >
                            <td>{board.id}</td>
                            <td>{board.title}</td>
                            <td>{users[board.user_id] || '알 수 없음'}</td> {/* 작성자 이름 표시 */}
                            <td>{new Date(board.created_at).toLocaleDateString()}</td> {/* 날짜 형식 조정 */}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default BoardPage;
