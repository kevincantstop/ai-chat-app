import ChatContainer from '../components/chat/ChatContainer'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI 智能聊天助手',
  description: '基于 Next.js 和 shadcn/ui 构建的现代化 AI 聊天界面',
}

export default function Home() {
  return <ChatContainer />;
}
