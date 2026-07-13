# YES24 IT 모바일 종합 베스트 도서 전체 수집 계획

YES24의 IT 모바일 종합 베스트 도서 목록 전체를 실제 브라우저 요청인 것처럼 모방하여 `scrapling` 라이브러리를 사용해 수집하고, 수집한 데이터를 CSV 파일로 저장하는 구현 계획입니다.

## User Review Required

> [!NOTE]
> 브라우저 서브에이전트 점검 도중 Playwright 드라이버 다운로드 서버(404 에러) 이슈가 발생했으나, `scrapling` 라이브러리의 정적 `Fetcher` 및 `impersonate` 기능은 브라우저 드라이버(Playwright) 없이도 TLS 핑거프린트 우회가 가능하므로, 스크립트 기반 수집은 정상적으로 동작할 것입니다.
> 
> 파이썬 환경 제어는 요청하신 대로 `uv`를 사용해 로컬 가상환경을 생성하고 패키지를 설치하겠습니다.

## Proposed Changes

### [Crawler Script]

#### [NEW] [crawler.py](file:///c:/Users/jonghyun/github/ABC-RAG/crawler.py)
YES24 IT 모바일 베스트셀러 목록을 페이징 처리하여 스크래핑하고 CSV 파일로 저장하는 메인 파이썬 스크립트입니다.

* **수집 대상 URL**: `https://www.yes24.com/product/category/bestseller?categoryNumber=001001003&pageNumber={page}&pageSize=24`
* **사용 라이브러리**: `scrapling`, `pandas`
* **요청 기법**: `Fetcher(impersonate="chrome120")`을 통해 실제 Chrome 브라우저에서 요청하는 것처럼 TLS 핑거프린트 및 User-Agent를 모방합니다.
* **수집 데이터 항목**:
  - 순위 (Rank)
  - 제목 (Title)
  - 저자 (Author)
  - 출판사 (Publisher)
  - 판매가 (Price)
  - 평점 (Rating)
  - 리뷰 수 (ReviewCount)
  - 상품 번호 (GoodsNo)

* **추출용 CSS Selector**:
  - 도서 아이템: `li[data-goods-no]`
  - 순위: `em.ico.rank`
  - 제목: `a.gd_name`
  - 저자: `.info_auth a` 또는 `.info_auth` (텍스트 파싱)
  - 출판사: `.info_pub a` 또는 `.info_pub`
  - 판매가: `.info_price strong.txt_num em.yes_b`
  - 평점: `.rating_grade em.yes_b`
  - 리뷰 수: `.rating_rvCount .txC_blue`
  - 전체 페이지네이션 맨끝 페이지 번호: `.yesUI_pagen[data-search-type="page"] a.end` 의 `title` 속성

## Verification Plan

### Automated Tests
1. 가상환경 및 라이브러리 설치 실행:
   ```bash
   uv venv
   .venv\Scripts\activate
   uv pip install scrapling pandas
   ```
2. 크롤러 스크립트 실행 테스트:
   ```bash
   uv run python crawler.py
   ```
3. 결과물 CSV 파일 확인 (`yes24_it_mobile_bestsellers.csv`) 및 상위 5개 행 출력 검증.
