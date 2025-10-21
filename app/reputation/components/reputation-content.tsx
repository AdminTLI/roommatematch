'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Star, 
  Award, 
  Users, 
  Shield,
  TrendingUp,
  MessageSquare,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'

export function ReputationContent() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reputation Profile</h1>
        <p className="text-lg text-gray-600 mt-1">Build trust through verified endorsements and references</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Overall Rating</p>
                <p className="text-2xl font-bold text-gray-900">4.8/5</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Endorsements</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">References</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Trust Score</p>
                <p className="text-2xl font-bold text-gray-900">95%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Endorsements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { name: "Emma van der Berg", rating: 5, comment: "Great roommate! Always clean and respectful.", date: "2 days ago" },
            { name: "Lucas Janssen", rating: 5, comment: "Very reliable and friendly. Highly recommend!", date: "1 week ago" },
            { name: "Sofia Rodriguez", rating: 4, comment: "Good communicator and organized.", date: "2 weeks ago" }
          ].map((endorsement, index) => (
            <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                {endorsement.name[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-gray-900">{endorsement.name}</h4>
                  <Badge variant="secondary">{endorsement.rating}/5</Badge>
                  <span className="text-sm text-gray-500">{endorsement.date}</span>
                </div>
                <p className="text-sm text-gray-600">{endorsement.comment}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
