import { useEffect, useState } from "react";
import axios from "axios";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

export default function TokenApp() {
  const [phone, setPhone] = useState("");
  const [currentToken, setCurrentToken] = useState(null);
  const [alerts, setAlerts] = useState([]);

  // 🔌 WebSocket connection
  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8089/ws-bank"),

      onConnect: () => {
        console.log("Connected ✅");

        // 🔥 Broadcast (active token)
        client.subscribe("/topic/token-updates", (msg) => {
          const data = JSON.parse(msg.body);
          setCurrentToken(data);
        });

        // 🔔 Personal alert
        client.subscribe("/user/queue/alert", (msg) => {
          setAlerts((prev) => [...prev, msg.body]);
        });
      },
    });

    client.activate();
  }, []);

  // 🎟️ Generate token
  const generateToken = async () => {
    if (!phone) return alert("Enter phone number");

    const res = await axios.post(
      "http://localhost:8089/api/tokens/generate",
      null,
      { params: { phone } }
    );

    setCurrentToken(res.data);
  };

  // ▶️ Next token
  const nextToken = async () => {
    const res = await axios.get(
      "http://localhost:8089/api/tokens/next"
    );

    setCurrentToken(res.data);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">

      <h1 className="text-3xl font-bold mb-6">
        🏦 Bank Token System
      </h1>

      {/* Input */}
      <input
        type="text"
        placeholder="Enter phone number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="border p-2 rounded w-64 mb-4"
      />

      {/* Buttons */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={generateToken}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Generate Token
        </button>

        <button
          onClick={nextToken}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Next Token
        </button>
      </div>

      {/* Current Token */}
      {currentToken && (
        <div className="bg-white shadow p-4 rounded mb-6 text-center w-64">
          <p className="text-xl font-bold">
            Token: {currentToken.tokenNumber}
          </p>
          <p>Status: {currentToken.status}</p>
        </div>
      )}

      {/* Alerts */}
      <div className="w-64">
        <h2 className="font-bold mb-2">🔔 Alerts</h2>
        {alerts.map((a, i) => (
          <p key={i} className="text-red-500 text-sm">
            {a}
          </p>
        ))}
      </div>
    </div>
  );
}