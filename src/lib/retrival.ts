import { Pinecone } from "@pinecone-database/pinecone";
import { openai } from "./openai"; // adjust path if different
import { randomUUID } from "crypto";

/* ------------------------------------------------------------------ */
/* Pinecone initialisation – Serverless (no environment string)       */
/* ------------------------------------------------------------------ */
const pine = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
export const index = pine.index(process.env.PINECONE_INDEX!);

/* ------------------------------------------------------------------ */
/*  Retrieval helper                                                  */
/* ------------------------------------------------------------------ */

/** Minimum cosine similarity required to accept a match. */
const SIMILARITY_THRESHOLD = 0.30;

/**
 * Return up to `topK` text snippets whose embeddings are most similar
 * to the query. Filters out low‑score matches so the caller can decide
 * whether to fall back to a pure GPT answer.
 */
export async function getRelevantDocs(
  query: string,
  topK = 10,
): Promise<string[]> {
  /* 1️⃣ Embed the query */
  const embedding = (
    await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
    })
  ).data[0].embedding;

  /* 2️⃣ Query Pinecone */
  const results = await index.query({
    vector: embedding,
    topK,
    includeMetadata: true,
    includeValues: false,
  });

  /* 3️⃣ Keep only good matches */
  const good = (results.matches ?? []).filter(
    (m) => (m.score ?? 0) >= SIMILARITY_THRESHOLD,
  );

  console.log(
    `Pinecone returned ${results.matches?.length ?? 0} hits; ` +
      `${good.length} above ${SIMILARITY_THRESHOLD}.`,
  );

  /* 4️⃣ Return the text snippets */
  return good.map((m) => (m.metadata as any).text as string);
}