import { ScrollArea } from "@/components/ui/scroll-area";
import { Message } from "@/types/chat";
import { MessageActions } from "./message-actions";
import { toast } from "sonner";

interface MessageListProps {
  messages: Message[];
  onRegenerate?: (messageId: number) => void;
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
    <ScrollArea className="flex-1 p-4">
      <div className="max-w-2xl mx-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-6 ${
              message.sender === "bot" 
                ? "bg-zinc-900 p-4 rounded-lg" 
                : ""
            }`}
          >
            {message.image && (
              <img 
                src={message.image} 
                alt="Uploaded content"
                className="max-w-full h-auto rounded-lg mb-2"
              />
            )}
            <div className="text-zinc-200">
              {message.text}
            </div>
            {message.reasoning && (
              <div className="mt-2 text-sm text-zinc-400">
                {message.reasoning}
              </div>
            )}
            <MessageActions
              onCopy={() => handleCopy(message.text)}
              onShare={() => handleShare(message)}
              onLike={() => handleLike(message.id)}
              onDislike={() => handleDislike(message.id)}
              onRegenerate={
                message.sender === "bot" && onRegenerate 
                  ? () => onRegenerate(message.id)
                  : undefined
              }
              isBot={message.sender === "bot"}
            />
          </div>
        ))}
      </div>
    </ScrollArea>
  );
} 