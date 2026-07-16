import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from pathlib import Path
from groq import Groq

st.set_page_config(page_title="YES24 IT 모바일 베스트셀러 대시보드", layout="wide")

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "yes24_it_mobile_bestsellers.csv"


@st.cache_data
def load_data():
    df = pd.read_csv(DATA_PATH)
    df.columns = df.columns.str.strip()
    if "Rating" in df.columns:
        df["Rating"] = pd.to_numeric(df["Rating"], errors="coerce")
    if "ReviewCount" in df.columns:
        df["ReviewCount"] = pd.to_numeric(df["ReviewCount"], errors="coerce")
    if "Price" in df.columns:
        df["Price"] = pd.to_numeric(df["Price"], errors="coerce")
    return df


df = load_data()

st.title("YES24 IT/모바일 베스트셀러 탐색적 데이터 분석")
st.markdown("---")

# ── 사이드바 ──
st.sidebar.header("설정")

groq_api_key = st.sidebar.text_input(
    "Groq API Key",
    type="password",
    placeholder="gsk_...",
    help="https://console.groq.com 에서 발급받은 API Key를 입력하세요.",
)

st.sidebar.header("필터")
min_rank, max_rank = st.sidebar.slider(
    "순위 범위", int(df["Rank"].min()), int(df["Rank"].max()),
    (int(df["Rank"].min()), int(df["Rank"].max())),
)
filtered = df[(df["Rank"] >= min_rank) & (df["Rank"] <= max_rank)]

publishers = st.sidebar.multiselect(
    "출판사 선택", sorted(df["Publisher"].dropna().unique().tolist()),
    default=[],
)
if publishers:
    filtered = filtered[filtered["Publisher"].isin(publishers)]

price_range = st.sidebar.slider(
    "가격 범위 (원)", int(df["Price"].min()), int(df["Price"].max()),
    (int(df["Price"].min()), int(df["Price"].max())),
)
filtered = filtered[(filtered["Price"] >= price_range[0]) & (filtered["Price"] <= price_range[1])]

# ── 탭 ──
tab_eda, tab_search, tab_chatbot = st.tabs(["탐색적 데이터 분석 (EDA)", "키워드 검색", "도서 추천 챗봇"])

