import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import confetti from "canvas-confetti";
import { CheckCircle, HelpCircle, Timer, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { parseOWLFile } from "./owlParser.ts";
import { Feedback, Problem, UserProgress, getFeedback, getHint, updateUserProgress } from "./types.ts";
import owlContent from "./math-ontology.xml?raw";

export default function MathTutor() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(60);
  const [userProgress, setUserProgress] = useState<UserProgress>({
    attemptsCount: 0,
    correctCount: 0,
    incorrectCount: 0,
    masteryLevel: "Beginner",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const parsedProblems = parseOWLFile(owlContent);
      if (parsedProblems.length === 0) {
        throw new Error("No valid problems found in the OWL file");
      }
      setProblems(parsedProblems);
    } catch (err) {
      console.error("Error parsing OWL file:", err);
      setError("Failed to load problems. Please try again later.");
    }
  }, []);

  useEffect(() => {
    if (problems.length > 0) {
      setTimer(problems[currentProblemIndex].timeLimit);
    }
  }, [problems, currentProblemIndex]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prevTimer => {
        if (prevTimer <= 1) {
          clearInterval(interval);
          handleTimeout();
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentProblemIndex]);

  useEffect(() => {
    setShowHint(false);
    setFeedback(null);
  }, [currentProblemIndex]);

  const handleSubmit = () => {
    if (timer === 0 || problems.length === 0) return;

    const currentProblem = problems[currentProblemIndex];
    const isCorrect = parseFloat(userAnswer) === currentProblem.correctAnswer;
    const newFeedback = getFeedback(isCorrect);
    setFeedback(newFeedback);

    if (isCorrect) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      setTimeout(() => {
        setCurrentProblemIndex(prevIndex => (prevIndex + 1) % problems.length);
        setUserAnswer("");
      }, 2000);
    }

    setUserProgress(prevProgress => updateUserProgress(prevProgress, isCorrect));
  };

  const handleTimeout = () => {
    if (problems.length === 0) return;
    const currentProblem = problems[currentProblemIndex];
    setFeedback({
      feedbackText: `Time's up! The correct answer was ${currentProblem.correctAnswer}.`,
      timeStamp: new Date(),
    });
    setTimeout(() => {
      setCurrentProblemIndex(prevIndex => (prevIndex + 1) % problems.length);
      setUserAnswer("");
    }, 3000);
  };

  const handleHint = () => {
    setShowHint(true);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-400 via-pink-500 to-red-500 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-purple-600">Math Adventure! 🚀</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (problems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-400 via-pink-500 to-red-500 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-purple-600">Math Adventure! 🚀</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">Loading problems...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentProblem = problems[currentProblemIndex];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-400 via-pink-500 to-red-500 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-purple-600">Math Adventure! 🚀</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="text-5xl font-bold text-blue-600">{currentProblem.problemStatement}</div>
            <div className="text-2xl font-semibold flex items-center text-orange-500">
              <Timer className="mr-2 h-6 w-6" />
              {timer}s
            </div>
          </div>
          <div className="flex space-x-2">
            <Input
              type="number"
              value={userAnswer}
              onChange={e => setUserAnswer(e.target.value)}
              placeholder="Your answer"
              className="text-2xl border-4 border-blue-400 focus:border-green-400 transition-colors duration-300"
            />
            <Button
              onClick={handleSubmit}
              className="w-24 text-xl bg-green-500 hover:bg-green-600 transition-colors duration-300"
              disabled={timer === 0}
            >
              Go! 🚀
            </Button>
          </div>
          <Button
            onClick={handleHint}
            variant="outline"
            className="w-full text-xl border-4 border-yellow-400 text-yellow-600 hover:bg-yellow-100 transition-colors duration-300"
          >
            <HelpCircle className="mr-2 h-6 w-6" /> Need a Hint? 💡
          </Button>
          {showHint && (
            <Alert className="bg-yellow-100 border-4 border-yellow-400">
              <AlertTitle className="text-xl text-yellow-700">Hint 💡</AlertTitle>
              <AlertDescription className="text-lg text-yellow-600">{getHint(currentProblem)}</AlertDescription>
            </Alert>
          )}
          {feedback && (
            <Alert
              variant={feedback.feedbackText.includes("correct") ? "default" : "destructive"}
              className={`border-4 ${
                feedback.feedbackText.includes("correct")
                  ? "bg-green-100 border-green-400"
                  : "bg-red-100 border-red-400"
              } transition-all duration-300`}
            >
              <AlertTitle className="text-xl">
                {feedback.feedbackText.includes("correct") ? (
                  <CheckCircle className="inline-block mr-2 h-6 w-6 text-green-600" />
                ) : (
                  <XCircle className="inline-block mr-2 h-6 w-6 text-red-600" />
                )}
                {feedback.feedbackText}
              </AlertTitle>
            </Alert>
          )}
          <div className="text-center font-bold text-2xl text-purple-600">
            Mastery Level: {userProgress.masteryLevel} 🏆
          </div>
          <div className="text-center text-lg text-gray-600">
            Correct: {userProgress.correctCount} | Incorrect: {userProgress.incorrectCount}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
