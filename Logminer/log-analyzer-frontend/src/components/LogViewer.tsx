// components/LogViewer.tsx
"use client";

import { useEffect, useState } from "react";
import SockJS from "sockjs-client";
import { Client, IMessage } from "@stomp/stompjs";

export interface Log {
  idLog: number;
  timestamp: string;
  level: string;
  source: string;
  message: string;
  analysisStatus: string;
}

interface LogViewerProps {
  serverId: number;
}

export default function LogViewer({ serverId }: LogViewerProps) {
  const [logs, setLogs] = useState<Log[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:8080/ws-logs";
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error('No access token found for WebSocket');
      return;
    }
    // Create SockJS with credentials
    const sock = new SockJS(socketUrl);

    // STOMP client with Authorization header
    const client = new Client({
      webSocketFactory: () => sock,
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      debug: (str) => console.debug("STOMP: ", str),
      onConnect: () => {
        setConnected(true);
        client.subscribe(`/topic/logs/${serverId}`, (msg: IMessage) => {
          try {
            const payload: Log = JSON.parse(msg.body);
            setLogs((prev) => [...prev, payload]);
          } catch (e) {
            console.error("Failed to parse message", e);
          }
        });
      },
      onStompError: (frame) => {
        console.error("Broker Error: ", frame.headers["message"], frame.body);
      },
      onDisconnect: () => setConnected(false),
    });

    client.activate();
    return () => {
      client.deactivate();
    };
  }, [serverId]);

  return (
    <div>
      <h2>Logs for Server #{serverId}</h2>
      <p>Status: {connected ? "🟢 Connected" : "🔴 Disconnected"}</p>
      <ul style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {logs.map((log) => (
          <li key={log.idLog}>
            <strong>[{log.level}]</strong> {log.timestamp} – {log.message}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Allow named import
//export { default as LogViewer };
