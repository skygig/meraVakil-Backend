"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRelevantDocs = getRelevantDocs;
const pinecone_1 = require("@pinecone-database/pinecone");
const pine = new pinecone_1.Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
}); // Cast to any so we can attach env at runtime
// @ts-ignore – `environment` not in older type defs
pine.environment = process.env.PINECONE_ENV;
const index = pine.index(process.env.PINECONE_INDEX);
async function getRelevantDocs(query, topK = 5) {
    // embed
    const embeddingResp = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({ model: "text-embedding-3-small", input: query }),
    }).then((r) => r.json());
    const [{ embedding }] = embeddingResp.data;
    let docs = [];
    try {
        const res = await index.query({
            vector: embedding,
            topK,
            includeMetadata: true,
        });
        docs =
            res.matches?.map((m) => `### ${m.metadata?.title ?? "Doc"}\n${m.metadata?.text}`) ?? [];
    }
    catch (err) {
        console.error("Pinecone query failed:", err.message);
        // graceful fallback – return no docs if index missing
    }
    return docs;
}
