"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("./middleware/cors"));
const rateLimit_1 = __importDefault(require("./middleware/rateLimit"));
const chat_1 = __importDefault(require("./api/chat"));
const app = (0, express_1.default)();
app.use(cors_1.default);
app.use(rateLimit_1.default);
app.use(express_1.default.json());
app.post("/api/chat", chat_1.default);
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on :${PORT}`));
