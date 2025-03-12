import { ScrollArea } from "@/components/ui/scroll-area";
import { Message, Citation } from "@/types/chat";
import { MessageActions } from "./message-actions";
import { toast } from "sonner";

interface MessageListProps {
  messages: Message[];
  onRegenerate: (messageId: number) => void;
}

export function MessageList({ messages, onRegenerate }: MessageListProps) {
  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleShare = async (message: Message) => {
    try {
      if (navigator.share) {
        await navigator.share({
          text: message.text,
          title: "Shared from AI Chat",
        });
      } else {
        throw new Error("Share not supported");
      }
    } catch (err) {
      toast.error("Sharing not supported on this device");
    }
  };

  const handleLike = (messageId: number) => {
    toast.success("Thanks for your feedback!");
    // Implement feedback handling logic here
  };

  const handleDislike = (messageId: number) => {
    toast.success("Thanks for your feedback!");
    // Implement feedback handling logic here
  };

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex flex-col ${
              message.sender === "user" ? "items-end" : "items-start"
            }`}
          >
            <div
              className={`rounded-lg px-4 py-2 max-w-[85%] ${
                message.sender === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-800 text-zinc-100"
              }`}
            >
              <p>{message.text}</p>
              {message.image && (
                <img
                  src={message.image}
                  alt="User uploaded"
                  className="mt-2 max-w-sm rounded"
                />
              )}
              {message.citations && message.citations.length > 0 && (
                <div className="mt-2 space-y-2">
                  <p className="text-sm text-zinc-400">Sources:</p>
                  {message.citations.map((citation, index) => (
                    <div key={index} className="text-sm border border-zinc-700 rounded p-2">
                      <a
                        href={citation.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        {citation.title}
                      </a>
                      <p className="text-zinc-400 mt-1">{citation.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {message.sender === "bot" && (
              <button
                onClick={() => onRegenerate(message.id)}
                className="text-xs text-zinc-500 mt-1 hover:text-zinc-300"
              >
                Regenerate response
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 