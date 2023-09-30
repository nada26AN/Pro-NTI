const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const socket = require('socket.io');

const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');
require('dotenv').config();

const app = express();

const PORT = process.env.PORT 

// middleware
app.use(express.json());
app.use(cors());




// connect to mongodb

mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.log(err);
});



app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);




const server = app.listen(process.env.PORT, () =>
  console.log(`Server started on ${process.env.PORT}`)
);
const io = socket(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});


// Socket


  
  global.onlineUsers = new Map();
  io.on("connection", (socket) => {
    global.chatSocket = socket;
    socket.on("add-user", (userId) => {
      onlineUsers.set(userId, socket.id);
    });
  
    socket.on("send-msg", (data) => {
      const sendUserSocket = onlineUsers.get(data.to);
      if (sendUserSocket) {
        socket.to(sendUserSocket).emit("msg-recieve", data.msg);
      }
    });
  });