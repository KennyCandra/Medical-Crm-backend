import { Server } from "socket.io";

const connectUsers = new Map<string, string[]>();

export class SocketManager {
  static io: Server;
  static connect(server: any, allowedOrigins: string[]) {
    this.io = new Server(server, {
      cors: {
        origin: allowedOrigins,
        credentials: true,
      },
    });

    this.io.on("connection", (socket) => {
      const { id } = socket.handshake.query;

      if (id) {
        const userId = id as string;

        if (connectUsers.has(userId)) {
          connectUsers.get(userId)!.push(socket.id);
        } else {
          connectUsers.set(userId, [socket.id]);
        }
      } else {
        console.log("Unknown user");
      }

      socket.on("disconnect", () => {
        if (id) {
          const userId = id as string;
          const sockets = connectUsers.get(userId);

          if (sockets) {
            const updatedSockets = sockets.filter((sid) => sid !== socket.id);

            if (updatedSockets.length > 0) {
              connectUsers.set(userId, updatedSockets);
            } else {
              connectUsers.delete(userId);
            }
          }
        }
      });
    });
  }

  static emit(event: string, data: any) {
    for (const [id, sockets] of connectUsers) {
      for (const socket of sockets) {
        this.io.to(socket).emit(event, data);
      }
    }
  }

  static emitToUser(id: string, event: string, data: any) {
    if (connectUsers.has(id)) {
      const activeSockets = connectUsers.get(id) || [];
      for (const socket of activeSockets) {
        this.io.to(socket).emit(event, data);
      }
    }
  }
}

export default SocketManager;
