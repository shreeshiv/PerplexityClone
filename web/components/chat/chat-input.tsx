import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImagePlus } from "lucide-react";

interface ChatInputProps {
  inputText: string;
  setInputText: (text: string) => void;
  handleSend: () => void;
  isLoading: boolean;
  setSelectedImage: (file: File | null) => void;
  selectedImage: File | null;
}

export function ChatInput({
  inputText,
  setInputText,
  handleSend,
  isLoading,
  setSelectedImage,
  selectedImage,
}: ChatInputProps) {
  return (
    <>
      <div className="flex gap-2 bg-zinc-900 p-2 rounded-lg">
        <Input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask anything..."
          className="flex-1 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-white placeholder:text-zinc-400"
        />
        <div className="flex gap-2">
          <label 
            htmlFor="imageUpload" 
            className="cursor-pointer p-2 hover:bg-zinc-800 rounded-md"
          >
            <ImagePlus className="h-5 w-5 text-zinc-400" />
            <input
              id="imageUpload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
            />
          </label>
          <Button 
            onClick={handleSend}
            disabled={isLoading}
            className="bg-zinc-800 hover:bg-zinc-700 text-white"
          >
            {isLoading ? "..." : "Send"}
          </Button>
        </div>
      </div>
      {selectedImage && (
        <div className="mt-2 text-sm text-zinc-400">
          Selected image: {selectedImage.name}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedImage(null)}
            className="ml-2 text-zinc-400 hover:text-white"
          >
            Remove
          </Button>
        </div>
      )}
    </>
  );
} 