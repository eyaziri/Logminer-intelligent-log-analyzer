// components/LogTable.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';

export interface Log {
  idLog: number;
  timestamp: string;
  level: string;
  source: string;
  message: string;
  analysisStatus: string;
}

interface LogTableProps {
  serverId: number;
  autoRefresh: boolean;
  refreshInterval?: number;
}

export default function LogTable({ serverId, autoRefresh }: LogTableProps) {
  const [logs, setLogs] = useState<Log[]>([]);
  const [connected, setConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token || !autoRefresh) return;

    const socket = new SockJS('http://localhost:8080/ws-logs');
    const client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      onConnect: () => {
        setConnected(true);
        client.subscribe(`/topic/logs/${serverId}`, (msg: IMessage) => {
          try {
            const log: Log = JSON.parse(msg.body);
            setLogs((prev) => [...prev, log]);
          } catch (e) {
            console.error('Failed to parse log message', e);
          }
        });
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame.headers['message'], frame.body);
      },
      onDisconnect: () => setConnected(false),
      debug: (msg) => console.debug(msg),
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [serverId, autoRefresh]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="bg-black text-white p-4 rounded-lg h-[400px] overflow-y-auto font-mono text-sm border border-gray-700">
      {connected ? (
        logs.map((log) => (
          <div key={log.idLog} className="mb-1">
            <span className="text-gray-400">{log.timestamp}</span>{' '}
            <span className={`font-bold ${
              log.level === 'ERROR' ? 'text-red-400' :
              log.level === 'WARN' ? 'text-yellow-300' :
              'text-green-300'
            }`}>
              [{log.level}]
            </span>{' '}
            <span className="text-blue-300">{log.source}</span>: {log.message}
          </div>
        ))
      ) : (
        <div className="text-gray-400 italic">Waiting for server to start...</div>
      )}
      <div ref={logEndRef} />
    </div>
  );
}
