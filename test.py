import os
import requests
from bs4 import BeautifulSoup
from urllib.parse import quote
#import cx_Oracle
import json
import re

# Oracle Instant Client 경로 설정
##instant_client_path = "C:\\instantclient-basic-windows.x64-11.2.0.4.0\\instantclient_11_2"
#if os.name == "nt":  # Windows
#    cx_Oracle.init_oracle_client(lib_dir=instant_client_path)
#else:  # Linux/Unix/macOS
#    os.environ["LD_LIBRARY_PATH"] = instant_client_path

# Oracle 데이터베이스 연결 설정
#conn = cx_Oracle.connect("test", "1234", "127.0.0.1:1521/XE")
#cursor = conn.cursor()

# 키워드 추출 함수 (빈도수 없이 키워드만 추출)
def extract_keywords(title):
    words = re.findall(r'\b[가-힣a-zA-Z0-9]+\b', title)
    unique_words = list(set(words))  # 중복 제거
    keywords_json = json.dumps(unique_words, ensure_ascii=False)  # JSON 배열로 변환
    return keywords_json

# 회사명 설정 및 URL 인코딩
company = '삼성전자'
encoded_company = quote(company)

# 네이버 뉴스 검색 URL
url = "https://search.naver.com/search.naver?ssc=tab.news.all&where=news&sm=tab_jum&query=" + encoded_company

# 페이지 요청
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.75 Safari/537.36"
}
response = requests.get(url, headers=headers)
response.raise_for_status()  # 요청 실패 시 예외 발생


# HTML 파싱
soup = BeautifulSoup(response.text, "html.parser")

# 뉴스 기사 목록 가져오기
news_items = soup.select(".news_wrap.api_ani_send")

# 데이터 삽입 쿼리 (시퀀스를 사용하여 ID 자동 증가 및 user_id를 41로 고정)
insert_sql = """
INSERT INTO boards (id, title, link, content, keyword, user_id)
VALUES (boards_seq.NEXTVAL, :1, :2, :3, :4, 41)
"""

# 뉴스 제목, 링크, 내용 추출 및 데이터 삽입
for item in news_items:
    title_tag = item.select_one(".news_tit")
    if title_tag:
        title = title_tag.get_text()
        link = title_tag["href"]
        keyword = extract_keywords(title)
    else:
        title = "No Title"
        link = "No Link"
        keyword = "[]"  # 빈 JSON 배열

    # 내용 요약 추출
    content_tag = item.select_one(".dsc_txt_wrap")
    content = content_tag.get_text() if content_tag else "No Content"

    print(title, link, content, keyword)
    # Oracle 데이터베이스에 데이터 삽입
#    cursor.execute(insert_sql, (title, link, content, keyword))

#conn.commit()
#cursor.close()
#conn.close()
