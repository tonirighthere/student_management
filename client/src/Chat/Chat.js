import React, { useState, useEffect } from "react";
import axios from "axios";

export const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const username = sessionStorage.getItem("msv");

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await axios.post("http://localhost:5000/api/messages", {
        username,
        message: newMessage,
        timestamp: Date.now()
      });
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/messages");
        setMessages(response.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, overflow: "auto", padding: "20px" }}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              margin: "10px 0",
              padding: "10px",
              backgroundColor: msg.username === username ? "#e3f2fd" : "#f5f5f5",
              borderRadius: "10px",
              alignSelf: msg.username === username ? "flex-end" : "flex-start"
            }}
          >
            <strong>{msg.username}:</strong> {msg.message}
          </div>
        ))}
      </div>
      <form
        onSubmit={sendMessage}
        style={{
          padding: "20px",
          borderTop: "1px solid #ccc",
          display: "flex",
          gap: "10px"
        }}
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          style={{ flex: 1, padding: "10px" }}
          placeholder="Type a message..."
        />
        <button
          type="submit"
          style={{
            padding: "10px 20px",
            backgroundColor: "#1976d2",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
};
