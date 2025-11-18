import { redirect } from 'next/navigation'

interface ChatPageProps {
  params: Promise<{
    roomId: string
  }>
}

export default async function ChatPage({ params }: ChatPageProps) {
  // Privacy protection: Always redirect to /chat
  // This prevents roomId/userId exposure in URLs
  redirect('/chat')
}
