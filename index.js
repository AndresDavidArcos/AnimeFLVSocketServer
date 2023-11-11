const Room = require('./classes/Room');
const express = require('express');
const app = express();
const cors = require("cors");
const socketio = require('socket.io')

const corsOptions = {
  origin: '*', // Allow requests from any origin
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

app.use(express.json());

const port = 9000;
const rooms = {};
// rooms['maraton de one piece'] = new Room("UUID-GENERATED-STRING", "maraton de one piece", "female", "zoro", "https://www3.animeflv.net/ver/rurouni-kenshin-meiji-kenkaku-romantan-2023-17", "SW", true, 5);

app.get('/rooms', (req, res) => {
  res.status(200).send(rooms);
});

app.get('/rooms/:roomId', (req, res) => {
  const {roomId} = req.params;
  const thisRoom = rooms[roomId];
  if(thisRoom){
    res.status(200).send(thisRoom);
  }else{
    res.status(404).send({message: "La room a la que tratas de acceder no existe"})
  }
});

app.post('/createRoom', (req, res) => {
    const roomInfo = req.body;
    const roomCreated = Room.createRoomFromJSON(roomInfo);
    rooms[roomCreated.roomId] = roomCreated;
    res.status(200).send({ message: "Room creada exitosamente"});
  });


  
const expressServer = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

const io = socketio(expressServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection',  (socket)=>{
  console.log(socket.id, 'has connected');

  socket.on("disconnecting", reason => {
    console.log(socket.id, "has disconnected")
    const [, thisRoomId] = socket.rooms;
    if(thisRoomId){

      const thisRoom = rooms[thisRoomId];
      thisRoom.decreaseUserCount();
      if(thisRoom.usersConnected === 0){
        delete rooms[thisRoomId];
      }
    }

  }) 

  socket.on("joinRoom", (roomId, sendResponse) => {
    const thisRoom = rooms[roomId];
    if(thisRoom){
      thisRoom.increaseUserCount()   
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

       sendResponse({
         history: thisRoom.history,
         videoProvider: thisRoom.videoProvider,
         host: thisRoom.username,
         url: thisRoom.url,
         roomId: thisRoom.roomId
       })
    }else{
      sendResponse({type: "error", message: "La room a la que intenta entrar no existe"})
    }

  })

  socket.on('newMessageToRoom', messageObj => {
    const [, currentRoom] = socket.rooms;
    const thisRoom = rooms[currentRoom];
    if(thisRoom){
      io.in(currentRoom).emit('roomMessage',messageObj)
      thisRoom.addMessage(messageObj);
    }else{
      console.log("Usuario intento enviar mensaje en una room que no existe")
    }
    
  })

  socket.on('askCurrentVideoTime', async (roomId, sendResponse) => {
    const timeoutVal = 12;
    try {
      const roomSockets = await io.in(roomId).fetchSockets();
      const [firstUser] = roomSockets;
      const currentTime = await io.in(firstUser.id).timeout(timeoutVal).emitWithAck('getCurrentVideoTime', 'N/A');
      sendResponse(currentTime[0]);
    } catch (error) {
      console.log("error en askCurrentVideoTime: ", error)
      sendResponse({type: "error", message: `Se excedio el limite de ${timeoutVal/1000} segundos para sincronizar el video.`});
    }
  })
})