const express = require('express');
const oracledb = require('oracledb');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const dbConfig = require('./dbConfig');

// Oracle Instant Client 초기화 (Thick 모드 사용)
oracledb.initOracleClient({ libDir: 'D:\\instantclient_11_2' }); // Windows 경로
// oracledb.initOracleClient({ libDir: '/opt/oracle/instantclient' }); // Linux/Mac 경로

const app = express();
const PORT = 3000;
const SECRET_KEY = 'SMC2024'; // JWT 서명용 비밀 키

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
      `SELECT id, name, email FROM users WHERE email = :email AND password = :password`,
      { email, password }
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: '이메일 또는 비밀번호가 잘못되었습니다.' });
    }

    const user = result.rows[0];
    const token = jwt.sign({ id: user.ID, name: user.NAME, email: user.EMAIL }, SECRET_KEY, {
      expiresIn: '1h' // 토큰 만료 시간 설정 (1시간)
    });

    // 토큰을 쿠키에 저장 (HTTP Only 옵션 설정)
    res.cookie('token', token, { httpOnly: true });
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

// 사용자 생성
app.post('/users', async (req, res) => {
  const { name, email, password } = req.body;
  const pool = req.app.locals.pool;

  try {
    const connection = await pool.getConnection();
    const result = await connection.execute(
      `INSERT INTO users (id, name, email, password) VALUES (users_seq.NEXTVAL, :name, :email, :password)`,
      { name, email, password },
      { autoCommit: true }
    );
    res.status(201).json({ id: result.lastRowid, name, email });
    connection.close();
  } catch (err) {
    res.status(500).json({ message: '사용자 생성 중 오류 발생', error: err.message });
  }
});

// 모든 사용자 조회
app.get('/users', async (req, res) => {
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
app.get('/users/:id', async (req, res) => {
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
app.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, password } = req.body;
  const pool = req.app.locals.pool;

  try {
    const connection = await pool.getConnection();
    const result = await connection.execute(
      `UPDATE users SET name = :name, email = :email, password = :password WHERE id = :id`,
      { id: parseInt(id), name, email, password },
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
app.delete('/users/:id', async (req, res) => {
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
app.post('/boards', async (req, res) => {
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
      `SELECT id, title, link, content, keyword, user_id, created_at FROM boards`
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
app.put('/boards/:id', async (req, res) => {
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
app.delete('/boards/:id', async (req, res) => {
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

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
