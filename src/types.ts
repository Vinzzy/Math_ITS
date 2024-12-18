export type Operation = 'Addition' | 'Subtraction' | 'Multiplication' | 'Division';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Problem {
  id: string;
  problemStatement: string;
  correctAnswer: number;
  operation: Operation;
  difficulty: Difficulty;
  timeLimit: number;
}

export interface Hint {
  hintText: string;
}

export interface Feedback {
  feedbackText: string;
  timeStamp: Date;
}

export interface UserProgress {
  attemptsCount: number;
  correctCount: number;
  incorrectCount: number;
  masteryLevel: string;
}

export const getOperationSymbol = (operation: Operation): string => {
  switch (operation) {
    case 'Addition': return '+';
    case 'Subtraction': return '-';
    case 'Multiplication': return '×';
    case 'Division': return '÷';
  }
};

export const getHint = (problem: Problem): string => {
  const [num1, num2] = problem.problemStatement.match(/\d+/g)!.map(Number);
  switch (problem.operation) {
    case 'Addition':
      return `Try counting up from ${num1} by adding ${num2} to it.`;
    case 'Subtraction':
      return `Start at ${num1} and count backwards ${num2} times.`;
    case 'Multiplication':
      return `Think of ${num1} groups with ${num2} in each group.`;
    case 'Division':
      return `How many groups of ${num2} can you make from ${num1}?`;
  }
};

export const getFeedback = (isCorrect: boolean): Feedback => {
  return {
    feedbackText: isCorrect ? "Great job! Your answer is correct." : "Oops! That's not quite right. Try again or use a hint!",
    timeStamp: new Date(),
  };
};

export const updateUserProgress = (
  progress: UserProgress,
  isCorrect: boolean
): UserProgress => {
  const newProgress = {
    ...progress,
    attemptsCount: progress.attemptsCount + 1,
    correctCount: isCorrect ? progress.correctCount + 1 : progress.correctCount,
    incorrectCount: isCorrect ? progress.incorrectCount : progress.incorrectCount + 1,
  };

  const totalAttempts = newProgress.correctCount + newProgress.incorrectCount;
  const successRate = newProgress.correctCount / totalAttempts;

  if (successRate >= 0.9) {
    newProgress.masteryLevel = 'Expert';
  } else if (successRate >= 0.7) {
    newProgress.masteryLevel = 'Proficient';
  } else if (successRate >= 0.5) {
    newProgress.masteryLevel = 'Developing';
  } else {
    newProgress.masteryLevel = 'Beginner';
  }

  return newProgress;
};

