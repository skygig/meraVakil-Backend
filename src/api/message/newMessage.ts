import { z } from "zod";
import { Request, Response } from "express";
import prisma from "../../lib/prisma";

const addMessageSchema = z.object({
  chatId: z.string().uuid("chatId must be a valid UUID"),
  content: z
    .string()
    .min(1, "content cannot be empty")
    .max(8000, `content cannot exceed ${8000} characters`)
    .trim(),
});

const addChatMessage = async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.userId;
  const validationResult = addMessageSchema.safeParse(req.body);

  if (!validationResult.success) {
    res.status(400).json({
      error: "Validation failed",
      details: validationResult.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }

  const { chatId, content } = validationResult.data;

  try {
    // Ensure the chat belongs to this user
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      select: { userId: true },
    });
    if (!chat || chat.userId !== userId) {
      res.status(404).json({ error: "Chat not found" });
      return;
    }

    // Create the new message
    const message = await prisma.message.create({
      data: {
        chatId,
        from: "user",
        content,
      },
      select: {
        id: true,
      },
    });

    res.status(201).json(message);
  } catch (err) {
    console.error("Error creating message:", err);
    res.status(500).json({ error: "Could not add message" });
  }
};

export default addChatMessage;
