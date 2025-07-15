"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const ai_1 = require("../lib/ai");
const schema = zod_1.z.object({ query: zod_1.z.string().min(4) });
const chatHandler = async (req, res, _next) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: "Bad query" });
        return;
    }
    try {
        const answer = await (0, ai_1.answerQuery)(parsed.data.query);
        res.json({ answer });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "LLM error" });
    }
};
exports.default = chatHandler;
