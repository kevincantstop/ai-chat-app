import { deepseek } from '@/lib/deepseek';
import { NextRequest } from 'next/server';
import { SYSTEM_ROLES } from '@/lib/roles';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            messages,
            model = 'deepseek-chat',
            temperature = 0.7,
            system_prompt = SYSTEM_ROLES[0].prompt,
        } = body;

        // 验证消息
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return new Response(
                JSON.stringify({ error: 'Messages are required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const allMessages = [...messages];
        if (system_prompt && system_prompt.trim()) {
            allMessages.unshift({
                role: 'system',
                content: system_prompt.trim()
            });
        }

        if (!process.env.DEEPSEEK_API_KEY) {
            return new Response(
                JSON.stringify({ error: 'API key is not configured' }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const stream = await deepseek.chat.completions.create({
            model,
            messages: allMessages,
            temperature: Math.max(0.1, Math.min(2.0, temperature)),
            max_tokens: 2048,
            stream: true,
        });

        const encoder = new TextEncoder();

        const readableStream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of stream) {
                        const content = chunk.choices[0]?.delta?.content || '';
                        if (content) {
                            controller.enqueue(encoder.encode(content));
                        }
                    }
                    controller.close();
                } catch (error) {
                    console.error('Stream error:', error);
                    controller.enqueue(
                        encoder.encode('\n\n[Error: Stream processing failed]')
                    );
                    controller.close();
                }
            },
        });

        return new Response(readableStream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });

    // eslint-disable-next-line
    } catch (error: any) {
        console.error('API error:', error);

        return new Response(
            JSON.stringify({
                error: error.message || 'Failed to process request',
            }),
            {
                status: error.status || 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}