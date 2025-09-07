import SockJS from "sockjs-client";
import { Client, IMessage } from "@stomp/stompjs";

let stompClient: Client | null = null;

export const connectLogStream = (onMessage: (log: unknown) => void) => {
  // Création de la socket SockJS (sans options invalides comme withCredentials)
  const socket = new SockJS("http://localhost:8080/ws-logs");

  stompClient = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 5000,
    connectHeaders: {
      Authorization: `Bearer ${localStorage.getItem("access_token") ?? ''}` // ✅ JWT
    },
    onConnect: () => {
      console.log("✅ Connected to STOMP WebSocket");
      stompClient?.subscribe("/topic/logs", (message: IMessage) => {
        const log = JSON.parse(message.body);
        onMessage(log);
      });
    },
    onStompError: (frame) => {
      console.error("❌ Broker reported error:", frame.headers["message"]);
      console.error("Details:", frame.body);
    },
    onWebSocketError: (event) => {
      console.error("❌ WebSocket error:", event);
    }
  });

  stompClient.activate();
};

export const disconnectLogStream = () => {
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
    console.log("🛑 STOMP connection closed.");
  }
};
