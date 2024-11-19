import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateBoardPage = () => {
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [link, setLink] = useState('');
    const [content, setContent] = useState('');
    const [keyword, setKeyword] = useState('');
    const [userId, setUserId] = useState(null);

    // useEffect 훅으로 서버에서 user_id 가져오기
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch(`${apiUrl}/auth/validate-token`, {
                    method: 'GET',
                    credentials: 'include', // 쿠키를 포함하여 요청
                });
                if (response.ok) {
                    const data = await response.json();
                    console.log("User Data:", data); // 디버깅용 로그
                    setUserId(data.id); // 서버에서 user_id를 가져와 설정
                } else {
                    setUserId(null);
                    alert('인증이 필요합니다. 다시 로그인해 주세요.');
                    navigate('/login'); // 인증 실패 시 로그인 페이지로 이동
                }
            } catch (error) {
                console.error('사용자 데이터 가져오기 오류:', error);
                setUserId(null);
                alert('사용자 정보를 가져오는 중 오류가 발생했습니다.');
                navigate('/login');
            }
        };

        fetchUserData();
    }, [apiUrl, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 키워드를 JSON 문자열로 변환
        const keywordForClob = JSON.stringify(keyword.split(',').map(kw => kw.trim()));

        if (!userId) {
            alert('사용자 정보가 없습니다. 다시 로그인해 주세요.');
            return;
        }

        // 전송되는 데이터 출력 (디버깅용)
        console.log(`제목: ${title}\n링크: ${link}\n내용: ${content}\n키워드: ${keywordForClob}\nUser ID: ${userId}`);

        try {
            const response = await fetch(`${apiUrl}/boards`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    link,
                    content,
                    keyword: keywordForClob,
                    user_id: userId,
                }),
                credentials: 'include'
            });

            if (response.ok) {
                alert('게시글이 성공적으로 작성되었습니다.');
                navigate('/board'); // 성공 시 게시글 목록 페이지로 이동
            } else if (response.status === 401 || response.status === 403) {
                alert('권한이 없습니다. 다시 로그인해 주세요.');
            } else {
                alert('게시글 작성에 실패했습니다.');
            }
        } catch (err) {
            console.error('Error creating board:', err);
            alert('게시글 작성 중 오류가 발생했습니다.');
        }
    };

    return (
        <div>
            <h2>글쓰기</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>제목:</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div>
                    <label>링크:</label>
                    <input type="text" value={link} onChange={(e) => setLink(e.target.value)} required />
                </div>
                <div>
                    <label>내용:</label>
                    <textarea value={content} onChange={(e) => setContent(e.target.value)} required></textarea>
                </div>
                <div>
                    <label>키워드 (쉼표로 구분):</label>
                    <input
                        type="text"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">작성하기</button>
            </form>
        </div>
    );
};

export default CreateBoardPage;
