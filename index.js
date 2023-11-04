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
rooms['maraton de one piece'] = new Room("UUID-GENERATED-STRING", "maraton de one piece", "female", "zoro", "https://www3.animeflv.net/ver/rurouni-kenshin-meiji-kenkaku-romantan-2023-17", "SW", true, 5);

app.get('/rooms', (req, res) => {
  res.status(200).send(rooms);
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

  socket.on("joinRoom", async(roomInfo, sendResponse) => {
    const thisRoom = rooms[roomInfo.roomId];    
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