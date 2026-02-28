import "./ChatPage.css";
import PageLayout from "../layouts/PageLayout";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  doc,
  onSnapshot,
  collection,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuth } from "../firebase/AuthContext";

export default function ChatPage() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [service, setService] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  // Protect route
  useEffect(() => {
    if (!currentUser) navigate("/login");
  }, [currentUser, navigate]);

  // Load service
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "services", serviceId), (snap) => {
      if (!snap.exists()) return navigate("/");
      setService({ id: snap.id, ...snap.data() });
    });

    return () => unsub();
  }, [serviceId, navigate]);

  // Load other user
  useEffect(() => {
    if (!service || !currentUser) return;

    const otherId =
      currentUser.uid === service.creatorId
        ? service.businessId
        : service.creatorId;

    const unsub = onSnapshot(doc(db, "users", otherId), (snap) => {
      if (snap.exists()) {
        setOtherUser({ id: snap.id, ...snap.data() });
      }
    });

    return () => unsub();
  }, [service, currentUser]);

  // Load messages
  useEffect(() => {
    const q = query(
      collection(db, "services", serviceId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
      setMessages(list);
    });

    return () => unsub();
  }, [serviceId]);

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);

      await addDoc(collection(db, "services", serviceId, "messages"), {
        senderId: currentUser.uid,
        text: newMessage.trim(),
        createdAt: serverTimestamp(),
      });

      setNewMessage("");
    } catch (err) {
      console.error("Send failed:", err);
    } finally {
      setSending(false);
    }
  };

  if (!service) {
    return (
      <PageLayout>
        <p style={{ padding: 40 }}>Loading chat...</p>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="chat-wrapper">
        <div className="chat-card">
          
          {/* HEADER */}
          <div className="chat-header">
            <button
              className="back-link"
              onClick={() => navigate(`/service/${serviceId}`)}
            >
              ← Back to Project
            </button>

            {otherUser && (
              <div className="chat-user">
                <img
                  src={otherUser.photo || "/default_user.png"}
                  alt=""
                  className="chat-avatar"
                />

                <div>
                  <div className="chat-name">
                    {otherUser.name || "User"}
                  </div>

                  <div
                    className={`chat-status ${
                      otherUser.isOnline ? "online" : "offline"
                    }`}
                  >
                    {otherUser.isOnline
                      ? "Online"
                      : otherUser.lastSeen
                      ? `Last seen ${new Date(
                          otherUser.lastSeen.seconds
                            ? otherUser.lastSeen.seconds * 1000
                            : otherUser.lastSeen
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}`
                      : "Offline"}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* BODY */}
          <div className="chat-body">
            {messages.length === 0 && (
              <div className="chat-empty">
                Start the conversation.
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-row ${
                  msg.senderId === currentUser.uid ? "mine" : "theirs"
                }`}
              >
                <div className="chat-bubble">
                  <div>{msg.text}</div>

                  {msg.createdAt && (
                    <div className="chat-time">
                      {new Date(
                        msg.createdAt.seconds * 1000
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* INPUT */}
          <div className="chat-input-area">
            <input
              placeholder="Write a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
            />
            <button onClick={sendMessage} disabled={sending}>
              {sending ? "..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
