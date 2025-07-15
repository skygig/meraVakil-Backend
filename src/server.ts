// src/server.ts
import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import { clerkMiddleware } from "@clerk/express";

import rateLimiter from "./middleware/rateLimit";
import chatRoute from "./api/chat";
import storeUser from "./api/webhook";
import { verifyUser } from "./middleware/verifyUser";
import chatRouter from "./api/chat/chatRouter";
import messageRouter from "./api/message/messageRouter";

const app = express();

/* -------------------------------------------------------------
   Inlined CORS middleware
------------------------------------------------------------- */
app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;

  if (
    origin === "https://meravakil.vercel.app" ||
    origin === "http://localhost:3000"
  ) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,DELETE,OPTIONS"
    );
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  }

  // Handle pre-flight requests instantly
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});
/* ----------------------------------------------------------- */

app.post("/api/webhook", express.raw({ type: "application/json" }), storeUser);

// app.set("trust proxy", 1);
app.use(rateLimiter);
app.use(express.json());
app.use(clerkMiddleware());

app.use("/api/chat", verifyUser, chatRouter);
app.use("/api/message", verifyUser, messageRouter);
app.post("/api/chat", chatRoute);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on :${PORT}`));
