const express = require('express');
const oracledb = require('oracledb');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const cors = require('cors'); // Import the cors package
const dbConfig = require('./dbConfig');

// Oracle Instant Client 초기화 (Thick 모드 사용)
oracledb.initOracleClient({ libDir: 'D:\\instantclient_11_2' }); // Windows 경로
// oracledb.initOracleClient({ libDir: '/opt/oracle/instantclient' }); // Linux/Mac 경로

const app = express();
const PORT = 3000;
const SECRET_KEY = 'SMC2024'; // JWT 서명용 비밀 키

// Enable CORS
app.use(cors({
  origin: 'http://localhost:3001', // 클라이언트 도메인 (React 앱의 도메인)
  credentials: true, // 쿠키와 인증 정보 포함
}));

app.use(express.json());
app.use(cookieParser());

// 데이터베이스 연결 풀 설정
oracledb.createPool(dbConfig)
  .then(pool => {
    console.log('Oracle DB 연결 풀 생성 완료');
    app.locals.pool = pool;
  })
  .catch(err => {
    console.error('Oracle DB 연결 풀 생성 실패:', err);
    process.exit(1);
  });

// 사용자 로그인
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const pool = req.app.locals.pool;

  try {
    const connection = await pool.getConnection();
    const result = await connection.execute(
      `SELECT id, name, email, password FROM users WHERE email = :email`,
      { email }
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: '이메일 또는 비밀번호가 잘못되었습니다.' });
    }

    // 데이터베이스에서 가져온 사용자의 정보
    const [id, name, emailFetched, hashedPassword] = result.rows[0];

    // 비밀번호 검증
    const isPasswordValid = await bcrypt.compare(password, hashedPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ message: '이메일 또는 비밀번호가 잘못되었습니다.' });
    }

    const token = jwt.sign({ id, name, email: emailFetched }, SECRET_KEY, {
      expiresIn: '1h' // 토큰 만료 시간 설정 (1시간)
    });

    // 토큰을 쿠키에 저장
    res.cookie('token', token, { httpOnly: true, secure: true, maxAge: 3600000  }); // 1시간 동안 유효
    res.json({ message: '로그인 성공', token });

    connection.close();
  } catch (err) {
    res.status(500).json({ message: '로그인 중 오류 발생', error: err.message });
  }
});

// 인증 미들웨어
function authenticateToken(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: '인증이 필요합니다.' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: '잘못된 토큰입니다.' });
    req.user = user;
    next();
  });
}

// 사용자 생성 (회원가입)
app.post('/users', async (req, res) => {
  const { name, email, password } = req.body;
  const pool = req.app.locals.pool;

  try {
    const hashedPassword = await bcrypt.hash(password, 10); // 비밀번호 해시 (10은 saltRounds)

    const connection = await pool.getConnection();
    const result = await connection.execute(
      `INSERT INTO users (id, name, email, password) VALUES (users_seq.NEXTVAL, :name, :email, :password)`,
      { name, email, password: hashedPassword },
      { autoCommit: true }
    );

    res.status(201).json({ id: result.lastRowid, name, email });
    connection.close();
  } catch (err) {
    res.status(500).json({ message: '사용자 생성 중 오류 발생', error: err.message });
  }
});

// 모든 사용자 조회
app.get('/users', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;

  try {
    const connection = await pool.getConnection();
    const result = await connection.execute(`SELECT id, name, email FROM users`);
    res.json(result.rows);
    connection.close();
  } catch (err) {
    res.status(500).json({ message: '사용자 조회 중 오류 발생', error: err.message });
  }
});

// 특정 사용자 조회
app.get('/users/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const pool = req.app.locals.pool;

  try {
    const connection = await pool.getConnection();
    const result = await connection.execute(
      `SELECT id, name, email FROM users WHERE id = :id`,
      { id: parseInt(id) }
    );
    if (result.rows.length === 0) {
      res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    } else {
      res.json(result.rows[0]);
    }
    connection.close();
  } catch (err) {
    res.status(500).json({ message: '사용자 조회 중 오류 발생', error: err.message });
  }
});

// 사용자 수정
app.put('/users/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, email, password } = req.body;
  const pool = req.app.locals.pool;

  try {
    const connection = await pool.getConnection();

    // 비밀번호가 제공된 경우에만 해시 처리
    let hashedPassword;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10); // 비밀번호 해시 (10은 saltRounds)
    }

    // 비밀번호가 제공되었는지에 따라 다른 쿼리 실행
    const result = await connection.execute(
      `UPDATE users SET 
        name = :name, 
        email = :email, 
        password = COALESCE(:password, password) 
       WHERE id = :id`,
      {
        id: parseInt(id),
        name,
        email,
        password: hashedPassword || null // null이면 기존 비밀번호 유지 
      },
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    } else {
      res.json({ message: '사용자가 수정되었습니다.' });
    }
    connection.close();
  } catch (err) {
    res.status(500).json({ message: '사용자 수정 중 오류 발생', error: err.message });
  }
});

// 사용자 삭제
app.delete('/users/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const pool = req.app.locals.pool;

  try {
    const connection = await pool.getConnection();
    const result = await connection.execute(
      `DELETE FROM users WHERE id = :id`,
      { id: parseInt(id) },
      { autoCommit: true }
    );
    if (result.rowsAffected === 0) {
      res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    } else {
      res.json({ message: '사용자가 삭제되었습니다.' });
    }
    connection.close();
  } catch (err) {
    res.status(500).json({ message: '사용자 삭제 중 오류 발생', error: err.message });
  }
});

