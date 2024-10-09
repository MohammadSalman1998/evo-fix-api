// src\websocket-server.ts
import { WebSocketServer, WebSocket } from "ws";


interface NotificationData_data {
    recipientId: number;
    title: string;
    content: string;
    createdAt: Date
  }

  interface NotificationData {
    type:string;
    data: NotificationData_data;
  }

const wss = new WebSocketServer({ port: 8080 });

// Map users to their WebSocket connections
const userConnections: Map<number, WebSocket> = new Map();

wss.on("connection", (ws: WebSocket, req) => {
  // Assuming the user ID is passed as a query parameter or JWT token
  const userId = parseInt(req.url?.split("?userId=")[1] || "0");
  userConnections.set(userId, ws);

  ws.on("close", () => {
    userConnections.delete(userId);
    console.log("Client disconnected");
  });
});

function sendToUser(userId: number, data: NotificationData) {
  const ws = userConnections.get(userId);
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

export { sendToUser };