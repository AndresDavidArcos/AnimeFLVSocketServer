class Room{
    constructor(roomId, roomName, iconSrc, username, url, videoProvider,lock = true, usersConnected = 1){
        this.roomId = roomId;
        this.roomName = roomName;
        this.lock = lock;
        this.iconSrc = iconSrc
        this.history = [];
        this.username = username;
        this.usersConnected = usersConnected;
        this.url = url;
        this.videoProvider = videoProvider;
    }

    static createRoomFromJSON(roomInfo) {
        const {
          roomId,
          roomName,
          iconSrc,
          username,
          url,
          videoProvider,
          lock,
          usersConnected
        } = roomInfo;
    
        return new Room(roomId,roomName, iconSrc, username, url, videoProvider, lock, usersConnected);
      }    

    addMessage(message){
        this.history.push(message);
    }

    clearHistory(){
        this.history = [];
    }
}

module.exports = Room;