// 게시판 게시글 생성
app.post('/boards', authenticateToken, async (req, res) => {
  const { title, link, content, keyword, user_id } = req.body;
  const pool = req.app.locals.pool;

  try {
    const connection = await pool.getConnection();
    const result = await connection.execute(
      `INSERT INTO boards (id, title, link, content, keyword, user_id, created_at) 
       VALUES (boards_seq.NEXTVAL, :title, :link, :content, :keyword, :user_id, DEFAULT)`,
      { title, link, content, keyword, user_id },
      { autoCommit: true }
    );
    res.status(201).json({ id: result.lastRowid, title, link, content, keyword, user_id });
    connection.close();
  } catch (err) {
    res.status(500).json({ message: '게시글 생성 중 오류 발생', error: err.message });
  }
});

// 모든 게시글 조회
app.get('/boards', async (req, res) => {
  const pool = req.app.locals.pool;

  try {
    const connection = await pool.getConnection();
    const result = await connection.execute(
      `SELECT id, title, link, content, keyword, user_id, created_at FROM boards order by created_at desc`
    );

    const rows = await Promise.all(
      result.rows.map(async (row) => {
        const [id, title, link, contentLob, keywordLob, user_id, created_at] = row;
        let content = '';
        let keyword = '';

        // CLOB 데이터 읽기
        if (contentLob) {
          contentLob.setEncoding('utf8');
          content = await new Promise((resolve, reject) => {
            let clobData = '';
            contentLob.on('data', (chunk) => (clobData += chunk));
            contentLob.on('end', () => resolve(clobData));
            contentLob.on('error', (err) => reject(err));
          });
        }

        if (keywordLob) {
          keywordLob.setEncoding('utf8');
          keyword = await new Promise((resolve, reject) => {
            let clobData = '';
            keywordLob.on('data', (chunk) => (clobData += chunk));
            keywordLob.on('end', () => resolve(clobData));
            keywordLob.on('error', (err) => reject(err));
          });
        }

        return { id, title, link, content, keyword, user_id, created_at };
      })
    );

    res.json(rows);
    connection.close();
  } catch (err) {
    res.status(500).json({ message: '게시글 조회 중 오류 발생', error: err.message });
  }
});


// 특정 게시글 조회
app.get('/boards/:id', async (req, res) => {
  const { id } = req.params;
  const pool = req.app.locals.pool;

  try {
    const connection = await pool.getConnection();
    const result = await connection.execute(
      `SELECT id, title, link, content, keyword, user_id, created_at FROM boards WHERE id = :id`,
      { id: parseInt(id) }
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    } else {
      const [row] = result.rows;
      const [id, title, link, contentLob, keywordLob, user_id, created_at] = row;
      let content = '';
      let keyword = '';

      // CLOB 데이터 읽기
      if (contentLob) {
        contentLob.setEncoding('utf8');
        content = await new Promise((resolve, reject) => {
          let clobData = '';
          contentLob.on('data', (chunk) => (clobData += chunk));
          contentLob.on('end', () => resolve(clobData));
          contentLob.on('error', (err) => reject(err));
        });
      }

      if (keywordLob) {
        keywordLob.setEncoding('utf8');
        keyword = await new Promise((resolve, reject) => {
          let clobData = '';
          keywordLob.on('data', (chunk) => (clobData += chunk));
          keywordLob.on('end', () => resolve(clobData));
          keywordLob.on('error', (err) => reject(err));
        });
      }

      res.json({ id, title, link, content, keyword, user_id, created_at });
    }
    connection.close();
  } catch (err) {
    res.status(500).json({ message: '게시글 조회 중 오류 발생', error: err.message });
  }
});


// 게시글 수정
app.put('/boards/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  const pool = req.app.locals.pool;

  try {
    const connection = await pool.getConnection();
    const result = await connection.execute(
      `UPDATE boards SET title = :title, content = :content WHERE id = :id`,
      { id: parseInt(id), title, content },
      { autoCommit: true }
    );
    if (result.rowsAffected === 0) {
      res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    } else {
      res.json({ message: '게시글이 수정되었습니다.' });
    }
    connection.close();
  } catch (err) {
    res.status(500).json({ message: '게시글 수정 중 오류 발생', error: err.message });
  }
});

// 게시글 삭제
app.delete('/boards/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const pool = req.app.locals.pool;

  try {
    const connection = await pool.getConnection();
    const result = await connection.execute(
      `DELETE FROM boards WHERE id = :id`,
      { id: parseInt(id) },
      { autoCommit: true }
    );
    if (result.rowsAffected === 0) {
      res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    } else {
      res.json({ message: '게시글이 삭제되었습니다.' });
    }
    connection.close();
  } catch (err) {
    res.status(500).json({ message: '게시글 삭제 중 오류 발생', error: err.message });
  }
});

// 날짜별 게시글 수 집계 API
app.get('/api/dashboard', async (req, res) => {
  const pool = req.app.locals.pool;
  
  try {
    const connection = await pool.getConnection();
    const result = await connection.execute(
      `SELECT TO_CHAR(created_at, 'YYYY-MM-DD') AS created_date, COUNT(*) AS count
       FROM boards
       GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD')
       ORDER BY created_date`
    );

    // 결과를 JSON 형태로 응답
    res.json(result.rows);
    connection.close();
  } catch (err) {
    res.status(500).json({ message: '데이터를 불러오는 중 오류 발생', error: err.message });
  }
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
