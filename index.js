const Room = require('./classes/Room')
const express = require('express')
const app = express()
const socketio = require('socket.io')
const cors = require("cors");
const corsOptions = {
  origin: '*', // Acepta solicitudes de cualquier origen
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
const expresServer = app.listen(9000);
const io = socketio(expresServer, {
  cors: {
    origin: '*', // Acepta conexiones de cualquier origen
    methods: ['GET', 'POST'],
  },
});
const rooms = {};
const users = {};

rooms['maraton de one piece'] = new Room("maraton de one piece", true, "female", 5, "zoro");

 io.on('connection',  (socket)=>{
  console.log(socket.id, 'has connected');

  socket.on('loginRequest', async(username, ackCallBack) => {
    console.log(users)
        if(username in users){
          ackCallBack({type: "error", msg: "Ya existe un usuario con ese nombre"});
        }else{
          users[username] = true;
          ackCallBack({type: "success", rooms});
        }

    })
})