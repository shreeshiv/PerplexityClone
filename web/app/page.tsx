"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ImagePlus, ChevronDown, ChevronUp } from "lucide-react";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
  image?: string;
  reasoning?: string;
  isReasoningExpanded?: boolean;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hello! How can I help you today?", sender: "bot" },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [expandedReasoning, setExpandedReasoning] = useState<number[]>([]);

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

  const toggleReasoning = (messageId: number) => {
    setExpandedReasoning(prev => 
      prev.includes(messageId) 
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="border-b px-6 py-4">
        <h1 className="text-2xl font-bold tracking-tight">Chat Interface</h1>
      </header>

      <ScrollArea className="flex-1 p-4">
        <div className="flex flex-col gap-4 max-w-3xl mx-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <Card
                className={`max-w-[70%] ${
                  message.sender === "user" ? "bg-primary" : "bg-muted"
                }`}
              >
                <CardContent
                  className={`p-3 ${
                    message.sender === "user"
                      ? "text-primary-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {message.image && (
                    <img 
                      src={message.image} 
                      alt="Uploaded content"
                      className="max-w-full h-auto rounded-lg mb-2"
                    />
                  )}
                  {message.reasoning && (
                    <div className="mb-3">
                      <button
                        onClick={() => toggleReasoning(message.id)}
                        className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        {expandedReasoning.includes(message.id) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                        Thinking Process
                      </button>
                      
                      {expandedReasoning.includes(message.id) && (
                        <div className="mt-2 pl-4 border-l-2 border-blue-200">
                          <div className="text-sm text-gray-600 bg-blue-50 rounded-md p-3">
                            {message.reasoning.split('\n').map((line, index) => (
                              <p key={index} className="mb-1 last:mb-0">
                                {line}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="text-base">
                    {message.text}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </ScrollArea>

      <footer className="border-t p-4">
        <div className="max-w-3xl mx-auto flex gap-2">
          <div className="flex-1 flex gap-2">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type a message..."
              className="flex-1"
            />
            <Label 
              htmlFor="imageUpload" 
              className="cursor-pointer p-2 hover:bg-gray-100 rounded-md"
            >
              <ImagePlus className="h-6 w-6" />
              <input
                id="imageUpload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
              />
            </Label>
          </div>
          <Button 
            onClick={handleSend}
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send"}
          </Button>
        </div>
        {selectedImage && (
          <div className="max-w-3xl mx-auto mt-2">
            <div className="text-sm text-gray-500">
              Selected image: {selectedImage.name}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedImage(null)}
                className="ml-2"
              >
                Remove
              </Button>
            </div>
          </div>
        )}
      </footer>
    </div>
  );
}
