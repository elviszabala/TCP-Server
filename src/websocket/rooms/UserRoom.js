const logger = require("../../utils/logger");

class UserRoom {
  static users = new Map(); // userId → ws

  static join(userId, ws) {
    this.users.set(userId, ws);
    logger.info(`Usuario ${userId} unido a UserRoom`);
  }

  static leave(userId) {
    if (this.users.has(userId)) {
      this.users.delete(userId);
      logger.info(`Usuario ${userId} salió de UserRoom`);
    }
  }

  static sendToUser(userId, data) {
    const ws = this.users.get(userId);
    if (ws && ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }

  static broadcastEvent(event) {
    for (const [userId, ws] of this.users.entries()) {
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify({ type: "event", payload: event }));
      }
    }
  }
}

module.exports = UserRoom;
