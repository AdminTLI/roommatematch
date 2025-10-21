'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Video, 
  Camera, 
  Mic, 
  Play,
  Upload,
  Eye,
  MessageSquare,
  Heart
} from 'lucide-react'

export function VideoIntrosContent() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Video Introductions</h1>
          <p className="text-lg text-gray-600 mt-1">Show your personality through video introductions</p>
        </div>
        <Button className="flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Record Video
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Video className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Your Videos</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">127</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Likes Received</p>
                <p className="text-2xl font-bold text-gray-900">23</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Comments</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Your Videos */}
      <Card>
        <CardHeader>
          <CardTitle>Your Video Introductions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { title: "Welcome & About Me", duration: "2:30", views: 45, likes: 8, status: "published" },
            { title: "My Living Style", duration: "1:45", views: 32, likes: 6, status: "published" },
            { title: "Hobbies & Interests", duration: "3:15", views: 50, likes: 9, status: "published" }
          ].map((video, index) => (
            <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Play className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-gray-900">{video.title}</h4>
                  <Badge variant="secondary">{video.duration}</Badge>
                  <Badge variant={video.status === 'published' ? 'default' : 'secondary'}>
                    {video.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {video.views} views
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    {video.likes} likes
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline">Edit</Button>
                <Button size="sm">Share</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recording Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Recording Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Video Quality</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Use good lighting (natural light is best)</li>
                <li>• Keep your camera steady</li>
                <li>• Look at the camera, not the screen</li>
                <li>• Speak clearly and at a good pace</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Content Ideas</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Introduce yourself and your background</li>
                <li>• Talk about your living preferences</li>
                <li>• Share your hobbies and interests</li>
                <li>• Mention what you're looking for in a roommate</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
