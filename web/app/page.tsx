"use client";

import { useState } from "react";
import { WelcomeView } from "@/components/chat/welcome-view";
import { ChatInput } from "@/components/chat/chat-input";
import { MessageList } from "@/components/chat/message-list";
import { Message, MessageSender } from "@/types/chat";
import { toast } from "sonner";
import { useContext } from "react";
import { useSearchMode } from "@/contexts/search-mode-context";

interface ChatMessage {
  id: number;
  text: string;
  sender: MessageSender;
  image?: string;
  citations?: Citation[];
  search_id?: string;
  reasoning?: string;
}

interface Citation {
  url: string;
  title: string;
  text: string;
}

// First, let's create a new type for the API endpoints
const API_ENDPOINTS = {
  normal: "http://localhost:8000/api/chat",
  open: "http://localhost:8000/api/chat/open-search"
} as const;

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const { activeSearchModes } = useSearchMode();

  // Helper function to determine which API endpoint to use
  const getApiEndpoint = (activeSearchModes: Set<string>): string => {
    if (activeSearchModes.has("open")) {
      return API_ENDPOINTS.open;
    }
    return API_ENDPOINTS.normal;
  };

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
      const messageHistory = messages.concat(userMessage).map(({ text, sender, citations }) => ({
        text,
        sender,
        citations,
      }));

      formData.append("messages", JSON.stringify(messageHistory));
      
      const apiEndpoint = getApiEndpoint(activeSearchModes);

      const response = await fetch(apiEndpoint, {
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
        reasoning: data.message.reasoning,
        citations: data.message.citations,
        search_id: data.message.search_id
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

      const apiEndpoint = getApiEndpoint(activeSearchModes);

      const response = await fetch(apiEndpoint, {
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
        reasoning: data.message.reasoning,
        citations: data.message.citations,
        search_id: data.message.search_id
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
