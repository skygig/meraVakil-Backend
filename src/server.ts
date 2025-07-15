import "dotenv/config";
import express from "express";
import { clerkMiddleware } from "@clerk/express";

import cors from "./middleware/cors";
import rateLimiter from "./middleware/rateLimit";
import chatRoute from "./api/chat";
import storeUser from "./api/webhook";
import { verifyUser } from "./middleware/verifyUser";
import chatRouter from "./api/chat/chatRouter";
import messageRouter from "./api/message/messageRouter";

const app = express();

app.post("/api/webhook", express.raw({ type: "application/json" }), storeUser);
app.use(cors);

// app.set("trust proxy", 1);
app.use(rateLimiter);
app.use(express.json());
app.use(clerkMiddleware());

app.use("/api/chat", verifyUser, chatRouter);
app.use("/api/message", verifyUser, messageRouter);
app.post("/api/chat", chatRoute);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on :${PORT}`));
