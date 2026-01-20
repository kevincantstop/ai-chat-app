import ChatContainer from '../components/chat/ChatContainer'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI assistant',
  description: 'Welcome to AI assistant',
}

export default function Home() {
  return <ChatContainer />;
}
