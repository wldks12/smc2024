const express = require('express');
const oracledb = require('oracledb');
const app = express();
const port = 3000;

// Oracle Instant Client 초기화
try {
  oracledb.initOracleClient({ libDir: 'd:\\instantclient_11_2' });
  console.log('Oracle Instant Client가 정상적으로 설정되었습니다.');
} catch (err) {
  console.error('Oracle Instant Client 설정 오류:', err);
  process.exit(1); // 오류 발생 시 애플리케이션 종료
}

// Oracle 데이터베이스 연결 설정
const dbConfig = {
  user: 'test',           // Oracle DB 사용자명
  password: '1234',          // Oracle DB 비밀번호
  connectString: '127.0.0.1/XE' // Oracle DB 연결 문자열
};
// Oracle 데이터베이스에서 데이터를 조회하는 API 엔드포인트
app.get('/member', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      `SELECT * FROM member_tbl_02`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    // 쿼리 결과를 콘솔에 출력
    console.log('Query result:', result.rows);

    // 쿼리 결과를 클라이언트에 JSON 형식으로 응답
    res.json(result.rows);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).send(`Error fetching data: ${err.message}`);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
});

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
