"use client"

import { useState, useRef, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import {
    Send,
    Bot,
    User,
    Copy,
    ThumbsUp,
    ThumbsDown,
    Check,
    Clock,
    Trash2
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { motion, AnimatePresence } from 'framer-motion'
import useMessageStore from "@/store/message-store";

export default function ChatContainer({}) {
    const messages = useMessageStore(state => state.messages);
    const sendMessage = useMessageStore(state => state.sendMessage);
    const clearMessage = useMessageStore(state => state.clearMessages);
    const likeMessage = useMessageStore(state => state.likeMessage);
    const dislikeMessage = useMessageStore(state => state.dislikeMessage);
    const copyMessage = useMessageStore(state => state.copyMessage);

    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || isLoading) return

        setInput('')
        setIsLoading(true)

        sendMessage(input, () => {
            setIsLoading(false);
        })
    }

    const handleCopy = (messageId: string, text: string) => {
        navigator.clipboard.writeText(text);
        copyMessage(messageId);
    }

    const handleLike = (messageId: string) => {
        likeMessage(messageId);
    }

    const handleDislike = (messageId: string) => {
        dislikeMessage(messageId);
    }

    const clearChat = () => {
        clearMessage('Chat history cleared. How can I assist you?');
    }

    const formatTime = (date: Date) => date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    })

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-gray-100">
            {/* Minimal Header */}
            <div className="border-b border-gray-800 px-4 py-3">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-linear-to-r from-blue-500 to-purple-500 rounded-lg">
                            <Bot className="h-4 w-4" />
                        </div>
                        <h1 className="font-medium">AI Chat</h1>
                    </div>
                    <button
                        onClick={clearChat}
                        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-200"
                    >
                        <Trash2 className="h-4 w-4" />
                        Clear
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="max-w-3xl mx-auto space-y-6">
                    <AnimatePresence>
                        {messages.map((message) => (
                            <motion.div
                                key={message.id}
                                initial={{ opacity: 0, x: message.role === 'user' ? 20 : -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                            >
                                {/* Avatar */}
                                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 ${
                                    message.role === 'assistant'
                                        ? 'bg-linear-to-r from-blue-600 to-purple-600'
                                        : 'bg-gray-700'
                                }`}>
                                    {message.role === 'assistant' ? (
                                        <Bot className="w-4 h-4" />
                                    ) : (
                                        <User className="w-4 h-4" />
                                    )}
                                </div>

                                {/* Message Content */}
                                <div className="max-w-[85%]">
                                    <div
                                        className={`rounded-2xl px-4 py-3 ${
                                            message.role === 'user'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-800 border border-gray-700'
                                        }`}
                                    >
                                        <div className="prose prose-invert prose-sm max-w-none wrap-break-word">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {message.content}
                                            </ReactMarkdown>
                                        </div>

                                        {/* Action Buttons for AI messages */}
                                        {message.role === 'assistant' && (
                                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700">
                                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                                    <Clock className="h-3 w-3" />
                                                    {formatTime(message.timestamp)}
                                                </div>

                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => handleCopy(message.id, message.content)}
                                                        className={`p-1.5 rounded hover:bg-gray-700 ${message.copied ? 'text-green-400' : 'text-gray-400 hover:text-gray-200'}`}
                                                        title="Copy"
                                                    >
                                                        {message.copied ? (
                                                            <Check className="w-3.5 h-3.5" />
                                                        ) : (
                                                            <Copy className="w-3.5 h-3.5" />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => handleLike(message.id)}
                                                        className={`p-1.5 rounded hover:bg-gray-700 ${message.liked ? 'text-blue-400' : 'text-gray-400 hover:text-gray-200'}`}
                                                        title={message.liked ? "Liked" : "Like"}
                                                    >
                                                        <ThumbsUp className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDislike(message.id)}
                                                        className={`p-1.5 rounded hover:bg-gray-700 ${message.disliked ? 'text-red-400' : 'text-gray-400 hover:text-gray-200'}`}
                                                        title={message.disliked ? "Disliked" : "Dislike"}
                                                    >
                                                        <ThumbsDown className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-linear-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                                <Bot className="w-4 h-4" />
                            </div>
                            <div className="bg-gray-800 border border-gray-700 rounded-2xl px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                                    </div>
                                    <span className="text-sm text-gray-400">AI is typing...</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-800 p-4">
                <div className="max-w-3xl mx-auto">
                    <form onSubmit={handleSubmit} className="relative">
                        <Textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your message here..."
                            className="min-h-15 pr-12 resize-none bg-gray-800 border-gray-700 focus:border-blue-500 focus-visible:ring-0 text-gray-100"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault()
                                    handleSubmit(e)
                                }
                            }}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="absolute right-2 bottom-2 p-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}