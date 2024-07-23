import { Request, Response } from "express";
import Message from "../models/message";
import { JwtPayload } from "../types/user";

// Создание комнаты
export const createRoom = async (req: Request, res: Response) => {
  const { roomName } = req.body; // Предполагается, что клиент передает название комнаты

  // В данном случае комната создается через Socket.io, этот маршрут может использоваться для других целей.
  // Например, для хранения информации о комнате в базе данных, если это необходимо.

  res.status(201).json({ message: `Room '${roomName}' created successfully` });
};

// Получение сообщений в комнате
export const getRoomMessages = async (req: Request, res: Response) => {
  const { roomId } = req.params;
  const userId = (req.user as JwtPayload)?.id; // Приведение типа к JwtPayload

  try {
    // Получение всех сообщений для указанной комнаты
    const messages = await Message.find({ room: roomId }).sort({
      timestamp: -1,
    });
    res.json(messages);
  } catch (error) {
    console.error("Error fetching room messages:", error);
    res.status(500).json({ message: "Error fetching room messages", error });
  }
};
