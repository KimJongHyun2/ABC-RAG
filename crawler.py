"""YES24 IT 모바일 종합 베스트 도서 목록을 수집하여 CSV로 저장하는 모듈.

이 모듈은 Scrapling 라이브러리의 Fetcher를 사용하여 실제 Chrome 브라우저의 TLS 및 User-Agent를 모방해
YES24 베스트셀러 페이지의 데이터를 페이징 처리하며 스크래핑합니다.
수집된 데이터는 pandas를 활용하여 구조화한 후 CSV 파일로 내보냅니다.
"""

import time
import re
import pandas as pd
from scrapling import Fetcher

def clean_text(text: str) -> str:
    """텍스트의 불필요한 줄바꿈, 연속된 공백 및 양끝 공백을 제거한다.

    Args:
        text: 정리가 필요한 원본 텍스트 문자열.

    Returns:
        공백이 정리된 깨끗한 텍스트 문자열.
    """
    if not text:
        return ""
    # 연속된 공백과 개행 문자를 단일 공백으로 치환하여 데이터 일관성을 유지한다.
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def parse_book_item(item) -> dict:
    """도서 목록의 단일 항목(li 요소)에서 도서 정보를 파싱하여 딕셔너리로 반환한다.

    Args:
        item: scrapling의 Selector 객체로, 단일 도서 <li> 태그 요소를 나타냄.

    Returns:
        도서 정보가 포함된 딕셔너리. 포함 키:
        Rank, Title, Author, Publisher, Price, Rating, ReviewCount, GoodsNo.
    """
    # 상품 번호 (Yes24 상품 고유 ID)
    goods_no = item.css("::attr(data-goods-no)").get()
    
    # 베스트셀러 순위
    rank = item.css("em.ico.rank::text").get()
    if rank:
        rank = clean_text(rank)
        
    # 도서 제목
    title = item.css("a.gd_name::text").get()
    if title:
        title = clean_text(title)
        
    # 저자 정보 파싱 (저자가 여러 명일 경우 쉼표로 연결)
    authors = item.css(".info_auth a::text").getall()
    if authors:
        author = ", ".join([clean_text(a) for a in authors])
    else:
        author_text = item.css(".info_auth::text").get()
        author = clean_text(author_text) if author_text else ""
    
    # YES24 특유의 저자 표시 텍스트(" 저") 꼬리표를 정리한다.
    if author.endswith(" 저"):
        author = author[:-2].strip()
        
    # 출판사 정보
    publisher = item.css(".info_pub a::text").get()
    if not publisher:
        publisher = item.css(".info_pub::text").get()
    publisher = clean_text(publisher) if publisher else ""
    
    # 판매가 (금액 연산을 고려하여 숫자 문자열로 만들기 위해 쉼표 제거)
    price_text = item.css(".info_price strong.txt_num em.yes_b::text").get()
    price = clean_text(price_text).replace(",", "") if price_text else ""
    
    # 평점
    rating_text = item.css(".rating_grade em.yes_b::text").get()
    rating = clean_text(rating_text) if rating_text else ""
    
    # 리뷰 수 (텍스트 괄호 등 제외하고 숫자 부분만 남기기)
    review_text = item.css(".rating_rvCount .txC_blue::text").get()
    review_count = clean_text(review_text) if review_text else "0"
    
    return {
        "Rank": rank,
        "Title": title,
        "Author": author,
        "Publisher": publisher,
        "Price": price,
        "Rating": rating,
        "ReviewCount": review_count,
        "GoodsNo": goods_no
    }

def scrape_yes24_bestsellers() -> list[dict]:
    """YES24 IT 모바일 베스트셀러 목록 전체를 순회하며 도서 데이터를 스크래핑한다.

    첫 페이지에서 전체 페이지수를 자동으로 감지하고, 해당 수만큼 순회하며 데이터를 수집한다.
    요청 시 브라우저 모방 옵션을 활성화하며, 차단 방지를 위해 각 요청 사이에 대기 시간을 둔다.

    Returns:
        수집된 도서 정보 딕셔너리들의 리스트.
    """
    base_url = "https://www.yes24.com/product/category/bestseller?categoryNumber=001001003&pageNumber={page}&pageSize=24"
    
    # Stealth/Anti-bot 우회를 위해 Chrome TLS 및 User-Agent 헤더를 impersonate 모방 설정한다.
    fetcher = Fetcher(impersonate='chrome')
    
    print("첫 페이지 요청 중...")
    try:
        first_page = fetcher.get(base_url.format(page=1))
    except Exception as e:
        print(f"첫 페이지 요청 중 에러 발생: {e}")
        return []
        
    # 페이지네이션 마지막 페이지 버튼('맨끝')에서 총 페이지 수를 감지한다.
    end_page_attr = first_page.css(".yesUI_pagen[data-search-type='page'] a.end::attr(title)").get()
    if end_page_attr:
        try:
            total_pages = int(end_page_attr)
        except ValueError:
            total_pages = 42  # 파싱 오류 시 안전한 기본값으로 폴백한다.
    else:
        total_pages = 42
        
    print(f"감지된 전체 페이지 수: {total_pages}")
    
    all_books = []
    
    for page in range(1, total_pages + 1):
        print(f"페이지 {page} / {total_pages} 수집 중...")
        try:
            # 1페이지는 이미 요청한 데이터를 재사용하여 불필요한 요청을 최소화한다.
            if page == 1:
                page_data = first_page
            else:
                page_data = fetcher.get(base_url.format(page=page))
                
            items = page_data.css("li[data-goods-no]")
            if not items:
                # 더 이상 수집할 아이템이 없다면 루프를 즉시 종료하여 불필요한 네트워크 지연을 막는다.
                print(f"페이지 {page}에 책 데이터가 없습니다. 수집을 중단합니다.")
                break
                
            for item in items:
                book_data = parse_book_item(item)
                # 간혹 빈 템플릿 항목이 파싱되는 경우를 배제한다.
                if book_data["Title"]:
                    all_books.append(book_data)
                    
            print(f"페이지 {page} 완료 (누적 {len(all_books)}권)")
            
            # 서버 과부하를 방지하기 위해 요청 사이에 1초 대기한다.
            time.sleep(1.0)
            
        except Exception as e:
            print(f"페이지 {page} 수집 중 에러 발생: {e}")
            time.sleep(2.0)
            continue
            
    return all_books

if __name__ == "__main__":
    books = scrape_yes24_bestsellers()
    if books:
        df = pd.DataFrame(books)
        df = df[["Rank", "Title", "Author", "Publisher", "Price", "Rating", "ReviewCount", "GoodsNo"]]
        csv_filename = "yes24_it_mobile_bestsellers.csv"
        # Excel에서의 한글 깨짐을 방지하기 위해 utf-8-sig 인코딩으로 저장한다.
        df.to_csv(csv_filename, index=False, encoding="utf-8-sig")
        print(f"수집 완료! 총 {len(df)}개의 도서 정보를 '{csv_filename}'에 저장했습니다.")
    else:
        print("수집된 데이터가 없습니다.")
