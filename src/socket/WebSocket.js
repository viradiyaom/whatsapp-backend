const UserModel = require("../model/use.model");

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
    client.on("call", async (data) => {
      let chatRoomId = data.chatRoomId;
      let callerId = data.callerId;
      let type = data.type;
      const users = await UserModel.find({ _id: callerId });
      global.io.sockets.in(chatRoomId).emit("newCall", {
        chatRoomId,
        type,
        usersDetails: users[0],
      });
    });

    client.on("answerCall", (data) => {
      let chatRoomId = data.chatRoomId;
      let type = data.type;

      global.io.sockets.in(chatRoomId).emit("callAnswered", {
        chatRoomId,
        type,
      });
    });
    client.on("ICEcandidate", (data) => {
      console.log("ICEcandidate data.calleeId", data.calleeId);
      let chatRoomId = data.chatRoomId;
      let type = data.type;
      let rtcMessage = data.rtcMessage;

      global.io.sockets.in(chatRoomId).emit("ICEcandidate", {
        sender: chatRoomId,
        type,
        rtcMessage: rtcMessage,
      });
    });
  }
}

module.exports = new WebSockets();
