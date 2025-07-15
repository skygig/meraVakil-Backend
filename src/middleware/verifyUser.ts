import { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";

export function verifyUser(req: Request, res: Response, next: NextFunction) {
  const { userId } = getAuth(req);

  if (!userId) {
    res.status(401).json({ error: "Unauthorized!" });
    return;
  }

  // @ts-ignore
  req.userId = userId;
  next();
}
