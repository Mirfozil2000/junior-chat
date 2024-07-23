import { Request, Response } from "express";
import Message from "../models/message";
import { JwtPayload } from "../types/user";
import path from "path";
import fs from "fs";
import multer from "multer";

// Конфигурация multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

export const sendMessage = async (req: Request, res: Response) => {
  const { recipient, content } = req.body;
  const sender = (req.user as JwtPayload)?.id;
  const file = req.file;
  try {
    const message = new Message({
      sender,
      recipient,
      content,
      file: file
        ? {
            url: file.path,
            filename: file.originalname,
          }
        : undefined,
    });
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json(error as Error);
  }
};

export const getMessages = async (req: Request, res: Response) => {
  const userId = (req.user as JwtPayload)?.id;

  try {
    const messages = await Message.find({ recipient: userId }).sort({
      timestamp: -1,
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json(error as Error);
  }
};

export const searchMessages = async (req: Request, res: Response) => {
  const userId = (req.user as JwtPayload)?.id;
  const { query } = req.query;

  if (typeof query !== "string") {
    return res.status(400).json({ message: "Invalid query parameter" });
  }

  try {
    const messages = await Message.find({
      recipient: userId,
      content: { $regex: query, $options: "i" },
    }).sort({
      timestamp: -1,
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json(error as Error);
  }
};
