import OpenAI from 'openai';

export const chatgpt = new OpenAI({
    apiKey: process.env.CHAPGPT_API_KEY || '',
});