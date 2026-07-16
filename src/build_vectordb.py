import pandas as pd
import chromadb
import torch
from transformers import AutoTokenizer, AutoModel
from pathlib import Path

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "yes24_it_mobile_bestsellers.csv"
DB_PATH = Path(__file__).resolve().parent.parent / "data" / "chromadb"
MODEL_NAME = "klue/bert-base"


def mean_pooling(model_output, attention_mask):
    token_embeddings = model_output.last_hidden_state
    input_mask_expanded = attention_mask.unsqueeze(-1).expand(token_embeddings.size()).float()
    return torch.sum(token_embeddings * input_mask_expanded, 1) / torch.clamp(input_mask_expanded.sum(1), min=1e-9)


def embed_texts(texts, tokenizer, model, batch_size=32):
    all_embeddings = []
    for i in range(0, len(texts), batch_size):
        batch = texts[i : i + batch_size]
        encoded = tokenizer(batch, padding=True, truncation=True, max_length=512, return_tensors="pt")
        with torch.no_grad():
            output = model(**encoded)
        emb = mean_pooling(output, encoded["attention_mask"])
        emb = torch.nn.functional.normalize(emb, p=2, dim=1)
        all_embeddings.append(emb.cpu().numpy())
    import numpy as np
    return np.vstack(all_embeddings).tolist()


def build_vectordb():
    df = pd.read_csv(DATA_PATH)
    df.columns = df.columns.str.strip()
    df["Rating"] = pd.to_numeric(df["Rating"], errors="coerce")
    df["ReviewCount"] = pd.to_numeric(df["ReviewCount"], errors="coerce")
    df["Price"] = pd.to_numeric(df["Price"], errors="coerce")

    print(f"Loading model: {MODEL_NAME}")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    model = AutoModel.from_pretrained(MODEL_NAME)
    model.eval()

    documents = []
    metadatas = []
    ids = []

    for _, row in df.iterrows():
        rating = f"{row['Rating']:.1f}" if pd.notna(row["Rating"]) else "N/A"
        reviews = int(row["ReviewCount"]) if pd.notna(row["ReviewCount"]) else 0
        url = f"https://www.yes24.com/product/{int(row['GoodsNo'])}"

        doc_text = (
            f"{row['Title']}. "
            f"저자: {row['Author']}. "
            f"출판사: {row['Publisher']}. "
            f"가격: {int(row['Price']):,}원. "
            f"평점: {rating}. "
            f"리뷰 수: {reviews}건. "
            f"YES24 링크: {url}"
        )
        documents.append(doc_text)
        metadatas.append({
            "rank": int(row["Rank"]),
            "title": row["Title"],
            "author": row["Author"],
            "publisher": row["Publisher"],
            "price": int(row["Price"]),
            "rating": float(row["Rating"]) if pd.notna(row["Rating"]) else 0.0,
            "reviews": reviews,
            "url": url,
            "goods_no": int(row["GoodsNo"]),
        })
        ids.append(f"book_{int(row['Rank'])}")

    print(f"Embedding {len(documents)} books...")
    embeddings = embed_texts(documents, tokenizer, model)

    print(f"Creating ChromaDB at {DB_PATH}")
    client = chromadb.PersistentClient(path=str(DB_PATH))
    try:
        client.delete_collection("yes24_books")
    except Exception:
        pass
    collection = client.create_collection(
        name="yes24_books",
        metadata={"hnsw:space": "cosine"},
    )

    batch_size = 100
    for i in range(0, len(documents), batch_size):
        end = min(i + batch_size, len(documents))
        collection.add(
            documents=documents[i:end],
            embeddings=embeddings[i:end],
            metadatas=metadatas[i:end],
            ids=ids[i:end],
        )
        print(f"  Inserted {end}/{len(documents)}")

    print("Done!")
    print(f"Collection size: {collection.count()}")


if __name__ == "__main__":
    build_vectordb()
