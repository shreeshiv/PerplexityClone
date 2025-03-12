export interface Citation {
  url: string;
  title: string;
  text: string;
}

export type MessageSender = "user" | "bot";

export interface Message {
  id: number;
  text: string;
  sender: MessageSender;
  image?: string;
  citations?: Citation[];
  search_id?: string;
  reasoning?: string;
} 