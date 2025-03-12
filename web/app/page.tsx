"use client";

import { useState } from "react";
import { WelcomeView } from "@/components/chat/welcome-view";
import { ChatInput } from "@/components/chat/chat-input";
import { MessageList } from "@/components/chat/message-list";
import { Message } from "@/types/chat";
import { toast } from "sonner";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const handleSend = async () => {
    if ((!inputText.trim() && !selectedImage) || isLoading) return;

    const formData = new FormData();
    if (selectedImage) {
      formData.append("image", selectedImage);
    }

    const userMessage = { 
      id: messages.length + 1, 
      text: inputText, 
      sender: "user" as const,
      image: selectedImage ? URL.createObjectURL(selectedImage) : undefined
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const messageHistory = messages.concat(userMessage).map(({ text, sender }) => ({
        text,
        sender,
      }));

      formData.append("messages", JSON.stringify(messageHistory));

      const response = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      
      const botMessage = {
        id: messages.length + 2,
        text: data.message.text,
        sender: "bot" as const,
        reasoning: data.message.reasoning
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Error:", error);
      setMessages(prev => [
        ...prev,
        {
          id: prev.length + 1,
          text: "Sorry, there was an error processing your request.",
          sender: "bot",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async (messageId: number) => {
    if (isLoading) return;

    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;

    // Get the conversation up to this message
    const conversationHistory = messages.slice(0, messageIndex).map(({ text, sender }) => ({
      text,
      sender,
    }));

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("messages", JSON.stringify(conversationHistory));

      const response = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      
      const newBotMessage = {
        id: messages.length + 1,
        text: data.message.text,
        sender: "bot" as const,
        reasoning: data.message.reasoning
      };
      
      // Replace the old message and remove subsequent messages
      setMessages(prev => [...prev.slice(0, messageIndex), newBotMessage]);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to regenerate response");
    } finally {
      setIsLoading(false);
    }
  };

  // Show welcome view if no messages
  if (messages.length === 0) {
    return (
      <WelcomeView
        inputText={inputText}
        setInputText={setInputText}
        handleSend={handleSend}
        isLoading={isLoading}
        setSelectedImage={setSelectedImage}
        selectedImage={selectedImage}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <MessageList 
        messages={messages} 
        onRegenerate={handleRegenerate}
      />
      <div className="border-t border-zinc-800 p-4">
        <div className="max-w-2xl mx-auto">
          <ChatInput
            inputText={inputText}
            setInputText={setInputText}
            handleSend={handleSend}
            isLoading={isLoading}
            setSelectedImage={setSelectedImage}
            selectedImage={selectedImage}
          />
        </div>
      </div>
    </div>
  );
}
