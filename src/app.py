import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from pathlib import Path
from groq import Groq
import chromadb
import torch
from transformers import AutoTokenizer, AutoModel

st.set_page_config(page_title="YES24 IT 모바일 베스트셀러 대시보드", layout="wide")

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "yes24_it_mobile_bestsellers.csv"
DB_PATH = Path(__file__).resolve().parent.parent / "data" / "chromadb"
MODEL_NAME = "klue/bert-base"


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


@st.cache_resource
def load_embedding_model():
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    model = AutoModel.from_pretrained(MODEL_NAME)
    model.eval()
    return tokenizer, model


@st.cache_resource
def load_vectordb():
    client = chromadb.PersistentClient(path=str(DB_PATH))
    return client.get_collection(name="yes24_books")


def mean_pooling(model_output, attention_mask):
    token_embeddings = model_output.last_hidden_state
    input_mask_expanded = attention_mask.unsqueeze(-1).expand(token_embeddings.size()).float()
    return torch.sum(token_embeddings * input_mask_expanded, 1) / torch.clamp(input_mask_expanded.sum(1), min=1e-9)


def embed_query(text, tokenizer, model):
    encoded = tokenizer(text, padding=True, truncation=True, max_length=512, return_tensors="pt")
    with torch.no_grad():
        output = model(**encoded)
    emb = mean_pooling(output, encoded["attention_mask"])
    emb = torch.nn.functional.normalize(emb, p=2, dim=1)
    return emb.cpu().numpy().tolist()


