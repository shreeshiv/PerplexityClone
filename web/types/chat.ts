export interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
  image?: string;
  reasoning?: string;
} 