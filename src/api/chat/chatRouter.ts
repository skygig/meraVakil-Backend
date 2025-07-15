import { Router } from "express";
import getUserChats from "./getChats";
import createChatWithMessage from "./newChat";
import renameChat from "./renameChat";
import deleteChat from "./deleteChat";
import toggleStarChat from "./toggleStar";

const chatRouter = Router();

chatRouter.get("/all", getUserChats);
chatRouter.post("/new", createChatWithMessage);
chatRouter.put("/rename", renameChat);
chatRouter.delete("/delete", deleteChat);
chatRouter.put("/toggle-star", toggleStarChat);

export default chatRouter;
