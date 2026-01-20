export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface ChatRequest {
    messages: ChatMessage[];
    model: string;
    temperature?: number;
    system_prompt?: string;
}

export interface Message {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    liked?: boolean;
    disliked?: boolean;
    copied?: boolean;
    timestamp: Date;
}