class Room{
    constructor(roomId, roomName, avatar, username, url, videoProvider,lock = true, usersConnected = 0){
        this.roomId = roomId;
        this.roomName = roomName;
        this.lock = lock;
        this.avatar = avatar
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
          avatar,
          username,
          url,
          videoProvider,
          lock,
          usersConnected
        } = roomInfo;
    
        return new Room(roomId,roomName, avatar, username, url, videoProvider, lock, usersConnected);
      }    

    addMessage(message){
        this.history.push(message);
    }

    clearHistory(){
        this.history = [];
    }

    increaseUserCount(){
        this.usersConnected++;
    }

    decreaseUserCount(){
        this.usersConnected--;
    }
}

module.exports = Room;
