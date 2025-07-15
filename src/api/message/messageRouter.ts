import { Router } from "express";
import getChatMessages from "./getMessages";
import addChatMessage from "./newMessage";

const messageRouter = Router();

messageRouter.get("/all", getChatMessages);
messageRouter.post("/new", addChatMessage);

export default messageRouter;
