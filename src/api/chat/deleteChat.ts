import { Request, Response } from "express";
import { z } from "zod";
import prisma from "../../lib/prisma";

const deleteChatSchema = z.object({
  chatId: z.string().uuid("chatId must be a valid UUID"),
});

const deleteChat = async (req: Request, res: Response) => {
  const parseResult = deleteChatSchema.safeParse(req.body);
  if (!parseResult.success) {
    const { path, message } = parseResult.error.errors[0];
    res.status(400).json({ error: `Invalid ${path.join(".")}: ${message}` });
    return;
  }

  // @ts-ignore
  const userId = req.userId;
  const { chatId } = parseResult.data;

  try {
    // Verify ownership
    const existing = await prisma.chat.findUnique({
      where: { id: chatId },
      select: { userId: true },
    });
    if (!existing || existing.userId !== userId) {
      res.status(404).json({ error: "Chat not found" });
      return;
    }

    // Delete the chat and it will cascade-delete messages
    await prisma.chat.delete({
      where: { id: chatId },
    });

    res.status(200).json({ chatId });
  } catch (err) {
    console.error("Error deleting chat:", err);
    res.status(500).json({ error: "Could not delete chat" });
  }
};

export default deleteChat;
