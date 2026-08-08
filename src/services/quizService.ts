import { Quiz, QuizSettings, Question, QuestionBankItem } from '../types/quiz';
import { supabase } from '../lib/supabase';

const LOCAL_QUIZZES_KEY = 'mexo_quiz_items_v1';
const QUESTION_BANK_KEY = 'mexo_question_bank_v1';

export const INITIAL_QUIZZES: Quiz[] = [
  {
    id: 'quiz-quantum-physics',
    creator_id: 'mexo-teacher-01',
    creator_name: 'Dr. Evelyn Vance',
    creator_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    is_public: true,
    plays_count: 1420,
    rating_avg: 4.9,
    rating_count: 320,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    settings: {
      title: 'Quantum Physics & Particle Dynamics',
      description: 'Test your understanding of quantum mechanics, wave-particle duality, Planck constant, and atomic orbital models.',
      coverImageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600',
      subject: 'Physics',
      difficulty: 'hard',
      language: 'English',
      grade: 'College',
      tags: ['Physics', 'Quantum', 'Science', 'STEM'],
      instructions: 'Answer all questions carefully. You have 15 minutes to complete the quiz.',
      status: 'published',
      autoClose: false,
      attemptsLimit: 3,
      shuffleQuestions: true,
      shuffleOptions: true,
      timerMode: 'whole_quiz',
      quizDurationMinutes: 15,
      leaderboardVisibility: 'live',
      showAnswersAfterQuiz: true,
      showScoreAfterQuiz: true,
      showExplanations: true,
      showCorrectAnswersAfterDueDate: false,
      passingScorePercentage: 70,
      negativeMarkingPercentage: 0,
      autoGrading: true,
      certificate: {
        enabled: true,
        title: 'Quantum Mechanics Scholar Certificate',
        minScorePercentage: 80,
        issuerName: 'MEXO Science Institute',
        templateStyle: 'gold',
      },
    },
    questions: [
      {
        id: 'q1',
        type: 'multiple_choice',
        title: 'What equation relates energy E to photon frequency ν?',
        options: [
          { id: 'opt1', text: 'E = hν', isCorrect: true, explanation: 'Planck relation E = hν where h is Planck\'s constant.' },
          { id: 'opt2', text: 'E = mc²', isCorrect: false },
          { id: 'opt3', text: 'F = ma', isCorrect: false },
          { id: 'opt4', text: 'PV = nRT', isCorrect: false },
        ],
        points: 10,
        explanation: 'The Planck relation states that photon energy is proportional to its frequency.',
        hint: 'Think about Planck\'s constant (h).',
        isRequired: true,
      },
      {
        id: 'q2',
        type: 'multiple_select',
        title: 'Select all phenomena that demonstrate wave-particle duality:',
        options: [
          { id: 'opt21', text: 'Photoelectric Effect', isCorrect: true },
          { id: 'opt22', text: 'Double-slit electron diffraction', isCorrect: true },
          { id: 'opt23', text: 'Compton Scattering', isCorrect: true },
          { id: 'opt24', text: 'Classical Hooke\'s Law Spring Oscillation', isCorrect: false },
        ],
        points: 15,
        explanation: 'Photoelectric effect, electron diffraction, and Compton scattering confirm wave-particle duality.',
        isRequired: true,
      },
      {
        id: 'q3',
        type: 'true_false',
        title: 'Heisenberg Uncertainty Principle states that position and momentum cannot be simultaneously measured with arbitrary precision.',
        options: [
          { id: 'tf_true', text: 'True', isCorrect: true },
          { id: 'tf_false', text: 'False', isCorrect: false },
        ],
        points: 10,
        explanation: 'Δx Δp ≥ ℏ / 2 is the fundamental lower limit of precision.',
        isRequired: true,
      },
      {
        id: 'q4',
        type: 'math_formula',
        title: 'Complete the Schrödinger Wave Equation term for kinetic energy operator:',
        mathLaTeX: '-\\frac{\\hbar^2}{2m} \\nabla^2 \\Psi + V\\Psi = E\\Psi',
        options: [
          { id: 'm1', text: '-\\frac{\\hbar^2}{2m} \\nabla^2', isCorrect: true },
          { id: 'm2', text: '\\frac{1}{2} m v^2', isCorrect: false },
          { id: 'm3', text: 'm c^2', isCorrect: false },
        ],
        points: 20,
        explanation: 'The kinetic energy operator in quantum mechanics is -(\\hbar^2 / 2m) ∇^2.',
        isRequired: true,
      },
      {
        id: 'q5',
        type: 'code_question',
        title: 'What will be the output of this Python quantum qubit simulation snippet?',
        codeLanguage: 'python',
        codeStarter: 'import math\n\ndef measure_qubit(state):\n    alpha, beta = state\n    p_zero = abs(alpha)**2\n    return round(p_zero, 2)\n\nprint(measure_qubit((1/math.sqrt(2), 1/math.sqrt(2))))',
        options: [
          { id: 'c1', text: '0.5', isCorrect: true },
          { id: 'c2', text: '1.0', isCorrect: false },
          { id: 'c3', text: '0.71', isCorrect: false },
          { id: 'c4', text: '0.0', isCorrect: false },
        ],
        points: 15,
        explanation: 'For state (1/√2, 1/√2), probability |alpha|^2 = (1/√2)^2 = 0.5.',
        isRequired: true,
      },
    ],
  },
  {
    id: 'quiz-js-mastery',
    creator_id: 'mexo-dev-guy',
    creator_name: 'Alex Rivera',
    creator_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    is_public: true,
    plays_count: 3890,
    rating_avg: 4.8,
    rating_count: 850,
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    settings: {
      title: 'JavaScript Modern ES6+ & Async Architecture',
      description: 'Master JavaScript closures, event loop, Promises, async/await, proxies, and TypeScript type guards.',
      coverImageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600',
      subject: 'Computer Science',
      difficulty: 'medium',
      language: 'English',
      grade: 'Professional',
      tags: ['JavaScript', 'Coding', 'Web', 'React'],
      instructions: 'Read code snippets carefully. Select the correct outputs or principles.',
      status: 'published',
      autoClose: false,
      attemptsLimit: 0,
      shuffleQuestions: true,
      shuffleOptions: true,
      timerMode: 'whole_quiz',
      quizDurationMinutes: 10,
      leaderboardVisibility: 'live',
      showAnswersAfterQuiz: true,
      showScoreAfterQuiz: true,
      showExplanations: true,
      showCorrectAnswersAfterDueDate: false,
      passingScorePercentage: 75,
      negativeMarkingPercentage: 0,
      autoGrading: true,
      certificate: {
        enabled: true,
        title: 'JavaScript Master Developer Certificate',
        minScorePercentage: 85,
        issuerName: 'MEXO Engineering Academy',
        templateStyle: 'modern',
      },
    },
    questions: [
      {
        id: 'jsq1',
        type: 'multiple_choice',
        title: 'What is the output of `console.log(typeof typeof 1)` in JavaScript?',
        options: [
          { id: 'jso1', text: '"string"', isCorrect: true, explanation: '`typeof 1` returns `"number"`, and `typeof "number"` returns `"string"`.' },
          { id: 'jso2', text: '"number"', isCorrect: false },
          { id: 'jso3', text: '"undefined"', isCorrect: false },
          { id: 'jso4', text: '"object"', isCorrect: false },
        ],
        points: 10,
        isRequired: true,
      },
      {
        id: 'jsq2',
        type: 'fill_blank',
        title: 'Which keyword creates an un-reassignable block-scoped variable in modern JS?',
        acceptedBlanks: ['const'],
        options: [{ id: 'fb1', text: 'const', isCorrect: true }],
        points: 10,
        explanation: '`const` defines block-scoped read-only references.',
        isRequired: true,
      },
      {
        id: 'jsq3',
        type: 'matching',
        title: 'Match the array methods with their primary purpose:',
        options: [],
        matchingPairs: [
          { left: 'Array.prototype.map()', right: 'Transforms each element into a new array' },
          { left: 'Array.prototype.filter()', right: 'Returns subset of items matching boolean predicate' },
          { left: 'Array.prototype.reduce()', right: 'Accumulates array items down to a single value' },
          { left: 'Array.prototype.some()', right: 'Checks if at least one item satisfies condition' },
        ],
        points: 20,
        isRequired: true,
      },
    ],
  },
  {
    id: 'quiz-world-capitals',
    creator_id: 'mexo-teacher-02',
    creator_name: 'Prof. Sofia Rossi',
    creator_avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    is_public: true,
    plays_count: 5120,
    rating_avg: 4.95,
    rating_count: 1100,
    created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    settings: {
      title: 'Global Geography & World Capitals Challenge',
      description: 'Travel the world and test your knowledge of capitals, landmarks, continents, and geography trivia.',
      coverImageUrl: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=600',
      subject: 'Geography',
      difficulty: 'easy',
      language: 'English',
      grade: 'K-12',
      tags: ['Geography', 'Capitals', 'World', 'Trivia'],
      instructions: 'Quick fire quiz! Answer as fast as possible for high streak bonuses.',
      status: 'published',
      autoClose: false,
      attemptsLimit: 0,
      shuffleQuestions: true,
      shuffleOptions: true,
      timerMode: 'per_question',
      perQuestionDurationSeconds: 15,
      leaderboardVisibility: 'live',
      showAnswersAfterQuiz: true,
      showScoreAfterQuiz: true,
      showExplanations: true,
      showCorrectAnswersAfterDueDate: false,
      passingScorePercentage: 60,
      negativeMarkingPercentage: 0,
      autoGrading: true,
      certificate: {
        enabled: true,
        title: 'Global Explorer Certificate',
        minScorePercentage: 75,
        issuerName: 'MEXO Geographical Society',
        templateStyle: 'classic',
      },
    },
    questions: [
      {
        id: 'geo1',
        type: 'multiple_choice',
        title: 'What is the capital city of Australia?',
        options: [
          { id: 'g1', text: 'Canberra', isCorrect: true, explanation: 'Canberra is the purpose-built capital of Australia, chosen in 1908.' },
          { id: 'g2', text: 'Sydney', isCorrect: false },
          { id: 'g3', text: 'Melbourne', isCorrect: false },
          { id: 'g4', text: 'Brisbane', isCorrect: false },
        ],
        points: 10,
        isRequired: true,
      },
      {
        id: 'geo2',
        type: 'ordering',
        title: 'Order these oceans from LARGEST surface area to SMALLEST:',
        options: [],
        orderingSequence: ['Pacific Ocean', 'Atlantic Ocean', 'Indian Ocean', 'Southern Ocean', 'Arctic Ocean'],
        points: 15,
        isRequired: true,
      },
    ],
  },
];

