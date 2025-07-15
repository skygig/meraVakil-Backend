import { z } from "zod";
import { Request, Response } from "express";
import prisma from "../../lib/prisma";
import generateTitle from "../../lib/getTitle";

const newChatSchema = z.object({
  content: z
    .string()
    .min(1, "content cannot be empty")
    .max(8000, `content cannot exceed ${8000} characters`)
    .trim(),
});

const createChatWithMessage = async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.userId;
  const validationResult = newChatSchema.safeParse(req.body);

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

  const { content } = validationResult.data;

  try {
    const title = await generateTitle(content);
    // Create the chat and its first message in one transaction
    const chat = await prisma.chat.create({
      data: {
        title,
        userId,
        messages: {
          create: {
            from: "user",
            content,
          },
        },
      },
      select: {
        id: true,
        title: true,
      },
    });

    res.status(201).json(chat);
  } catch (err) {
    console.error("Error creating chat with first message:", err);
    res.status(500).json({ error: "Could not create chat and message" });
  }
};

export default createChatWithMessage;
