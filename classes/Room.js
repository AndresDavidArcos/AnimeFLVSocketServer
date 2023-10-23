class Room{
    constructor(roomName, lock = true, iconSrc, usersConnected = 1, username ){
        this.roomName = roomName;
        this.lock = lock;
        this.iconSrc = iconSrc
        this.history = [];
        this.username = username;
        this.usersConnected = usersConnected;
    }

    addMessage(message){
        this.history.push(message);
    }

    clearHistory(){
        this.history = [];
    }
}

module.exports = Room;
