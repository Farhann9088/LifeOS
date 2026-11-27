
import { useEffect, useRef, useState } from "react";
import {
  Send, Sparkles, Bot, User, Plus, Trash2,
  MessageSquare, Loader2
} from "lucide-react";
import api from "../services/api";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Nova() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    const message = input.trim();

    if (!message || loading) return;

    const updatedMessages: Message[] = [
      ...messages,
      { role: "user", content: message },
    ];

    setMessages(updatedMessages);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/ai/chat", {
        message,
        history: messages.map((item) => ({
          role: item.role,
          content: item.content,
        })),
      });

      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content: response.data.reply,
        },
      ]);
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        "NOVA couldn't respond. Please try again."
      );
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const clearChat = () => {
    if (loading) return;
    setMessages([]);
    setError("");
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestions = [
    "Help me plan my day",
    "Show me how to improve my productivity",
    "Help me stay consistent with my goals",
    "Suggest skills I should learn next",
  ];

  return (
    <div className="nova-page">
      <div className="nova-header">
        <div className="nova-title">
          <div className="nova-avatar">
            <Sparkles size={22} />
          </div>
          <div>
            <span className="page-eyebrow">YOUR PERSONAL AI ASSISTANT</span>
            <h1>NOVA</h1>
            <p>Your companion for planning, learning and growing.</p>
          </div>
        </div>

        <button className="nova-clear-btn" onClick={clearChat} disabled={loading}>
          <Trash2 size={16} />
          Clear chat
        </button>
      </div>

      <div className="nova-chat-container">
        <div className="nova-messages">
          {messages.length === 0 ? (
            <div className="nova-welcome">
              <div className="nova-welcome-icon">
                <Sparkles size={30} />
              </div>

              <span className="page-eyebrow">WELCOME TO YOUR PERSONAL ASSISTANT</span>
              <h2>Hey! I'm NOVA.</h2>
              <p>
                I can help you organize your tasks, think through your goals,
                track your learning and make better decisions.
                What would you like to work on today?
              </p>

              <div className="nova-suggestions">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                  >
                    <MessageSquare size={15} />
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="nova-message-list">
              {messages.map((message, index) => (
                <div
                  className={`nova-message ${message.role}`}
                  key={index}
                >
                  <div className="nova-message-avatar">
                    {message.role === "assistant"
                      ? <Sparkles size={17} />
                      : <User size={17} />}
                  </div>

                  <div className="nova-message-content">
                    <span className="nova-sender">
                      {message.role === "assistant" ? "NOVA" : "You"}
                    </span>
                    <div className="nova-message-bubble">
                      {message.content}
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="nova-message assistant">
                  <div className="nova-message-avatar">
                    <Sparkles size={17} />
                  </div>
                  <div className="nova-message-content">
                    <span className="nova-sender">NOVA</span>
                    <div className="nova-message-bubble nova-typing">
                      <Loader2 size={16} className="nova-spinner" />
                      Thinking...
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}

          {error && (
            <div className="nova-error">
              {error}
              <button onClick={() => setError("")}>Dismiss</button>
            </div>
          )}
        </div>

        <div className="nova-composer-area">
          <div className="nova-composer">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask NOVA anything..."
              rows={1}
              disabled={loading}
            />

            <button
              className="nova-send-btn"
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              title="Send message"
            >
              {loading ? <Loader2 size={18} /> : <Send size={18} />}
            </button>
          </div>
          <p className="nova-disclaimer">
            NOVA can make mistakes. Review important information before acting.
          </p>
        </div>
      </div>
    </div>
  );
}
