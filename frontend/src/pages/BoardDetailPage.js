import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const BoardDetailPage = () => {
    const apiUrl = process.env.REACT_APP_API_BASE_URL; // 환경 변수에서 API URL 가져오기
    const { id } = useParams(); // URL에서 게시글 ID 가져오기
    const [board, setBoard] = useState(null); // 게시글 정보 상태
    const [users, setUsers] = useState({}); // 사용자 정보를 저장할 객체 상태
    const navigate = useNavigate(); // 페이지 이동을 위한 훅

    useEffect(() => {
        // 게시글 상세 정보를 가져오는 비동기 함수
        const fetchBoardDetail = async () => {
            try {
                // 게시글 정보를 가져오기
                const response = await fetch(`${apiUrl}/boards/${id}`);
                const data = await response.json();
                setBoard(data); // 게시글 정보 설정

                // 사용자 정보를 가져오기
                const usersResponse = await fetch(`${apiUrl}/users`);
                if (!usersResponse.ok) {
                    throw new Error(`사용자 정보를 가져오는 중 오류: ${usersResponse.statusText}`);
                }
                const usersData = await usersResponse.json();

                // 사용자 정보를 userId를 키로 하는 객체로 변환
                const usersMap = {};
                usersData.forEach(user => {
                    const [id, name] = user; // 배열에서 id와 name을 추출
                    usersMap[id] = name; // id를 키로 하고 name을 값으로 설정
                });

                setUsers(usersMap); // 사용자 정보를 상태에 저장

                // 디버깅: 데이터 확인
                console.log("Boards:", data);
                console.log("Users Map:", usersMap);
            } catch (err) {
                console.error('게시글 상세 정보를 가져오는 중 오류:', err);
            }
        };
        fetchBoardDetail(); // 함수 호출
    }, [apiUrl, id]);

    // CLOB 데이터를 배열로 파싱
    let keywords = [];
    if (board && typeof board.keyword === 'string') {
        try {
            keywords = JSON.parse(board.keyword); // JSON 문자열을 배열로 파싱
        } catch (err) {
            console.error('키워드 파싱 중 오류:', err);
        }
    }

    // 삭제 버튼 클릭 핸들러
    const handleDelete = async () => {
        try {
            const response = await fetch(`${apiUrl}/boards/${id}`, {
                method: 'DELETE',
                credentials: 'include', // 쿠키를 포함하여 전송
            });

            if (response.ok) {
                alert('게시글이 삭제되었습니다.');
                navigate('/'); // 삭제 후 메인 페이지로 이동
            } else {
                alert('게시글 삭제에 실패했습니다.');
            }
        } catch (err) {
            console.error('게시글 삭제 중 오류:', err);
            alert('삭제 중 오류가 발생했습니다.');
        }
    };

    if (!board) return <div>Loading...</div>; // 게시글이 로드되지 않았을 때 로딩 표시

    return (
        <div>
            <h2>제목 : {board.title}</h2>
            <p>작성일자 : {board.created_at}</p>
            <p>작성자 : {users[board.user_id] || '알 수 없음'}</p> {/* 작성자 이름 표시 */}
            <p>주소 : {board.link}</p>
            <p>내용 : {board.content}</p>
            <p>
                태그 : {Array.isArray(keywords)
                    ? keywords.map((word) => `#${word}`).join(' ')
                    : ''}
            </p>
            <button onClick={handleDelete}>삭제</button> {/* 삭제 버튼 */}
        </div>
    );
};

export default BoardDetailPage;