def search_books(query, top_n=20):
    tokenizer, model = load_embedding_model()
    collection = load_vectordb()
    query_emb = embed_query(query, tokenizer, model)
    results = collection.query(query_embeddings=query_emb, n_results=top_n)
    docs = results["documents"][0]
    metas = results["metadatas"][0]
    distances = results["distances"][0]
    return list(zip(docs, metas, distances))


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

    # ── 함수 호출용 도구 정의 ──
    TOOLS = [
        {
            "type": "function",
            "function": {
                "name": "get_books_by_price_range",
                "description": "가격 범위로 도서를 검색하고 정렬합니다. 최소/최고 가격을 지정하여 해당 범위의 도서를 리뷰 수 순으로 반환합니다.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "min_price": {"type": "integer", "description": "최소 가격 (원). 예: 15000"},
                        "max_price": {"type": "integer", "description": "최고 가격 (원). 예: 25000"},
                        "sort_by": {"type": "string", "enum": ["price_asc", "price_desc", "reviews", "rating", "rank"], "description": "정렬 기준. 기본값: reviews"},
                        "top_n": {"type": "integer", "description": "반환할 도서 수. 기본값: 10"},
                    },
                    "required": ["min_price", "max_price"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "get_books_by_sales_index",
                "description": "판매지수로 도서를 검색하고 정렬합니다. 판매지수는 리뷰 수(60%), 평점(25%), 순위(15%)를 종합하여 계산합니다. 키워드로 특정 도서를 필터링할 수도 있습니다.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "keyword": {"type": "string", "description": "도서명/저자/출판사 키워드 필터. 없으면 전체 도서 대상."},
                        "sort_order": {"type": "string", "enum": ["desc", "asc"], "description": "정렬 순서. 기본값: desc (높은순)"},
                        "top_n": {"type": "integer", "description": "반환할 도서 수. 기본값: 10"},
                    },
                    "required": [],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "get_price_statistics",
                "description": "전체 또는 특정 조건의 도서 가격 통계를 반환합니다. 평균, 중앙값, 최솟값, 최댓값, 가격대별 분포를 제공합니다.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "keyword": {"type": "string", "description": "도서명/저자/출판사 키워드 필터. 없으면 전체 도서 대상."},
                    },
                    "required": [],
                },
            },
        },
    ]

    def exec_get_books_by_price_range(min_price, max_price, sort_by="reviews", top_n=10):
        mask = (df["Price"] >= min_price) & (df["Price"] <= max_price)
        result = df[mask].copy()
        if result.empty:
            return {"count": 0, "message": f"{min_price:,}원~{max_price:,}원 범위에 해당하는 도서가 없습니다.", "books": []}
        sort_map = {
            "price_asc": ("Price", True), "price_desc": ("Price", False),
            "reviews": ("ReviewCount", False), "rating": ("Rating", False), "rank": ("Rank", True),
        }
        col, asc = sort_map.get(sort_by, ("ReviewCount", False))
        result = result.sort_values(col, ascending=asc, na_position="last").head(top_n)
        books = []
        for _, r in result.iterrows():
            books.append({
                "rank": int(r["Rank"]), "title": r["Title"], "author": r["Author"],
                "publisher": r["Publisher"], "price": int(r["Price"]),
                "rating": round(r["Rating"], 1) if pd.notna(r["Rating"]) else None,
                "reviews": int(r["ReviewCount"]) if pd.notna(r["ReviewCount"]) else 0,
                "url": f"https://www.yes24.com/product/{int(r['GoodsNo'])}",
            })
        return {"count": len(books), "min_price": min_price, "max_price": max_price, "books": books}

    def exec_get_books_by_sales_index(keyword="", sort_order="desc", top_n=10):
        work = df.copy()
        if keyword:
            kw = keyword.lower()
            mask = (
                work["Title"].str.contains(kw, case=False, na=False)
                | work["Author"].str.contains(kw, case=False, na=False)
                | work["Publisher"].str.contains(kw, case=False, na=False)
            )
            work = work[mask]
        if work.empty:
            return {"count": 0, "message": f"'{keyword}'에 해당하는 도서가 없습니다." if keyword else "데이터가 없습니다.", "books": []}
        max_rev = work["ReviewCount"].max() if work["ReviewCount"].max() > 0 else 1
        max_rank = work["Rank"].max() if work["Rank"].max() > 0 else 1
        work = work.copy()
        work["review_score"] = work["ReviewCount"].fillna(0) / max_rev
        work["rating_score"] = work["Rating"].fillna(0) / 10
        work["rank_score"] = 1 - (work["Rank"] / max_rank)
        work["sales_index"] = (work["review_score"] * 0.60 + work["rating_score"] * 0.25 + work["rank_score"] * 0.15) * 100
        work = work.sort_values("sales_index", ascending=(sort_order == "asc")).head(top_n)
        books = []
        for _, r in work.iterrows():
            books.append({
                "rank": int(r["Rank"]), "title": r["Title"], "author": r["Author"],
                "publisher": r["Publisher"], "price": int(r["Price"]),
                "rating": round(r["Rating"], 1) if pd.notna(r["Rating"]) else None,
                "reviews": int(r["ReviewCount"]) if pd.notna(r["ReviewCount"]) else 0,
                "sales_index": round(r["sales_index"], 1),
                "url": f"https://www.yes24.com/product/{int(r['GoodsNo'])}",
            })
        return {"count": len(books), "keyword": keyword, "books": books}

    def exec_get_price_statistics(keyword=""):
        work = df.copy()
        if keyword:
            kw = keyword.lower()
            mask = (
                work["Title"].str.contains(kw, case=False, na=False)
                | work["Author"].str.contains(kw, case=False, na=False)
                | work["Publisher"].str.contains(kw, case=False, na=False)
            )
            work = work[mask]
        if work.empty:
            return {"message": f"'{keyword}'에 해당하는 도서가 없습니다." if keyword else "데이터가 없습니다."}
        prices = work["Price"].dropna()
        bins = [0, 15000, 20000, 25000, 30000, 40000, 100000]
        labels = ["~1.5만", "1.5~2만", "2~2.5만", "2.5~3만", "3~4만", "4만+"]
        dist = pd.cut(prices, bins=bins, labels=labels).value_counts().reindex(labels).fillna(0).astype(int).to_dict()
        return {
            "keyword": keyword,
            "count": len(prices),
            "mean": round(prices.mean()),
            "median": round(prices.median()),
            "min": int(prices.min()),
            "max": int(prices.max()),
            "std": round(prices.std()),
            "distribution": {k: int(v) for k, v in dist.items()},
        }

    func_map = {
        "get_books_by_price_range": lambda args: exec_get_books_by_price_range(**args),
        "get_books_by_sales_index": lambda args: exec_get_books_by_sales_index(**args),
        "get_price_statistics": lambda args: exec_get_price_statistics(**args),
    }

    SYSTEM_PROMPT = """당신은 YES24 IT/모바일 베스트셀러 도서 추천 전문가입니다.

도구(function) 사용 규칙:
- 사용자가 가격에 대해 질문하면 반드시 get_books_by_price_range 또는 get_price_statistics를 호출하세요.
- 사용자가 판매지수/인기/순위에 대해 질문하면 반드시 get_books_by_sales_index를 호출하세요.
- 가격과 판매지수를 모두 언급하면 두 함수를 모두 호출하세요.
- 함수 결과를 바탕으로 답변하세요.

답변 규칙:
1. 추천 도서에는 반드시 [상세보기](URL) 링크를 포함하세요.
2. 가격 범위 질문 시 해당 범위의 도서를 정렬하여 보여주세요.
3. 판매지수 질문 시 판매지수 점수를 함께 표시하세요.
4. 추천할 도서가 없으면 "해당 조건에 맞는 도서가 없습니다."라고 답변하세요.
5. 한국어로 Markdown 형식으로 답변하세요."""

    if "chat_messages" not in st.session_state:
        st.session_state.chat_messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    for msg in st.session_state.chat_messages:
        if msg["role"] == "system":
            continue
        with st.chat_message(msg["role"]):
            st.markdown(msg["content"])

    if user_input := st.chat_input("원하는 도서 조건을 입력하세요 (예: 2만원 이하 추천, 판매지수 높은 책)"):
        with st.chat_message("user"):
            st.markdown(user_input)
        st.session_state.chat_messages.append({"role": "user", "content": user_input})

        messages_for_api = list(st.session_state.chat_messages)
        messages_for_api.append({"role": "user", "content": user_input})

        try:
            groq_client = Groq(api_key=groq_api_key)
            with st.spinner("AI가 분석하고 있습니다..."):
                response = groq_client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=messages_for_api,
                    tools=TOOLS,
                    tool_choice="auto",
                    temperature=0.3,
                    max_tokens=2048,
                )
                msg = response.choices[0]

            if msg.tool_calls:
                assistant_text = ""
                tool_results_context = []
                for tc in msg.tool_calls:
                    fn_name = tc.function.name
                    import json
                    fn_args = json.loads(tc.function.arguments)
                    result = func_map[fn_name](fn_args)
                    tool_results_context.append({"tool": fn_name, "args": fn_args, "result": result})

                tool_summary_lines = []
                for tr in tool_results_context:
                    fn = tr["tool"]
                    res = tr["result"]
                    if fn == "get_books_by_price_range":
                        tool_summary_lines.append(f"[가격 범위 검색: {tr['args']['min_price']:,}원~{tr['args']['max_price']:,}원]")
                        if res["books"]:
                            for b in res["books"]:
                                r_str = f"{b['rating']}" if b["rating"] else "N/A"
                                tool_summary_lines.append(
                                    f"  - {b['title']} | {b['author']} | {b['publisher']} | "
                                    f"{b['price']:,}원 | 평점:{r_str} | 리뷰:{b['reviews']}건 | {b['url']}"
                                )
                        else:
                            tool_summary_lines.append(f"  {res['message']}")
                    elif fn == "get_books_by_sales_index":
                        kw = tr["args"].get("keyword", "")
                        tool_summary_lines.append(f"[판매지수 검색{f': {kw}' if kw else ''}]")
                        if res["books"]:
                            for b in res["books"]:
                                r_str = f"{b['rating']}" if b["rating"] else "N/A"
                                tool_summary_lines.append(
                                    f"  - #{b['rank']} {b['title']} | 판매지수:{b['sales_index']} | "
                                    f"{b['price']:,}원 | 평점:{r_str} | 리뷰:{b['reviews']}건 | {b['url']}"
                                )
                        else:
                            tool_summary_lines.append(f"  {res['message']}")
                    elif fn == "get_price_statistics":
                        kw_label = tr["args"].get("keyword", "")
                        tool_summary_lines.append(f"[가격 통계{': ' + kw_label if kw_label else ''}]")
                        if "mean" in res:
                            tool_summary_lines.append(
                                f"  평균:{res['mean']:,}원 | 중앙값:{res['median']:,}원 | "
                                f"최저:{res['min']:,}원 | 최고:{res['max']:,}원 | 도서 수:{res['count']}권"
                            )
                            dist_str = " | ".join(f"{k}:{v}권" for k, v in res["distribution"].items())
                            tool_summary_lines.append(f"  가격대 분포: {dist_str}")
                        else:
                            tool_summary_lines.append(f"  {res['message']}")

                tool_ctx = "\n".join(tool_summary_lines)
                follow_messages = [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_input},
                    {"role": "assistant", "content": f"[함수 호출 결과]\n{tool_ctx}"},
                    {"role": "user", "content": "위 함수 호출 결과를 바탕으로 사용자에게 친절하게 답변해주세요. 도서 뒤에 반드시 YES24 링크를 포함하세요."},
                ]
                with st.spinner("AI가 답변을 생성하고 있습니다..."):
                    follow_resp = groq_client.chat.completions.create(
                        model="llama-3.3-70b-versatile",
                        messages=follow_messages,
                        temperature=0.3,
                        max_tokens=2048,
                    )
                    assistant_msg = follow_resp.choices[0].message.content
            else:
                assistant_msg = msg.message.content

        except Exception as e:
            assistant_msg = f"API 호출 중 오류가 발생했습니다: {e}"

        st.session_state.chat_messages.append({"role": "assistant", "content": assistant_msg})
        with st.chat_message("assistant"):
            st.markdown(assistant_msg)

    if st.session_state.chat_messages and len(st.session_state.chat_messages) > 1:
        if st.button("대화 초기화"):
            st.session_state.chat_messages = [{"role": "system", "content": SYSTEM_PROMPT}]
            st.rerun()