# ═══════════════════════════════════════════
# TAB 1 – EDA
# ═══════════════════════════════════════════
with tab_eda:
    # ── 요약 통계 ──
    st.subheader("요약 통계")
    c1, c2, c3, c4 = st.columns(4)
    c1.metric("총 도서 수", len(filtered))
    c2.metric("평균 가격", f"{filtered['Price'].mean():,.0f}원")
    c3.metric("평균 평점", f"{filtered['Rating'].mean():.1f}")
    c4.metric("총 리뷰 수", f"{filtered['ReviewCount'].sum():,.0f}")
    st.markdown("")

    # ── 1행: 가격 분포 + 평점 분포 ──
    col_a, col_b = st.columns(2)
    with col_a:
        st.markdown("**가격 분포**")
        fig_price = px.histogram(
            filtered, x="Price", nbins=30, color_discrete_sequence=["#636EFA"],
            labels={"Price": "가격 (원)"},
        )
        fig_price.update_layout(height=350, margin=dict(t=10, b=10))
        st.plotly_chart(fig_price, use_container_width=True)

    with col_b:
        st.markdown("**평점 분포**")
        fig_rating = px.histogram(
            filtered.dropna(subset=["Rating"]), x="Rating", nbins=20,
            color_discrete_sequence=["#EF553B"],
            labels={"Rating": "평점"},
        )
        fig_rating.update_layout(height=350, margin=dict(t=10, b=10))
        st.plotly_chart(fig_rating, use_container_width=True)

    # ── 2행: 리뷰 수 Top 15 + 가격 vs 평점 산점도 ──
    col_c, col_d = st.columns(2)
    with col_c:
        st.markdown("**리뷰 수 Top 15 도서**")
        top_review = filtered.nlargest(15, "ReviewCount")
        fig_bar = px.bar(
            top_review, x="ReviewCount", y="Title", orientation="h",
            color="ReviewCount", color_continuous_scale="Blues",
            labels={"ReviewCount": "리뷰 수", "Title": ""},
        )
        fig_bar.update_layout(height=500, margin=dict(t=10, b=10), yaxis=dict(autorange="reversed"))
        st.plotly_chart(fig_bar, use_container_width=True)

    with col_d:
        st.markdown("**가격 vs 평점**")
        fig_scatter = px.scatter(
            filtered.dropna(subset=["Rating"]), x="Price", y="Rating",
            size="ReviewCount", color="Rating", hover_name="Title",
            color_continuous_scale="RdYlGn", labels={"Price": "가격 (원)", "Rating": "평점"},
        )
        fig_scatter.update_layout(height=500, margin=dict(t=10, b=10))
        st.plotly_chart(fig_scatter, use_container_width=True)

    # ── 3행: 출판사별 도서 수 (Top 15) + 리뷰 수 vs 가격 ──
    col_e, col_f = st.columns(2)
    with col_e:
        st.markdown("**출판사별 도서 수 (Top 15)**")
        pub_counts = filtered["Publisher"].value_counts().head(15).reset_index()
        pub_counts.columns = ["Publisher", "Count"]
        fig_pub = px.bar(
            pub_counts, x="Count", y="Publisher", orientation="h",
            color="Count", color_continuous_scale="Teal",
            labels={"Count": "도서 수", "Publisher": ""},
        )
        fig_pub.update_layout(height=500, margin=dict(t=10, b=10), yaxis=dict(autorange="reversed"))
        st.plotly_chart(fig_pub, use_container_width=True)

    with col_f:
        st.markdown("**출판사별 평균 평점 (Top 15, 리뷰 10건 이상)**")
        pub_rating = (
            filtered.dropna(subset=["Rating"])
            .groupby("Publisher")
            .agg(AvgRating=("Rating", "mean"), ReviewSum=("ReviewCount", "sum"))
            .query("ReviewSum >= 10")
            .nlargest(15, "AvgRating")
            .reset_index()
        )
        fig_pr = px.bar(
            pub_rating, x="AvgRating", y="Publisher", orientation="h",
            color="AvgRating", color_continuous_scale="YlOrRd",
            labels={"AvgRating": "평균 평점", "Publisher": ""},
        )
        fig_pr.update_layout(height=500, margin=dict(t=10, b=10), yaxis=dict(autorange="reversed"))
        st.plotly_chart(fig_pr, use_container_width=True)

    # ── 4행: 가격대별 평균 리뷰 수 + 박스플롯 ──
    col_g, col_h = st.columns(2)
    with col_g:
        st.markdown("**가격대별 평균 리뷰 수**")
        filtered_copy = filtered.copy()
        filtered_copy["PriceBin"] = pd.cut(
            filtered_copy["Price"],
            bins=[0, 15000, 20000, 25000, 30000, 40000, 60000],
            labels=["~1.5만", "1.5~2만", "2~2.5만", "2.5~3만", "3~4만", "4만+"],
        )
        price_bin_stats = filtered_copy.groupby("PriceBin", observed=True)["ReviewCount"].mean().reset_index()
        fig_pbin = px.bar(
            price_bin_stats, x="PriceBin", y="ReviewCount",
            color="ReviewCount", color_continuous_scale="Purples",
            labels={"PriceBin": "가격대", "ReviewCount": "평균 리뷰 수"},
        )
        fig_pbin.update_layout(height=350, margin=dict(t=10, b=10))
        st.plotly_chart(fig_pbin, use_container_width=True)

    with col_h:
        st.markdown("**출판사별 가격 분포 (Top 10)**")
        top_pubs = filtered["Publisher"].value_counts().head(10).index.tolist()
        fig_box = px.box(
            filtered[filtered["Publisher"].isin(top_pubs)],
            x="Publisher", y="Price", color="Publisher",
            labels={"Publisher": "출판사", "Price": "가격 (원)"},
        )
        fig_box.update_layout(height=350, margin=dict(t=10, b=10), showlegend=False)
        st.plotly_chart(fig_box, use_container_width=True)

    # ── 전체 데이터 테이블 ──
    st.markdown("---")
    st.subheader("전체 데이터")
    st.dataframe(
        filtered[["Rank", "Title", "Author", "Publisher", "Price", "Rating", "ReviewCount"]]
        .sort_values("Rank"),
        use_container_width=True,
        height=500,
    )

