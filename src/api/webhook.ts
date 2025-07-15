import { Webhook } from "svix";
import { Request, Response } from "express";
import prisma from "../lib/prisma";

const storeUser = async (req: Request, res: Response): Promise<void> => {
  const SIGNING_SECRET = process.env.SIGNING_SECRET;
  if (!SIGNING_SECRET) {
    console.error("Missing SIGNING_SECRET in .env");
    res.status(500).send("Server misconfiguration");
    return;
  }

  const wh = new Webhook(SIGNING_SECRET);
  const svixId = req.header("svix-id");
  const svixTimestamp = req.header("svix-timestamp");
  const svixSignature = req.header("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    res.status(400).send("Missing Svix headers");
    return;
  }

  let evt: any;
  try {
    const rawBody = req.body.toString();
    evt = wh.verify(rawBody, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });
  } catch (err) {
    console.error("Webhook verification failed:", err);
    res.status(400).send("Verification error");
    return;
  }

  if (evt.type === "user.created") {
    try {
      await prisma.user.create({
        data: {
          id: evt.data.id,
          email: evt.data.email_addresses[0].email_address,
          avatar: evt.data.image_url,
          name: `${evt.data.first_name} ${evt.data.last_name}`,
        },
      });
    } catch (dbErr) {
      console.error("DB error:", dbErr);
      res.status(500).send("Database error");
      return;
    }
  }

  res.status(200).send("OK");
};

export default storeUser;
