import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const FREE_MESSAGE_LIMIT = 3;

const Chat = () => {
  const { connectionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [otherUser, setOtherUser] = useState<any>(null);
  const [messageCount, setMessageCount] = useState(0);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || !connectionId) return;

    // Load connection + other user's profile
    const loadConnection = async () => {
      const { data: conn } = await supabase
        .from("connections")
        .select("*")
        .eq("id", connectionId)
        .single();

      if (!conn) return navigate("/messages");

      const otherId = conn.requester_id === user.id ? conn.receiver_id : conn.requester_id;

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", otherId)
        .single();

      setOtherUser({ ...profile, user_id: otherId });

      // Load messages
      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${user.id})`
        )
        .order("created_at", { ascending: true });

      setMessages(msgs || []);
      setMessageCount(
        (msgs || []).filter((m: any) => m.sender_id === user.id).length
      );
    };

    loadConnection();
  }, [user, connectionId, navigate]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !user || !otherUser || sending) return;

    if (messageCount >= FREE_MESSAGE_LIMIT) {
      toast.error("You've reached the free message limit. Upgrade to keep chatting!");
      return;
    }

    setSending(true);
    const { data, error } = await supabase
      .from("messages")
      .insert({
        sender_id: user.id,
        receiver_id: otherUser.user_id,
        content: newMessage.trim(),
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to send message");
    } else if (data) {
      setMessages((prev) => [...prev, data]);
      setMessageCount((c) => c + 1);
      setNewMessage("");
    }
    setSending(false);
  };

  const remainingMessages = FREE_MESSAGE_LIMIT - messageCount;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-14 pb-3 border-b border-border bg-card/80 backdrop-blur-xl">
        <button onClick={() => navigate("/messages")} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        {otherUser && (
          <div className="flex items-center gap-3">
            <img
              src={otherUser.avatar_url || ""}
              alt={otherUser.display_name}
              className="w-9 h-9 rounded-full object-cover bg-primary/10"
            />
            <div>
              <h2 className="font-semibold text-foreground text-sm">{otherUser.display_name || "User"}</h2>
              <span className="text-[10px] text-muted-foreground">
                {remainingMessages > 0
                  ? `${remainingMessages} free message${remainingMessages !== 1 ? "s" : ""} left`
                  : "Message limit reached"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-sm text-muted-foreground mt-12">
            <p className="font-medium">Start the conversation!</p>
            <p className="text-xs mt-1">You have {FREE_MESSAGE_LIMIT} free messages — make them count 😉</p>
          </div>
        )}
        {messages.map((msg) => {
          const isMine = msg.sender_id === user?.id;
          return (
            <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                  isMine
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-surface-warm text-foreground rounded-bl-md"
                }`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Paywall banner */}
      {remainingMessages <= 0 && (
        <div className="px-4 py-3 bg-accent/10 border-t border-accent/20">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-accent" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Upgrade to keep chatting</p>
              <p className="text-xs text-muted-foreground">Or share your socials — that's the move anyway 😎</p>
            </div>
            <button className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold">
              Upgrade
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 pb-6 border-t border-border bg-card/80 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <div className="flex-1 rounded-2xl bg-surface-warm px-4 py-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={remainingMessages > 0 ? "Type a message..." : "Upgrade to send more"}
              disabled={remainingMessages <= 0}
              className="w-full bg-transparent text-foreground text-sm outline-none placeholder:text-muted-foreground/50 disabled:opacity-50"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || remainingMessages <= 0 || sending}
            className="w-11 h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-30 active:scale-95 transition-transform"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
