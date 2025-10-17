'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Lightbulb, 
  Clock, 
  Settings, 
  Copy, 
  Check,
  MessageCircle,
  Users,
  Heart
} from 'lucide-react'
import { FirstQuestions } from '@/lib/matching/debrief'

interface FirstQuestionsPanelProps {
  questions: FirstQuestions
  onQuestionUsed: (question: string) => void
}

export function FirstQuestionsPanel({ questions, onQuestionUsed }: FirstQuestionsPanelProps) {
  const [copiedQuestions, setCopiedQuestions] = useState<Set<string>>(new Set())
  const [usedQuestions, setUsedQuestions] = useState<Set<string>>(new Set())

  const handleCopyQuestion = async (question: string) => {
    try {
      await navigator.clipboard.writeText(question)
      setCopiedQuestions(prev => new Set([...prev, question]))
      setTimeout(() => {
        setCopiedQuestions(prev => {
          const newSet = new Set(prev)
          newSet.delete(question)
          return newSet
        })
      }, 2000)
    } catch (error) {
      console.error('Failed to copy question:', error)
    }
  }

  const handleUseQuestion = (question: string) => {
    setUsedQuestions(prev => new Set([...prev, question]))
    onQuestionUsed(question)
  }

  const QuestionCard = ({ 
    question, 
    category, 
    icon: IconComponent 
  }: { 
    question: string
    category: string
    icon: any 
  }) => {
    const isCopied = copiedQuestions.has(question)
    const isUsed = usedQuestions.has(question)

    return (
      <Card className={`transition-all duration-200 ${isUsed ? 'bg-green-50 dark:bg-green-900/20 border-green-200' : 'hover:shadow-md'}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${isUsed ? 'bg-green-100 dark:bg-green-800' : 'bg-gray-100 dark:bg-gray-800'}`}>
              <IconComponent className={`h-4 w-4 ${isUsed ? 'text-green-600' : 'text-gray-600'}`} />
            </div>
            
            <div className="flex-1">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                {question}
              </p>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {category}
                </Badge>
                {isUsed && (
                  <Badge variant="default" className="text-xs bg-green-600">
                    Used
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleCopyQuestion(question)}
                className="h-8 w-8 p-0"
              >
                {isCopied ? (
                  <Check className="h-3 w-3 text-green-600" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
              
              {!isUsed && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleUseQuestion(question)}
                  className="h-8 text-xs"
                >
                  Use
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="border-2 border-blue-100 dark:border-blue-900/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-blue-600" />
            Conversation Starters
          </CardTitle>
          <CardDescription>
            Choose from these personalized questions to break the ice and get to know each other better
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="ice-breakers" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ice-breakers" className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            Ice Breakers
          </TabsTrigger>
          <TabsTrigger value="logistics" className="flex items-center gap-1">
            <Settings className="h-4 w-4" />
            Logistics
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            Preferences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ice-breakers" className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <Heart className="h-4 w-4 text-pink-600" />
            <h4 className="font-medium text-pink-700 dark:text-pink-300">Light & Fun</h4>
          </div>
          {questions.ice_breakers.map((question, index) => (
            <QuestionCard
              key={index}
              question={question}
              category="Ice Breaker"
              icon={Heart}
            />
          ))}
        </TabsContent>

        <TabsContent value="logistics" className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <Settings className="h-4 w-4 text-blue-600" />
            <h4 className="font-medium text-blue-700 dark:text-blue-300">Practical Matters</h4>
          </div>
          {questions.logistics.map((question, index) => (
            <QuestionCard
              key={index}
              question={question}
              category="Logistics"
              icon={Settings}
            />
          ))}
        </TabsContent>

        <TabsContent value="preferences" className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4 text-purple-600" />
            <h4 className="font-medium text-purple-700 dark:text-purple-300">Living Preferences</h4>
          </div>
          {questions.preferences.map((question, index) => (
            <QuestionCard
              key={index}
              question={question}
              category="Preferences"
              icon={Users}
            />
          ))}
        </TabsContent>
      </Tabs>

      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <MessageCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                Pro Tip
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Start with ice breakers to build rapport, then move to logistics once you&apos;re comfortable. 
                Use the &quot;Use&quot; button to track which questions work best for future matches!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