# ═══════════════════════════════════════════
# TAB 2 – 키워드 검색
# ═══════════════════════════════════════════
with tab_search:
    st.subheader("도서 검색")
    keyword = st.text_input("검색 키워드를 입력하세요 (제목, 저자, 출판사)", "")
    search_target = st.radio(
        "검색 대상",
        ["제목", "저자", "출판사", "전체"],
        horizontal=True,
    )

    if keyword.strip():
        kw = keyword.strip()
        if search_target == "제목":
            mask = df["Title"].str.contains(kw, case=False, na=False)
        elif search_target == "저자":
            mask = df["Author"].str.contains(kw, case=False, na=False)
        elif search_target == "출판사":
            mask = df["Publisher"].str.contains(kw, case=False, na=False)
        else:
            mask = (
                df["Title"].str.contains(kw, case=False, na=False)
                | df["Author"].str.contains(kw, case=False, na=False)
                | df["Publisher"].str.contains(kw, case=False, na=False)
            )

        results = df[mask].sort_values("Rank")
        st.info(f"'{kw}' 검색 결과: **{len(results)}권**")

        if not results.empty:
            for _, row in results.iterrows():
                with st.container():
                    rc1, rc2, rc3 = st.columns([4, 1, 1])
                    with rc1:
                        st.markdown(f"**#{int(row['Rank'])}** {row['Title']}")
                        st.caption(f"저자: {row['Author']} | 출판사: {row['Publisher']}")
                    with rc2:
                        rating_str = f"{row['Rating']:.1f}" if pd.notna(row["Rating"]) else "-"
                        st.metric("평점", rating_str)
                    with rc3:
                        st.metric("리뷰", f"{int(row['ReviewCount'])}" if pd.notna(row["ReviewCount"]) else "-")
                    st.caption(f"가격: {int(row['Price']):,}원 | YES24 링크: [상세보기](https://www.yes24.com/product/{int(row['GoodsNo'])})")
                    st.divider()
        else:
            st.warning("검색 결과가 없습니다.")
    else:
        st.info("키워드를 입력하면 제목, 저자, 출판사에서 검색할 수 있습니다.")

        st.markdown("---")
        st.markdown("**인기 도서 미리보기 (리뷰 수 기준 Top 10)**")
        top10 = df.nlargest(10, "ReviewCount")
        for _, row in top10.iterrows():
            st.markdown(
                f"**#{int(row['Rank'])}** {row['Title']} — 평점 **{row['Rating']:.1f}** | 리뷰 **{int(row['ReviewCount']):,}** | {int(row['Price']):,}원"
            )

