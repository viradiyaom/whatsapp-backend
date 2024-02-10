class WebSockets {
  users = [];

  subscribeOtherUser(room, otherUserId) {
    const userSockets = this.users.filter(
      (user) => user.userId === otherUserId
    );
    userSockets.map((userInfo) => {
      const socketConn = global.io.sockets.sockets.get(userInfo.socketId);

      if (socketConn) {
        socketConn.join(room);
      }
    });
  }
  connection(client) {
    // event fired when the chat room is disconnected
    client.on("disconnect", () => {
      this.users = this.users.filter((user) => user.socketId !== client.id);
    });
    // add identity of user mapped to the socket id
    client.on("identity", (userId) => {
      this.users.push({
        socketId: client.id,
        userId: userId,
      });
    });
    // subscribe person to chat & other user as well
    client.on("subscribe", (room, userIds) => {
      const [, otherId] = userIds;
      this.subscribeOtherUser(room, otherId);
      client.join(room);
    });
    // mute a chat room
    client.on("unsubscribe", (room) => {
      client.leave(room);
      client.to(room).emit("typingStatus", "");
    });

    client.on("typingStart", (room) => {
      client.to(room).emit("typingStatus", "typing");
    });
    client.on("typingEnd", (room) => {
      client.to(room).emit("typingStatus", "");
    });
  }
}

module.exports = new WebSockets();
