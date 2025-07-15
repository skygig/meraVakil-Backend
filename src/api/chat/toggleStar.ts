import { z } from "zod";
import { Request, Response } from "express";
import prisma from "../../lib/prisma";

const toggleStarSchema = z.object({
  chatId: z.string().uuid("chatId must be a valid UUID"),
  isStarred: z.boolean(),
});

const toggleStarChat = async (req: Request, res: Response) => {
  const parseResult = toggleStarSchema.safeParse(req.body);
  if (!parseResult.success) {
    const { path, message } = parseResult.error.errors[0];
    res.status(400).json({ error: `Invalid ${path.join(".")}: ${message}` });
    return;
  }

  // @ts-ignore
  const userId = req.userId;
  const { chatId, isStarred } = parseResult.data;

  try {
    // Confirm chat exists and belongs to this user
    const existing = await prisma.chat.findUnique({
      where: { id: chatId },
      select: { userId: true },
    });
    if (!existing || existing.userId !== userId) {
      res.status(404).json({ error: "Chat not found" });
      return;
    }

    //  Update the isStarred flag
    const updated = await prisma.chat.update({
      where: { id: chatId },
      data: { isStarred },
      select: { id: true, title: true, isStarred: true },
    });

    res.status(200).json(updated);
  } catch (err) {
    console.error("Error toggling star on chat:", err);
    res.status(500).json({ error: "Could not update chat" });
  }
};

export default toggleStarChat;