# ═══════════════════════════════════════════
# TAB 3 – 도서 추천 챗봇
# ═══════════════════════════════════════════
with tab_chatbot:
    st.subheader("도서 추천 챗봇")

    if not groq_api_key:
        st.warning("좌측 사이드바에서 Groq API Key를 입력해주세요.")
        st.stop()

    def build_book_context(query: str, top_n: int = 30) -> str:
        query_lower = query.lower()
        keywords = [w.strip() for w in query_lower.replace("·", " ").replace("×", " ").split() if len(w.strip()) >= 2]

        score = pd.Series(0, index=df.index)
        for kw in keywords:
            score += df["Title"].str.contains(kw, case=False, na=False).astype(int) * 3
            score += df["Author"].str.contains(kw, case=False, na=False).astype(int) * 2
            score += df["Publisher"].str.contains(kw, case=False, na=False).astype(int) * 1

        if score.sum() == 0:
            matched = df.head(top_n)
        else:
            matched = df[score > 0].head(top_n)
            if len(matched) < 5:
                matched = df.nlargest(top_n, "ReviewCount")

        lines = []
        for _, r in matched.iterrows():
            rating = f"{r['Rating']:.1f}" if pd.notna(r["Rating"]) else "N/A"
            reviews = int(r["ReviewCount"]) if pd.notna(r["ReviewCount"]) else 0
            url = f"https://www.yes24.com/product/{int(r['GoodsNo'])}"
            lines.append(
                f"- [{int(r['Rank'])}위] {r['Title']} | 저자: {r['Author']} | 출판사: {r['Publisher']} | "
                f"가격: {int(r['Price']):,}원 | 평점: {rating} | 리뷰: {reviews} | URL: {url}"
            )
        return "\n".join(lines)

    SYSTEM_PROMPT = """당신은 YES24 IT/모바일 베스트셀러 도서 추천 전문가입니다.
아래 제공되는 도서 목록을 기반으로 사용자의 질문에 친절하게 답변하세요.

규칙:
1. 추천할 도서가 있으면 아래 형식으로 답변하세요:
   - 도서명, 저자, 출판사, 가격, 평점, 리뷰 수를 포함하세요.
   - 각 추천 도서 뒤에 반드시 YES24 링크를 [상세보기](URL) 형식으로 포함하세요.
2. 추천할 도서가 없다면 "현재 데이터베이스에 요청하신 조건에 맞는 도서가 없습니다."라고 답변하세요.
3. 사용자의 질문과 관련된 키워드(예: AI, 코딩, 파이썬, 바이브코딩, 프롬프트 등)를 파악하여 관련 도서를 추천하세요.
4. 평점과 리뷰 수가 높은 도서를 우선 추천하세요.
5. 답변은 한국어로 작성하세요.
6. Markdown 형식을 사용하여 가독성 있게 작성하세요."""

    if "chat_messages" not in st.session_state:
        st.session_state.chat_messages = [
            {"role": "system", "content": SYSTEM_PROMPT}
        ]

    # ── 채팅 히스토리 표시 ──
    for msg in st.session_state.chat_messages:
        if msg["role"] == "system":
            continue
        with st.chat_message(msg["role"]):
            st.markdown(msg["content"])

    # ── 사용자 입력 ──
    if user_input := st.chat_input("원하는 도서 조건을 입력하세요 (예: AI 추천해줘, 파이썬 초보자용 책)"):
        with st.chat_message("user"):
            st.markdown(user_input)
        st.session_state.chat_messages.append({"role": "user", "content": user_input})

        book_ctx = build_book_context(user_input)
        context_msg = (
            f"아래는 YES24 IT/모바일 베스트셀러 데이터에서 추출한 도서 목록입니다.\n\n"
            f"{book_ctx}\n\n"
            f"위 데이터를 참고하여 사용자의 질문에 답변하세요."
        )

        messages_for_api = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": context_msg},
            {"role": "user", "content": user_input},
        ]

        try:
            client = Groq(api_key=groq_api_key)
            with st.spinner("AI가 도서를 검색하고 있습니다..."):
                response = client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=messages_for_api,
                    temperature=0.3,
                    max_tokens=2048,
                )
                assistant_msg = response.choices[0].message.content
        except Exception as e:
            assistant_msg = f"API 호출 중 오류가 발생했습니다: {e}"

        st.session_state.chat_messages.append({"role": "assistant", "content": assistant_msg})
        with st.chat_message("assistant"):
            st.markdown(assistant_msg)

    # ── 채팅 초기화 ──
    if st.session_state.chat_messages and len(st.session_state.chat_messages) > 1:
        if st.button("대화 초기화"):
            st.session_state.chat_messages = [
                {"role": "system", "content": SYSTEM_PROMPT}
            ]
            st.rerun()
