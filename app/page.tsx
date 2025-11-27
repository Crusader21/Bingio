"use client";

import { useEffect, useRef, useState } from "react";

type Msg = {
  id: string;
  role: "assistant" | "user";
  text: string;
  time?: string;
};

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function Page() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: "m1",
      role: "assistant",
      text: "Hello! I'm Bingio — tell me how you feel and who you're watching with, and I'll recommend a film or series for your vibe.",
      time: nowTime(),
    },
  ]);

  const [value, setValue] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // auto-scroll to bottom on new message
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight + 600;
    }
  }, [messages]);

  function addUserMessage(text: string) {
    const m: Msg = { id: crypto.randomUUID(), role: "user", text, time: nowTime() };
    setMessages((s) => [...s, m]);
    return m;
  }

  function mockBotReply(userText: string) {
    // small mock logic — replace with real API call later
    const reply = `Nice — you said: "${userText}". Are you feeling upbeat, nostalgic, or relaxed? Also who are you watching with?`;
    const m: Msg = { id: crypto.randomUUID(), role: "assistant", text: reply, time: nowTime() };
    setTimeout(() => setMessages((s) => [...s, m]), 700);
  }

  function handleSend(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    addUserMessage(trimmed);
    setValue("");
    mockBotReply(trimmed);
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-inner">
          <div className="header-left" style={{ marginRight: "auto" }}>
            <div className="header-avatar">B</div>
            <div>
              <div className="header-title">Chat with Bingio</div>
              <div className="header-sub">Emotion-aware movie & series recommendations</div>
            </div>
          </div>

          <div style={{ marginLeft: "auto" }}>
            <button style={{
              borderRadius: 10, padding: "8px 12px", border: "1px solid rgba(15,23,42,0.06)",
              background: "#fff"
            }}>+ New</button>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="chat-column">
          <div ref={listRef} className="message-wall" role="list" aria-label="Messages">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`message-row ${m.role === "assistant" ? "assistant" : "user"}`}
                role="listitem"
              >
                {m.role === "assistant" && <div className="message-avatar">B</div>}
                <div className="bubble" style={m.role === "user" ? { background: "linear-gradient(180deg,#ff8a66,#ff6b4d)", color: "#fff" } : undefined}>
                  <div>{m.text}</div>
                  <div className="meta">{m.time}</div>
                </div>
                {m.role === "user" && <div className="message-avatar">Y</div>}
              </div>
            ))}
          </div>
        </div>
      </main>

      <div className="input-sticky" aria-hidden={false}>
        <form className="input-bar" onSubmit={(e) => handleSend(e)}>
          <input
            type="text"
            placeholder="Type your message here..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
            aria-label="Type your message"
          />
          <button type="submit" className="send-btn" aria-label="Send">→</button>
        </form>
      </div>

      <div style={{ height: 8 }} />
      <div className="footer-note">© 2025 Granth & Nikita · Terms of Use · Powered by Ringel.AI</div>
      <div style={{ height: 28 }} />
    </div>
  );
}
