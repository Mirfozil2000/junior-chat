import express from "express";
import http from "http";
import { Server as SocketIoServer } from "socket.io";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import passport from "passport";
import session from "express-session";
import MongoStore from "connect-mongo";
import authRoutes from "./routes/auth";
import messageRoutes from "./routes/message";
import roomRoutes from "./routes/room";
import Message from "./models/message";
import cors from "cors";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIoServer(server);

// Middleware
app.use(bodyParser.json());
app.use(
  cors({
    origin: "http://localhost:3000", // Разрешить запросы только с этого адреса
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // Если вам нужно поддерживать куки и авторизацию
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URL as string }),
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/auth", authRoutes);
app.use("/messages", messageRoutes);
app.use("/rooms", roomRoutes);

// Socket.io
io.on("connection", (socket) => {
  console.log("New connection");

  // Обработчик для присоединения к комнате
  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log(`User joined room ${roomId}`);
  });

  // Обработчик для отправки сообщений в комнату
  socket.on("send_message", async (msg) => {
    const message = new Message({
      sender: msg.sender,
      room: msg.room,
      content: msg.content,
    });
    try {
      await message.save();
      io.to(msg.room).emit("receive_message", msg);

      // Отправка уведомления о новом сообщении
      socket.broadcast.to(msg.room).emit("new_notification", {
        sender: msg.sender,
        room: msg.room,
        content: msg.content,
      });
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  // Обработчик для подтверждения прочтения сообщения
  socket.on("mark_as_read", async (data) => {
    const { messageId, userId } = data;
    try {
      const message = await Message.findById(messageId);
      if (message && !message.readBy.includes(userId)) {
        message.readBy.push(userId);
        await message.save();
        io.to(message.room).emit("message_read", { messageId, userId });
      }
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  });

  // Обработчик для отключения
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Database connection and server start
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URL as string)
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log("Mongo connected");
    });
  })
  .catch((err) => console.log(err));
