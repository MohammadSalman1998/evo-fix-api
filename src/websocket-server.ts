// src\websocket-server.ts
import { WebSocketServer, WebSocket } from "ws";


interface NotificationData_data {
    recipientId: number;
    requestId: number;
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
  // const userId = parseInt(req.url?.split("?userId=")[1] || "0");
  const urlParams = new URLSearchParams(req.url?.split('?')[1]);
  const userId = parseInt(urlParams.get('userId') || '0', 10);
  // userConnections.set(userId, ws);

  // ws.on("close", () => {
  //   userConnections.delete(userId);
  //   console.log("Client disconnected");
  // });

  // ws.on("error", (error) => {
  //   console.error(`WebSocket error for user ${userId}:`, error);
  // });

  if (userId > 0) {
    userConnections.set(userId, ws);
    console.log(`User ${userId} connected`);

    // Handle disconnection
    ws.on('close', () => {
      userConnections.delete(userId);
      console.log(`User ${userId} disconnected`);
    });

    // Optional: Handle WebSocket errors
    ws.on('error', (error) => {
      console.error(`WebSocket error for user ${userId}:`, error);
    });
  } else {
    ws.close(1008, "Invalid user ID"); // Close connection with error if no userId
  }
  
});

function sendToUser(userId: number, data: NotificationData) {
  const ws = userConnections.get(userId);
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }else {
    console.error(`No open WebSocket connection for user ${userId}`);
  }
}

export { sendToUser };