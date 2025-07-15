"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.answerQuery = answerQuery;
const openai_1 = require("./openai");
const retrival_1 = require("./retrival");
async function answerQuery(query) {
    const context = (await (0, retrival_1.getRelevantDocs)(query)).join("\n\n");
    const sys = "You are MeraVakil, a Bangalore-focussed legal assistant.";
    const user = `Question: "${query}"\nRelevant:\n${context}`;
    const chat = await openai_1.openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.2,
        messages: [
            { role: "system", content: sys },
            { role: "user", content: user },
        ],
    });
    return chat.choices[0].message.content;
}