export const quizService = {
  getAllQuizzes(): Quiz[] {
    try {
      const stored = localStorage.getItem(LOCAL_QUIZZES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    localStorage.setItem(LOCAL_QUIZZES_KEY, JSON.stringify(INITIAL_QUIZZES));
    return INITIAL_QUIZZES;
  },

  getQuizById(id: string): Quiz | null {
    const list = this.getAllQuizzes();
    return list.find(q => q.id === id) || null;
  },

  saveQuiz(quiz: Quiz): Quiz {
    const list = this.getAllQuizzes();
    const existingIndex = list.findIndex(q => q.id === quiz.id);
    const updatedQuiz = {
      ...quiz,
      updated_at: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      list[existingIndex] = updatedQuiz;
    } else {
      list.unshift(updatedQuiz);
    }

    try {
      localStorage.setItem(LOCAL_QUIZZES_KEY, JSON.stringify(list));
    } catch (e) {}

    (async () => {
      try {
        await supabase.from('quizzes').upsert({
          id: updatedQuiz.id,
          creator_id: updatedQuiz.creator_id,
          creator_name: updatedQuiz.creator_name,
          is_public: updatedQuiz.is_public,
          settings: updatedQuiz.settings,
          questions: updatedQuiz.questions,
          updated_at: updatedQuiz.updated_at,
        });
      } catch (e) {}
    })();

    return updatedQuiz;
  },

  deleteQuiz(id: string): boolean {
    let list = this.getAllQuizzes();
    list = list.filter(q => q.id !== id);
    try {
      localStorage.setItem(LOCAL_QUIZZES_KEY, JSON.stringify(list));
    } catch (e) {}
    (async () => {
      try {
        await supabase.from('quizzes').delete().eq('id', id);
      } catch (e) {}
    })();
    return true;
  },

  duplicateQuiz(id: string, newCreatorName: string, newCreatorId: string): Quiz | null {
    const original = this.getQuizById(id);
    if (!original) return null;

    const copy: Quiz = {
      ...original,
      id: `quiz-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      creator_id: newCreatorId,
      creator_name: newCreatorName,
      plays_count: 0,
      rating_avg: 5.0,
      rating_count: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      settings: {
        ...original.settings,
        title: `${original.settings.title} (Copy)`,
        status: 'draft',
      },
    };

    return this.saveQuiz(copy);
  },

  searchQuizzes(params: {
    query?: string;
    subject?: string;
    difficulty?: string;
    grade?: string;
    language?: string;
    sortBy?: 'newest' | 'popular' | 'rating';
  }): Quiz[] {
    let list = this.getAllQuizzes();

    if (params.query) {
      const q = params.query.toLowerCase();
      list = list.filter(item =>
        item.settings.title.toLowerCase().includes(q) ||
        item.settings.description.toLowerCase().includes(q) ||
        item.settings.tags.some(t => t.toLowerCase().includes(q)) ||
        item.creator_name.toLowerCase().includes(q)
      );
    }

    if (params.subject && params.subject !== 'all') {
      list = list.filter(item => item.settings.subject.toLowerCase() === params.subject?.toLowerCase());
    }

    if (params.difficulty && params.difficulty !== 'all') {
      list = list.filter(item => item.settings.difficulty === params.difficulty);
    }

    if (params.grade && params.grade !== 'all') {
      list = list.filter(item => item.settings.grade.toLowerCase() === params.grade?.toLowerCase());
    }

    if (params.sortBy === 'popular') {
      list.sort((a, b) => b.plays_count - a.plays_count);
    } else if (params.sortBy === 'rating') {
      list.sort((a, b) => b.rating_avg - a.rating_avg);
    } else {
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return list;
  },

  // Question Bank
  getQuestionBank(): QuestionBankItem[] {
    try {
      const stored = localStorage.getItem(QUESTION_BANK_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [];
  },

  saveToQuestionBank(item: Omit<QuestionBankItem, 'id' | 'created_at'>): QuestionBankItem {
    const list = this.getQuestionBank();
    const newItem: QuestionBankItem = {
      ...item,
      id: `qb-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString(),
    };
    list.unshift(newItem);
    try {
      localStorage.setItem(QUESTION_BANK_KEY, JSON.stringify(list));
    } catch (e) {}
    return newItem;
  },
};
