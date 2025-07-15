"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/middleware/cors.ts
const cors_1 = __importDefault(require("cors"));
exports.default = (0, cors_1.default)({ origin: process.env.ALLOWED_ORIGIN ?? "*" });
