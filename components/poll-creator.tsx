"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, HelpCircle, Trophy, Plus, X, Check } from "lucide-react"

interface PollOption {
  id: string
  text: string
  isCorrect?: boolean
}

interface Poll {
  type: "vote" | "quiz" | "question"
  question: string
  options: PollOption[]
}

interface PollCreatorProps {
  isOpen: boolean
  onClose: () => void
  onCreatePoll: (poll: Poll) => void
  existingPoll?: Poll
}

export function PollCreator({ isOpen, onClose, onCreatePoll, existingPoll }: PollCreatorProps) {
  const [pollType, setPollType] = useState<"vote" | "quiz" | "question">(existingPoll?.type || "vote")
  const [question, setQuestion] = useState(existingPoll?.question || "")
  const [options, setOptions] = useState<PollOption[]>(
    existingPoll?.options || [
      { id: "1", text: "" },
      { id: "2", text: "" },
    ],
  )

  const handleAddOption = () => {
    if (options.length < 4) {
      setOptions([...options, { id: Date.now().toString(), text: "" }])
    }
  }

  const handleRemoveOption = (id: string) => {
    if (options.length > 2) {
      setOptions(options.filter((option) => option.id !== id))
    }
  }

  const handleUpdateOption = (id: string, text: string) => {
    setOptions(options.map((option) => (option.id === id ? { ...option, text } : option)))
  }

  const handleToggleCorrect = (id: string) => {
    if (pollType === "quiz") {
      setOptions(
        options.map((option) => ({
          ...option,
          isCorrect: option.id === id ? !option.isCorrect : false,
        })),
      )
    }
  }

  const handleCreatePoll = () => {
    const validOptions = options.filter((option) => option.text.trim())
    if (question.trim() && validOptions.length >= 2) {
      onCreatePoll({
        type: pollType,
        question: question.trim(),
        options: validOptions,
      })
      onClose()
    }
  }

  const handleReset = () => {
    setQuestion("")
    setOptions([
      { id: "1", text: "" },
      { id: "2", text: "" },
    ])
  }

  const getPollTypeIcon = (type: "vote" | "quiz" | "question") => {
    switch (type) {
      case "vote":
        return <BarChart3 className="w-4 h-4" />
      case "quiz":
        return <HelpCircle className="w-4 h-4" />
      case "question":
        return <Trophy className="w-4 h-4" />
    }
  }

  const validOptions = options.filter((option) => option.text.trim())
  const canCreate = question.trim() && validOptions.length >= 2

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Poll</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Poll Type Selection */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Poll Type</div>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={pollType === "vote" ? "default" : "outline"}
                size="sm"
                onClick={() => setPollType("vote")}
                className="flex flex-col items-center gap-1 h-auto py-3"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="text-xs">Vote</span>
              </Button>
              <Button
                variant={pollType === "quiz" ? "default" : "outline"}
                size="sm"
                onClick={() => setPollType("quiz")}
                className="flex flex-col items-center gap-1 h-auto py-3"
              >
                <HelpCircle className="w-4 h-4" />
                <span className="text-xs">Quiz</span>
              </Button>
              <Button
                variant={pollType === "question" ? "default" : "outline"}
                size="sm"
                onClick={() => setPollType("question")}
                className="flex flex-col items-center gap-1 h-auto py-3"
              >
                <Trophy className="w-4 h-4" />
                <span className="text-xs">Question</span>
              </Button>
            </div>
          </div>

          {/* Question Input */}
          <div className="space-y-2">
            <div className="text-sm font-medium">
              {pollType === "vote"
                ? "What should people vote on?"
                : pollType === "quiz"
                  ? "Quiz Question"
                  : "Question for Discussion"}
            </div>
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={
                pollType === "vote"
                  ? "e.g., Best party song?"
                  : pollType === "quiz"
                    ? "e.g., What year was this venue built?"
                    : "e.g., What's your favorite memory from tonight?"
              }
            />
          </div>

          {/* Options (for vote and quiz polls) */}
          {pollType !== "question" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Options ({validOptions.length}/4)</div>
                {pollType === "quiz" && (
                  <Badge variant="secondary" className="text-xs">
                    Mark correct answer
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                {options.map((option, index) => (
                  <div key={option.id} className="flex items-center gap-2">
                    <div className="flex-1 flex items-center gap-2">
                      <Input
                        value={option.text}
                        onChange={(e) => handleUpdateOption(option.id, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        className="flex-1"
                      />
                      {pollType === "quiz" && (
                        <Button
                          variant={option.isCorrect ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleToggleCorrect(option.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    {options.length > 2 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveOption(option.id)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {options.length < 4 && (
                <Button variant="outline" size="sm" onClick={handleAddOption} className="w-full">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Option
                </Button>
              )}
            </div>
          )}

          {/* Poll Preview */}
          {canCreate && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Preview</div>
              <Card className="bg-gray-50">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    {getPollTypeIcon(pollType)}
                    <span className="text-sm font-medium capitalize">{pollType} Poll</span>
                  </div>
                  <div className="text-sm font-medium mb-2">{question}</div>
                  {pollType !== "question" && (
                    <div className="space-y-1">
                      {validOptions.map((option, index) => (
                        <div key={option.id} className="flex items-center gap-2 text-xs">
                          <div className="w-4 h-4 border rounded flex items-center justify-center">
                            {pollType === "quiz" && option.isCorrect && <Check className="w-3 h-3 text-green-600" />}
                          </div>
                          <span>{option.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset} className="flex-1">
              Reset
            </Button>
            <Button onClick={handleCreatePoll} disabled={!canCreate} className="flex-1">
              Create Poll
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
