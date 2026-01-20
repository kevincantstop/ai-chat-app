import { ChatCompletionMessageParam, ChatCompletionChunk } from 'openai/resources/chat/completions';
import { Stream } from "openai/streaming";
import { APIPromise } from "openai/core/api-promise";

import { deepseek } from '@/lib/deepseek';
import { chatgpt } from '@/lib/chatgpt';

class LLM {
    createStream(messages: ChatCompletionMessageParam[], temperature: number = 0.7): APIPromise<Stream<ChatCompletionChunk>> {
        if (this.isDeepseek()) {
            return deepseek.chat.completions.create({
                model: "deepseek-chat",
                messages,
                temperature: Math.max(0.1, Math.min(2.0, temperature)),
                stream: true
            });
        }
        return chatgpt.chat.completions.create({
            model: "gpt-4o",
            messages,
            temperature: Math.max(0.1, Math.min(2.0, temperature)),
            stream: true
        });
    }

    isDeepseek(): boolean {
        return process.env.LLM_MODEL === 'deepseek';
    }

    isKeyConfigured(): boolean {
        if (this.isDeepseek()) {
            return (process.env.DEEPSEEK_API_KEY ?? '').trim().length > 0;
        }
        return (process.env.CHAPGPT_API_KEY ?? '').trim().length > 0;
    }
}

const llm = new LLM();

export default llm;