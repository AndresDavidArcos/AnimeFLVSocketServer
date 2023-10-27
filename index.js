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

rooms['maraton de one piece'] = new Room("UUID-GENERATED-STRING", "maraton de one piece", "female",  "zoro", "https://www3.animeflv.net/ver/rurouni-kenshin-meiji-kenkaku-romantan-2023-17", "SW",true, 5);

 io.on('connection',  (socket)=>{
  console.log(socket.id, 'has connected');

  socket.on('loginRequest', async(username, ackCallBack) => {
          ackCallBack({type: "success", rooms});
    })

  socket.on("createRoomRequest", roomInfo => {
    const roomCreated = Room.createRoomFromJSON(roomInfo);
    rooms[roomCreated.roomId] = roomCreated;
    //leave all rooms, because the host can only be in one room
    const clientRooms = socket.rooms;
    let i = 0;
    clientRooms.forEach(room=>{
    //we don't want to leave the socket's personal room which is guaranteed to be first
    if(i!==0){
      socket.leave(room);
     }
     i++;
     })

     socket.join(roomCreated.roomId);
  })

  socket.on("joinRoom", async(roomInfo, sendResponse) => {
    const thisRoom = rooms[roomInfo.roomId];
    const thisRoomHistory = thisRoom.history;
    
    //leave all rooms, because the client can only be in one room
    const clientRooms = socket.rooms;
    let i = 0;
    clientRooms.forEach(room=>{
    //we don't want to leave the socket's personal room which is guaranteed to be first
    if(i!==0){
      socket.leave(room);
     }
     i++;
     })

     socket.join(thisRoom.roomId);
     //fetch the number of sockets (users) in this room
     const sockets = await io.in(thisRoom.roomId).fetchSockets()
     const socketCount = sockets.length;

     sendResponse({
       numUsers: socketCount,
       history: thisRoom.history,
       videoProvider: thisRoom.videoProvider
     })
  })
})