"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const glob_1 = __importDefault(require("glob"));
const pinecone_1 = require("@pinecone-database/pinecone");
const openai_1 = require("../lib/openai");
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const crypto_1 = require("crypto");
// 1️⃣ initialise pinecone
const pine = new pinecone_1.Pinecone({ apiKey: process.env.PINECONE_API_KEY });
// Using Pinecone Serverless: no environment string needed
// ⚡ Serverless index — only name is required
const index = pine.index(process.env.PINECONE_INDEX);
async function loadText(filePath) {
    const ext = path_1.default.extname(filePath).toLowerCase();
    if (ext === ".txt" || ext === ".md") {
        return promises_1.default.readFile(filePath, "utf8");
    }
    if (ext === ".pdf") {
        const buff = await promises_1.default.readFile(filePath);
        const { text } = await (0, pdf_parse_1.default)(buff);
        return text;
    }
    throw new Error(`Unsupported file type: ${ext}`);
}
(async () => {
    const files = glob_1.default.sync("docs/**/*.{txt,md}", { nodir: true });
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
            let resp = await openai_1.openai.embeddings.create({
                model: "text-embedding-3-small",
                input: piece,
            });
            const embeddingVec = resp.data[0].embedding;
            // 2️⃣ upsert immediately
            await index.upsert([
                {
                    id: (0, crypto_1.randomUUID)(),
                    values: embeddingVec,
                    metadata: {
                        text: piece.slice(0, 160),
                        source: path_1.default.basename(file),
                    },
                },
            ]);
            // free memory
            resp = null;
            total += 1;
            if (total % 50 === 0)
                console.log(`${total} chunks uploaded…`);
            // reached end of file? then exit
            if (end >= raw.length)
                break;
            // otherwise advance by (size - overlap)
            pos += size - overlap;
        }
        // free raw string memory
        raw = null;
    }
    console.log(`✅ Ingestion complete (${total} chunks).`);
})();
