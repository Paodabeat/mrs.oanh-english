// types.ts

export enum MessageSender {
  AI = 'ai',
  User = 'user',
}

export interface Message {
  id: string;
  text: string;
  sender: MessageSender;
}

export type ProficiencyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface ConversationSetup {
  title: string;
  vocab: string;
  level: ProficiencyLevel;
  avatarUrl?: string;
}

export interface SavedWord {
  original: string;
  translation: string;
  ipa: string;
  definition: string;
  example: string;
  notes?: string; // Add personal notes field
}

export interface SavedConversation {
  id:string;
  setup: ConversationSetup;
  messages: Message[];
  timestamp: string;
  botName: string;
}