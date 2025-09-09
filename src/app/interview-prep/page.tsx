"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  Brain, 
  Play, 
  Pause, 
  RotateCcw,
  Mic,
  MicOff,
  Volume2,
  CheckCircle,
  Clock,
  Target
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface InterviewQuestions {
  technical: string[];
  behavioral: string[];
  systemDesign: string[];
  ttsPrompt: string;
}

interface Job {
  _id: string;
  title?: string;
  company?: string;
  description?: string;
}

export default function InterviewPrepPage() {
  const { data: session, status } = useSession();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestions | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    if (status === "authenticated") {
      fetchJobs();
    }
  }, [status]);

  const fetchJobs = async () => {
    try {
      const res = await fetch("/api/jobs");
      const data = await res.json();
      setJobs(data.data || []);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    }
  };

  const generateQuestions = async () => {
    if (!selectedJob?.description) return;

    setLoading(true);
    try {
      // Get user's resume blocks for context
      const resumeRes = await fetch("/api/resumes");
      const resumeData = await resumeRes.json();
      const primaryResume = resumeData.data?.[0];
      const resumeBlocks = primaryResume?.blocks || [];

      const res = await fetch("/api/interview/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription: selectedJob.description,
          resumeBlocks: resumeBlocks,
        }),
      });

      const data = await res.json();
      setQuestions(data);
      setCurrentQuestionIndex(0);
      setAnswers({});
    } catch (error) {
      console.error("Failed to generate questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const startInterview = () => {
    setIsPlaying(true);
    // In a real implementation, you would use Web Speech API for TTS
    speakText("Welcome to your interview practice session. Let's begin with the first question.");
  };

  const stopInterview = () => {
    setIsPlaying(false);
    // Stop any ongoing speech
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  const speakText = (text: string) => {
    if (window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const nextQuestion = () => {
    if (questions) {
      const allQuestions = [...questions.technical, ...questions.behavioral, ...questions.systemDesign];
      if (currentQuestionIndex < allQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setUserAnswer(answers[currentQuestionIndex + 1] || "");
      } else {
        stopInterview();
        alert("Interview completed! Great job practicing.");
      }
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setUserAnswer(answers[currentQuestionIndex - 1] || "");
    }
  };

  const saveAnswer = () => {
    setAnswers({ ...answers, [currentQuestionIndex]: userAnswer });
  };

  const startRecording = () => {
    setIsRecording(true);
    // In a real implementation, you would use Web Speech API for speech recognition
    alert("Recording started! (This is a demo - real speech recognition would be implemented here)");
  };

  const stopRecording = () => {
    setIsRecording(false);
    // Stop recording and process the audio
    alert("Recording stopped! (This is a demo - real speech processing would happen here)");
  };

  const resetInterview = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setUserAnswer("");
    stopInterview();
  };

  const getAllQuestions = () => {
    if (!questions) return [];
    return [...questions.technical, ...questions.behavioral, ...questions.systemDesign];
  };

  const getCurrentQuestion = () => {
    const allQuestions = getAllQuestions();
    return allQuestions[currentQuestionIndex] || "";
  };

  const getQuestionType = () => {
    if (!questions) return "";
    const allQuestions = getAllQuestions();
    const currentQ = allQuestions[currentQuestionIndex];
    
    if (questions.technical.includes(currentQ)) return "Technical";
    if (questions.behavioral.includes(currentQ)) return "Behavioral";
    if (questions.systemDesign.includes(currentQ)) return "System Design";
    return "";
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6C63FF] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading interview prep...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Please sign in to access interview prep.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#6C63FF]/5 via-[#00C9A7]/5 to-[#6C63FF]/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Interview Preparation</h1>
          <p className="text-gray-600">Practice with AI-generated questions tailored to your target role</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Job Selection & Setup */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Select Target Job
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="job-select">Choose a job to practice for</Label>
                  <Select value={selectedJob?._id || ""} onValueChange={(value) => {
                    const job = jobs.find(j => j._id === value);
                    setSelectedJob(job || null);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a job..." />
                    </SelectTrigger>
                    <SelectContent>
                      {jobs.map((job) => (
                        <SelectItem key={job._id} value={job._id}>
                          {job.title} at {job.company}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedJob && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-sm">{selectedJob.title}</h3>
                    <p className="text-xs text-gray-600">{selectedJob.company}</p>
                    {selectedJob.description && (
                      <p className="text-xs text-gray-500 mt-2 line-clamp-3">
                        {selectedJob.description.substring(0, 150)}...
                      </p>
                    )}
                  </div>
                )}

                <Button
                  onClick={generateQuestions}
                  disabled={!selectedJob || loading}
                  className="w-full bg-gradient-to-r from-[#6C63FF] to-[#00C9A7] text-white"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating Questions...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Generate Questions
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Interview Controls */}
            {questions && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Interview Controls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    {!isPlaying ? (
                      <Button onClick={startInterview} className="flex-1">
                        <Play className="h-4 w-4 mr-2" />
                        Start Interview
                      </Button>
                    ) : (
                      <Button onClick={stopInterview} variant="outline" className="flex-1">
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                      </Button>
                    )}
                    <Button onClick={resetInterview} variant="outline">
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    {!isRecording ? (
                      <Button onClick={startRecording} variant="outline" className="flex-1">
                        <Mic className="h-4 w-4 mr-2" />
                        Start Recording
                      </Button>
                    ) : (
                      <Button onClick={stopRecording} variant="outline" className="flex-1">
                        <MicOff className="h-4 w-4 mr-2" />
                        Stop Recording
                      </Button>
                    )}
                    <Button onClick={() => speakText(getCurrentQuestion())} variant="outline">
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="text-center text-sm text-gray-600">
                    Question {currentQuestionIndex + 1} of {getAllQuestions().length}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Interview Interface */}
          <div className="lg:col-span-2">
            {!questions ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No questions generated yet</h3>
                  <p className="text-gray-500 mb-4">Select a job and generate personalized interview questions</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Current Question */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5" />
                        Current Question
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                          {getQuestionType()}
                        </span>
                        <span className="text-sm text-gray-500">
                          {currentQuestionIndex + 1} / {getAllQuestions().length}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-gray-50 rounded-lg mb-4">
                      <p className="text-gray-800 text-lg leading-relaxed">
                        {getCurrentQuestion()}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button onClick={previousQuestion} disabled={currentQuestionIndex === 0} variant="outline">
                        Previous
                      </Button>
                      <Button onClick={nextQuestion} className="flex-1">
                        Next Question
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Answer Input */}
                <Card>
                  <CardHeader>
                    <CardTitle>Your Answer</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Textarea
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="Type your answer here... (or use voice recording above)"
                        rows={6}
                        className="resize-none"
                      />
                    </div>
                    <div className="flex justify-between">
                      <Button onClick={saveAnswer} variant="outline">
                        Save Answer
                      </Button>
                      <div className="text-sm text-gray-500">
                        {userAnswer.length} characters
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Question Categories */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm text-blue-600">Technical Questions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {questions.technical.slice(0, 3).map((q, index) => (
                          <div key={index} className="text-xs text-gray-600 p-2 bg-blue-50 rounded">
                            {q.substring(0, 80)}...
                          </div>
                        ))}
                        {questions.technical.length > 3 && (
                          <div className="text-xs text-gray-500">
                            +{questions.technical.length - 3} more
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm text-green-600">Behavioral Questions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {questions.behavioral.slice(0, 3).map((q, index) => (
                          <div key={index} className="text-xs text-gray-600 p-2 bg-green-50 rounded">
                            {q.substring(0, 80)}...
                          </div>
                        ))}
                        {questions.behavioral.length > 3 && (
                          <div className="text-xs text-gray-500">
                            +{questions.behavioral.length - 3} more
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm text-purple-600">System Design</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {questions.systemDesign.slice(0, 3).map((q, index) => (
                          <div key={index} className="text-xs text-gray-600 p-2 bg-purple-50 rounded">
                            {q.substring(0, 80)}...
                          </div>
                        ))}
                        {questions.systemDesign.length > 3 && (
                          <div className="text-xs text-gray-500">
                            +{questions.systemDesign.length - 3} more
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
