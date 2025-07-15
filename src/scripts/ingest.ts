import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import glob from "glob";
import { Pinecone } from "@pinecone-database/pinecone";
import { openai } from "../lib/openai";
import pdf from "pdf-parse";
import { randomUUID } from "crypto";

// 1️⃣ initialise pinecone
const pine = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
// Using Pinecone Serverless: no environment string needed
// ⚡ Serverless index — only name is required
const index = pine.index(process.env.PINECONE_INDEX!);

async function loadText(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".txt" || ext === ".md") {
    return fs.readFile(filePath, "utf8");
  }
  if (ext === ".pdf") {
    const buff = await fs.readFile(filePath);
    const { text } = await pdf(buff);
    return text;
  }
  throw new Error(`Unsupported file type: ${ext}`);
}

(async () => {
  const files: string[] = glob.sync("docs/**/*.{txt,md}", { nodir: true });
  console.log(`Found ${files.length} files …`);
  let total = 0;

  for (const file of files) {
    let raw = await loadText(file);
    const size = 500;
    const overlap = 100;
    let pos = 0;

    // slice, embed, and upsert using a fixed step; break explicitly at EOF
    for (;;) {
      const end = Math.min(pos + size, raw.length);
      const piece = raw.slice(pos, end).trim();

      if (!piece) {
        // no more meaningful text
        break;
      }

      // 1️⃣ embed single chunk
      let resp = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: piece,
      });
      const embeddingVec = resp.data[0].embedding;

      // 2️⃣ upsert immediately
      await index.upsert([
        {
          id: randomUUID(),
          values: embeddingVec,
          metadata: {
            text: piece.slice(0, 160),
            source: path.basename(file),
          },
        },
      ]);

      // free memory
      resp = null as unknown as typeof resp;

      total += 1;
      if (total % 50 === 0) console.log(`${total} chunks uploaded…`);

      // reached end of file? then exit
      if (end >= raw.length) break;

      // otherwise advance by (size - overlap)
      pos += size - overlap;
    }

    // free raw string memory
    (raw as unknown) = null;
  }

  console.log(`✅ Ingestion complete (${total} chunks).`);
})();