import { create } from 'zustand';
import { Message } from '@/types/chat';

const initialMessage: Message = {
    id: Date.now().toString(),
    content: 'Hello! I\'m an AI assistant. What would you like to discuss?',
    role: 'assistant',
    timestamp: new Date(),
};

interface MessageStore {
    messages: Message[];
    sendMessage: (input: string, done: () => void) => void;
    clearMessages: (text: string) => void;
    likeMessage: (id: string) => void;
    dislikeMessage: (id: string) => void;
    copyMessage: (id: string) => void;
}

const useMessageStore = create<MessageStore>((set, get) => ({
    messages: [initialMessage],

    copyMessage: (messageId: string) => {
        const setCopied = (value: boolean) => get().messages.map(o => {
            if (o.id === messageId) {
                o.copied = value;
            }
            return o;
        })

        set({ messages: setCopied(true) });
        setTimeout(() => {
            set({ messages: setCopied(false) })
        }, 2000);
    },

    clearMessages: (text: string) => set({ messages: [ { ...initialMessage, content: text } ] }),

    likeMessage: (messageId: string) => set(state => {
        return {
            messages: state.messages.map(message => {
                if (message.id === messageId) {
                    message.liked = !message.liked;
                    message.disliked = message.disliked ? false : message.disliked;
                }
                return { ...message }
            })
        }
    }),

    dislikeMessage: (messageId: string) => set(state => {
        return {
            messages: state.messages.map(message => {
                if (message.id === messageId) {
                    message.disliked = !message.disliked;
                    message.liked = message.liked ? false : message.liked;
                }
                return { ...message }
            })
        }
    }),

    sendMessage: async (input: string, cb = () => {}) => {
        const userMessage: Message = {
            id: Date.now().toString(),
            content: input,
            role: 'user',
            timestamp: new Date(),
        }

        set(state => ({ messages: [...state.messages, userMessage] }));

        // AI Message Placeholder
        const aiMessageId = (Date.now() + 1).toString();
        set(state => ({ messages: [
            ...state.messages, {
                id: aiMessageId,
                content: '',
                role: 'assistant',
                timestamp: new Date(),
            }]
        }));

        try {
            const allMessages = get().messages.filter(o => o.content.length > 0).map(msg => ({
                role: msg.role,
                content: msg.content
            }))

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: allMessages,
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to get response')
            }

            if (!response.body) {
                throw new Error('Response body is empty')
            }

            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            let content = ''

            while (true) {
                const { done, value } = await reader.read()

                if (done) {
                    break
                }

                const chunk = decoder.decode(value)
                content += chunk

                set(state => ({
                    messages: state.messages.map(msg => msg.id === aiMessageId ? { ...msg, content } : msg)
                }));
            }
        } catch (error) {
            set(state => ({
                    messages: state.messages.map(msg => msg.id === aiMessageId ? { ...msg, content: 'Sorry, an error occurred. Please try again.' } : msg)
                })
            );
        } finally {
            cb();
        }
    }
}))

export default useMessageStore;