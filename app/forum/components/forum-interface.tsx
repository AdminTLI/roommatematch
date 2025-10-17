'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { 
  MessageSquare, 
  Plus, 
  Clock, 
  User as UserIcon, 
  ThumbsUp,
  AlertCircle,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react'

interface ForumInterfaceProps {
  user: User
}

interface ForumPost {
  id: string
  title: string
  content: string
  author_name: string
  is_anonymous: boolean
  created_at: string
  likes_count: number
  replies_count: number
  status: 'pending' | 'approved' | 'rejected'
  user_liked: boolean
}

export function ForumInterface({ user }: ForumInterfaceProps) {
  const supabase = createClient()
  
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    is_anonymous: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('forum_posts')
        .select(`
          id,
          title,
          content,
          author_name,
          is_anonymous,
          created_at,
          likes_count,
          replies_count,
          status,
          user_liked:forum_likes!left(user_id)
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Process the data to include user_liked status
      const processedPosts = data?.map(post => ({
        ...post,
        user_liked: post.user_liked && post.user_liked.length > 0
      })) || []

      setPosts(processedPosts)
    } catch (error) {
      console.error('Failed to load forum posts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const createPost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      const { error } = await supabase
        .from('forum_posts')
        .insert({
          title: newPost.title.trim(),
          content: newPost.content.trim(),
          author_name: newPost.is_anonymous ? 'Anonymous' : user.user_metadata?.full_name || 'UserIcon',
          is_anonymous: newPost.is_anonymous,
          user_id: user.id
        })

      if (error) throw error

      // Reset form and reload posts
      setNewPost({ title: '', content: '', is_anonymous: false })
      setShowCreateForm(false)
      loadPosts()

    } catch (error) {
      console.error('Failed to create post:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleLike = async (postId: string, currentlyLiked: boolean) => {
    try {
      if (currentlyLiked) {
        // Remove like
        const { error } = await supabase
          .from('forum_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id)

        if (error) throw error

        // Update local state
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, likes_count: post.likes_count - 1, user_liked: false }
            : post
        ))
      } else {
        // Add like
        const { error } = await supabase
          .from('forum_likes')
          .insert({
            post_id: postId,
            user_id: user.id
          })

        if (error) throw error

        // Update local state
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, likes_count: post.likes_count + 1, user_liked: true }
            : post
        ))
      }
    } catch (error) {
      console.error('Failed to toggle like:', error)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    return date.toLocaleDateString()
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Community Forum
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Connect with other students, share experiences, and get advice
            </p>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </div>

        {/* Safety Notice */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-1">
                  Safe Community Guidelines
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  This forum is moderated for your safety. Posts are reviewed before publication. 
                  Be respectful, helpful, and follow our community guidelines. All users are verified students.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Post Form */}
      {showCreateForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create New Post</CardTitle>
            <CardDescription>
              Share your thoughts, ask questions, or help other students
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="post-title" className="block text-sm font-medium mb-2">
                Title
              </label>
              <input
                id="post-title"
                type="text"
                placeholder="What's your post about?"
                value={newPost.title}
                onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={100}
              />
            </div>
            
            <div>
              <label htmlFor="post-content" className="block text-sm font-medium mb-2">
                Content
              </label>
              <Textarea
                id="post-content"
                placeholder="Share your thoughts, experiences, or ask questions..."
                value={newPost.content}
                onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                rows={4}
                maxLength={2000}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="anonymous"
                checked={newPost.is_anonymous}
                onCheckedChange={(checked) => setNewPost(prev => ({ ...prev, is_anonymous: !!checked }))}
              />
              <label htmlFor="anonymous" className="text-sm">
                Post anonymously
              </label>
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={createPost}
                disabled={isSubmitting || !newPost.title.trim() || !newPost.content.trim()}
              >
                {isSubmitting ? 'Posting...' : 'Create Post'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Posts List */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <CardTitle className="text-xl mb-2">No posts yet</CardTitle>
              <CardDescription className="mb-4">
                Be the first to start a conversation in the community forum!
              </CardDescription>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Post
              </Button>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{post.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <span>
                        {post.is_anonymous ? (
                          <span className="flex items-center gap-1">
                            <EyeOff className="h-3 w-3" />
                            Anonymous
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <UserIcon className="h-3 w-3" />
                            {post.author_name}
                          </span>
                        )}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTimeAgo(post.created_at)}
                      </span>
                    </CardDescription>
                  </div>
                  
                  {post.is_anonymous && (
                    <Badge variant="secondary" className="text-xs">
                      <EyeOff className="h-3 w-3 mr-1" />
                      Anonymous
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-wrap">
                  {post.content}
                </p>
                
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleLike(post.id, post.user_liked)}
                    className={`flex items-center gap-2 ${
                      post.user_liked ? 'text-blue-600' : 'text-gray-600'
                    }`}
                  >
                    <ThumbsUp className={`h-4 w-4 ${post.user_liked ? 'fill-current' : ''}`} />
                    {post.likes_count}
                  </Button>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MessageSquare className="h-4 w-4" />
                    {post.replies_count} replies
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
