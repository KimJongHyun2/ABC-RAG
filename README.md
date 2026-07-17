# YES24 IT/모바일 베스트셀러 RAG 분석 시스템

YES24 IT/모바일 종합 베스트셀러 데이터를 수집하고 분석하는 RAG(Retrieval-Augmented Generation) 기반 도서 추천 시스템입니다.

## 주요 기능

- **데이터 수집**: YES24 베스트셀러 페이지에서 도서 정보 크롤링
- **벡터 데이터베이스**: KLUE BERT 모델을 사용한 도서 임베딩 및 ChromaDB 저장
- **탐색적 데이터 분석(EDA)**: 가격, 평점, 리뷰 수 등 다양한 차트와 통계
- **키워드 검색**: 제목, 저자, 출판사별 도서 검색
- **도서 추천 챗봇**: Groq API와 Function Calling을 활용한 AI 도서 추천
- **엑셀 대시보드**: openpyxl을 사용한 인터랙티브 대시보드 생성

## 프로젝트 구조

```
ABC-RAG/
├── crawler.py                          # YES24 베스트셀러 크롤러
├── src/
│   ├── app.py                          # Streamlit 메인 앱 (EDA + 검색 + 챗봇)
│   ├── build_vectordb.py               # 벡터 데이터베이스 구축 스크립트
│   └── create_excel_dashboard.py       # 엑셀 대시보드 생성 스크립트
├── data/
│   ├── yes24_it_mobile_bestsellers.csv # 수집된 도서 데이터
│   └── chromadb/                       # 벡터 데이터베이스 저장소
├── .gitignore                          # Git 무시 규칙
├── requirements.txt                    # Python 의존성
└── README.md
```

## 설치 및 실행

### 1. 의존성 설치

```bash
pip install -r requirements.txt
```

### 2. 데이터 수집

```bash
python crawler.py
```

### 3. 벡터 데이터베이스 구축

```bash
python src/build_vectordb.py
```

### 4. Streamlit 앱 실행

```bash
streamlit run src/app.py
```

### 5. 엑셀 대시보드 생성

```bash
python src/create_excel_dashboard.py
```

## 데이터 필드

| 필드 | 설명 |
|------|------|
| Rank | 베스트셀러 순위 |
| Title | 도서 제목 |
| Author | 저자 |
| Publisher | 출판사 |
| Price | 가격 (원) |
| Rating | 평점 (10점 만점) |
| ReviewCount | 리뷰 수 |
| GoodsNo | YES24 상품 번호 |

## 기술 스택

- **웹 크롤링**: requests, BeautifulSoup
- **데이터 분석**: pandas, plotly
- **임베딩 모델**: KLUE BERT (klue/bert-base)
- **벡터 DB**: ChromaDB
- **LLM API**: Groq (Llama 3.3 70B)
- **웹 앱**: Streamlit
- **대시보드**: openpyxl

## API Key 설정

도서 추천 챗봇 기능을 사용하려면 [Groq Console](https://console.groq.com)에서 API Key를 발급받아 앱 실행 시 사이드바에 입력해야 합니다.

## 라이선스

이 프로젝트는 ABC캠프 교육 목적으로 제작되었습니다.
