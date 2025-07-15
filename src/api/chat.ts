import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import prisma from "../lib/prisma";
import { answerQuery } from "../lib/ai";

const schema = z.object({
  chatId: z.string().uuid("chatId must be a valid UUID"),
  query: z.string().min(1),
});

const chatHandler = async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Payload must include query and chatId." });
    return;
  }
  const { chatId, query } = parsed.data;

  try {
    const { answer, grounded } = await answerQuery(query, res);

    await prisma.message.create({
      data: {
        chatId,
        from: "ai",
        content: answer,
        grounded,
      },
    });
  } catch (err) {
    console.error("LLM or DB error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default chatHandler;
