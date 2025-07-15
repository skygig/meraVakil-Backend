// src/middleware/cors.ts
import { Request, Response, NextFunction } from "express";

export default function cors(req: Request, res: Response, next: NextFunction) {
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
  // if it’s a preflight request, just send 204
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
}
