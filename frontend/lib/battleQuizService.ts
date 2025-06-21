export interface BattleQuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct_answer: number;
  explanation?: string;
}

export interface BattleQuiz {
  quiz: BattleQuizQuestion[];
  topic: string;
  difficulty: string;
  total_questions: number;
}

export interface BattleQuizRequest {
  topic: string;
  difficulty?: "easy" | "intermediate" | "hard";
  num_questions?: number;
}

class BattleQuizService {
  private currentQuiz: BattleQuiz | null = null;

  // Generate a new battle quiz
  async generateBattleQuiz(request: BattleQuizRequest): Promise<BattleQuiz> {
    try {
      console.log("🎯 Generating battle quiz for topic:", request.topic);
      
      const response = await fetch("/api/generate-battle-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: request.topic,
          difficulty: request.difficulty || "intermediate",
          num_questions: request.num_questions || 5,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate battle quiz");
      }

      const quiz = await response.json();
      this.currentQuiz = quiz;
      
      console.log("✅ Battle quiz generated successfully:", quiz.topic);
      return quiz;
    } catch (error) {
      console.error("❌ Error generating battle quiz:", error);
      throw error;
    }
  }

  // Get the current quiz
  getCurrentQuiz(): BattleQuiz | null {
    return this.currentQuiz;
  }

  // Set the current quiz (for external updates)
  setCurrentQuiz(quiz: BattleQuiz) {
    this.currentQuiz = quiz;
  }

  // Clear the current quiz
  clearCurrentQuiz() {
    this.currentQuiz = null;
  }

  // Get a specific question by ID
  getQuestion(questionId: number): BattleQuizQuestion | null {
    if (!this.currentQuiz) return null;
    return this.currentQuiz.quiz.find(q => q.id === questionId) || null;
  }

  // Get the total number of questions
  getTotalQuestions(): number {
    return this.currentQuiz?.total_questions || 0;
  }

  // Check if an answer is correct
  isCorrectAnswer(questionId: number, selectedAnswer: number): boolean {
    const question = this.getQuestion(questionId);
    if (!question) return false;
    return question.correct_answer === selectedAnswer;
  }

  // Get the correct answer for a question
  getCorrectAnswer(questionId: number): number | null {
    const question = this.getQuestion(questionId);
    return question ? question.correct_answer : null;
  }

  // Get the explanation for a question
  getExplanation(questionId: number): string | null {
    const question = this.getQuestion(questionId);
    return question?.explanation || null;
  }

  // Get quiz metadata
  getQuizMetadata(): { topic: string; difficulty: string; totalQuestions: number } | null {
    if (!this.currentQuiz) return null;
    
    return {
      topic: this.currentQuiz.topic,
      difficulty: this.currentQuiz.difficulty,
      totalQuestions: this.currentQuiz.total_questions,
    };
  }

  // Validate quiz structure
  validateQuiz(quiz: any): quiz is BattleQuiz {
    return (
      quiz &&
      typeof quiz === "object" &&
      Array.isArray(quiz.quiz) &&
      typeof quiz.topic === "string" &&
      typeof quiz.difficulty === "string" &&
      typeof quiz.total_questions === "number" &&
      quiz.quiz.every((q: any) => 
        typeof q.id === "number" &&
        typeof q.question === "string" &&
        Array.isArray(q.options) &&
        q.options.every((opt: any) => typeof opt === "string") &&
        typeof q.correct_answer === "number" &&
        q.correct_answer >= 0 &&
        q.correct_answer < q.options.length
      )
    );
  }
}

// Export singleton instance
export const battleQuizService = new BattleQuizService(); 