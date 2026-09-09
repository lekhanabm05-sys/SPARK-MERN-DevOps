export const DEFAULT_USERS = [
  {
    id: 'usr-admin-lekhana',
    email: 'lekhana@gmail.com',
    name: 'Lekhana',
    role: 'admin',
    status: 'active',
    joinedDate: '2026-01-10',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    department: 'Platform Administration & System Governance',
    institution: 'SPARK Central Academy'
  },
  {
    id: 'usr-teacher-sarah',
    email: 'teacher@spark.edu',
    name: 'Dr. Sarah Jenkins',
    role: 'teacher',
    status: 'active',
    joinedDate: '2026-02-01',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    subjectSpecialty: 'Computer Science & Mathematics',
    institution: 'SPARK STEM High School'
  },
  {
    id: 'usr-teacher-marcus',
    email: 'm.vance@spark.edu',
    name: 'Prof. Marcus Vance',
    role: 'teacher',
    status: 'active',
    joinedDate: '2026-02-15',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    subjectSpecialty: 'Physics & Applied AI',
    institution: 'SPARK Technical Institute'
  },
  {
    id: 'usr-student-alex',
    email: 'student@spark.edu',
    name: 'Alex Rivera',
    role: 'student',
    status: 'active',
    joinedDate: '2026-03-01',
    grade: 'Grade 11 - Advanced STEM',
    institution: 'SPARK STEM High School',
    registrationApproved: true
  },
  {
    id: 'usr-student-priya',
    email: 'priya.sharma@spark.edu',
    name: 'Priya Sharma',
    role: 'student',
    status: 'active',
    joinedDate: '2026-03-05',
    grade: 'Grade 12 - CS Track',
    institution: 'SPARK STEM High School',
    registrationApproved: true
  },
  {
    id: 'usr-student-david',
    email: 'david.chen@spark.edu',
    name: 'David Chen',
    role: 'student',
    status: 'pending',
    joinedDate: '2026-07-28',
    grade: 'Grade 10 - Honors',
    institution: 'SPARK STEM High School',
    registrationApproved: false
  }
];

export const INITIAL_QUIZZES = [
  {
    id: 'quiz-cs101',
    title: 'Data Structures & Algorithmic Complexity',
    subject: 'Computer Science',
    topic: 'Trees & Graph Traversal',
    description: 'Assess time complexity, BFS/DFS traversal, and binary tree balancing concepts.',
    timeLimitMinutes: 15,
    createdBy: 'usr-teacher-sarah',
    createdByName: 'Dr. Sarah Jenkins',
    createdAt: '2026-07-15',
    targetGrade: 'Grade 11 - CS Track',
    questions: [
      {
        id: 'q1',
        text: 'What is the worst-case time complexity of searching for an element in an unbalanced Binary Search Tree (BST)?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
        correctOptionIndex: 2,
        explanation: 'In the worst case (a degenerate tree shaped like a linked list), searching requires visiting all n nodes, resulting in O(n) time complexity.',
        topic: 'Binary Search Trees',
        subject: 'Computer Science',
        difficulty: 'Intermediate',
        timeLimitSeconds: 120
      },
      {
        id: 'q2',
        text: 'Which data structure utilizes LIFO (Last In, First Out) ordering for recursion call stack execution?',
        options: ['Queue', 'Stack', 'Heap', 'Linked List'],
        correctOptionIndex: 1,
        explanation: 'A Stack operates under LIFO behavior, making it ideal for managing function frames during recursion.',
        topic: 'Stack & Queue',
        subject: 'Computer Science',
        difficulty: 'Beginner',
        timeLimitSeconds: 120
      },
      {
        id: 'q3',
        text: 'What is the average time complexity of QuickSort?',
        options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(2ⁿ)'],
        correctOptionIndex: 1,
        explanation: 'QuickSort runs in O(n log n) average time when pivot selection evenly splits elements across partitioning steps.',
        topic: 'Sorting Algorithms',
        subject: 'Computer Science',
        difficulty: 'Intermediate',
        timeLimitSeconds: 120
      },
      {
        id: 'q4',
        text: 'Which graph traversal algorithm uses a FIFO Queue to visit nodes level by level?',
        options: ['Depth-First Search (DFS)', 'Breadth-First Search (BFS)', 'Dijkstra’s Algorithm', 'Kruskal’s Algorithm'],
        correctOptionIndex: 1,
        explanation: 'BFS uses a FIFO queue to systematically explore all neighbors at current distance before moving deeper.',
        topic: 'Graph Algorithms',
        subject: 'Computer Science',
        difficulty: 'Advanced',
        timeLimitSeconds: 120
      }
    ]
  },
  {
    id: 'quiz-math201',
    title: 'Calculus & Optimization Diagnostics',
    subject: 'Mathematics',
    topic: 'Derivatives & Integrals',
    description: 'Real-time diagnostic assessment for rate of change, curve sketching, and definite integrals.',
    timeLimitMinutes: 20,
    createdBy: 'usr-teacher-sarah',
    createdByName: 'Dr. Sarah Jenkins',
    createdAt: '2026-07-18',
    targetGrade: 'Grade 11 - Advanced STEM',
    questions: [
      {
        id: 'mq1',
        text: 'What is the derivative of f(x) = x³ - 4x² + 7x - 12 with respect to x?',
        options: ['3x² - 8x + 7', '3x² - 4x + 7', 'x² - 8x + 7', '3x³ - 8x² + 7'],
        correctOptionIndex: 0,
        explanation: 'Using the power rule: d/dx(x^n) = n*x^(n-1). d/dx(x³ - 4x² + 7x - 12) = 3x² - 8x + 7.',
        topic: 'Differentiation Rules',
        subject: 'Mathematics',
        difficulty: 'Beginner',
        timeLimitSeconds: 120
      },
      {
        id: 'mq2',
        text: 'At a local maximum or minimum of a continuous function f(x), what is the value of f’(x)?',
        options: ['1', '0', 'Infinite', 'Undefined only'],
        correctOptionIndex: 1,
        explanation: 'Fermat’s Theorem states that if f has a local extremum at c, then f’(c) = 0 or f’(c) is undefined.',
        topic: 'Optimization & Curves',
        subject: 'Mathematics',
        difficulty: 'Intermediate',
        timeLimitSeconds: 120
      },
      {
        id: 'mq3',
        text: 'Evaluate the definite integral ∫ from 0 to 2 of (3x²) dx.',
        options: ['4', '6', '8', '12'],
        correctOptionIndex: 2,
        explanation: 'Antiderivative of 3x² is x³. Evaluating [x³] from 0 to 2 gives 2³ - 0³ = 8.',
        topic: 'Integration',
        subject: 'Mathematics',
        difficulty: 'Intermediate',
        timeLimitSeconds: 120
      }
    ]
  },
  {
    id: 'quiz-ai301',
    title: 'Machine Learning & Neural Network Foundations',
    subject: 'Artificial Intelligence',
    topic: 'Supervised Learning & Backpropagation',
    description: 'AI knowledge check covering gradient descent, loss functions, and activation layers.',
    timeLimitMinutes: 15,
    createdBy: 'usr-teacher-marcus',
    createdByName: 'Prof. Marcus Vance',
    createdAt: '2026-07-22',
    targetGrade: 'Grade 12 - CS Track',
    questions: [
      {
        id: 'aiq1',
        text: 'Which activation function outputs values constrained strictly between 0 and 1, making it useful for binary probability classification?',
        options: ['ReLU', 'Sigmoid', 'Softmax', 'Tanh'],
        correctOptionIndex: 1,
        explanation: 'The Sigmoid function σ(z) = 1 / (1 + e^(-z)) maps any real value into the open interval (0, 1).',
        topic: 'Activation Functions',
        subject: 'Artificial Intelligence',
        difficulty: 'Beginner',
        timeLimitSeconds: 120
      },
      {
        id: 'aiq2',
        text: 'What is the primary purpose of Backpropagation in neural networks?',
        options: [
          'To generate fake synthetic data',
          'To calculate gradients of the loss function with respect to weights using the chain rule',
          'To convert continuous values into discrete categories',
          'To compress the model weights into 8-bit integers'
        ],
        correctOptionIndex: 1,
        explanation: 'Backpropagation uses the calculus chain rule to efficiently compute loss gradients for weight optimization via gradient descent.',
        topic: 'Neural Network Training',
        subject: 'Artificial Intelligence',
        difficulty: 'Intermediate',
        timeLimitSeconds: 120
      }
    ]
  }
];

export const INITIAL_KNOWLEDGE_TOPICS = [
  {
    id: 'kt-1',
    subject: 'Computer Science',
    topicName: 'Binary Search Trees & Heap Operations',
    masteryPercentage: 88,
    status: 'Mastered',
    lastEvaluated: '2026-07-29',
    trend: 'improving',
    predictedScoreImpact: 14
  },
  {
    id: 'kt-2',
    subject: 'Computer Science',
    topicName: 'Graph Algorithms (BFS / DFS)',
    masteryPercentage: 62,
    status: 'Needs Practice',
    lastEvaluated: '2026-07-28',
    trend: 'declining',
    predictedScoreImpact: -10
  },
  {
    id: 'kt-3',
    subject: 'Mathematics',
    topicName: 'Calculus Differentiation & Chain Rule',
    masteryPercentage: 92,
    status: 'Mastered',
    lastEvaluated: '2026-07-30',
    trend: 'improving',
    predictedScoreImpact: 18
  },
  {
    id: 'kt-4',
    subject: 'Mathematics',
    topicName: 'Definite Integration & Area Under Curves',
    masteryPercentage: 54,
    status: 'Critical Focus',
    lastEvaluated: '2026-07-26',
    trend: 'declining',
    predictedScoreImpact: -15
  },
  {
    id: 'kt-5',
    subject: 'Artificial Intelligence',
    topicName: 'Gradient Descent & Cost Optimization',
    masteryPercentage: 78,
    status: 'Proficient',
    lastEvaluated: '2026-07-29',
    trend: 'stable',
    predictedScoreImpact: 8
  }
];

export const INITIAL_PREDICTION_PATHWAY = {
  studentId: 'usr-student-alex',
  predictedExamScore: 86,
  confidenceScore: 94,
  readinessLevel: 'High Exam Readiness',
  topStrengths: [
    'Binary Tree Traversal & Recursion Stack Execution',
    'Calculus Differentiation & Power Rule Precision',
    'Supervised Learning Sigmoid & Classification Concepts'
  ],
  keyWeaknesses: [
    'Graph Traversals & BFS Queue Edge Cases',
    'Definite Integrals & Fundamental Theorem of Calculus'
  ],
  recommendedSteps: [
    {
      id: 'step-1',
      title: 'Graph Traversal Deep Dive & BFS/DFS Simulator',
      topic: 'Graph Algorithms (BFS / DFS)',
      type: 'Interactive Drill',
      durationMinutes: 15,
      completed: false,
      difficulty: 'Intermediate',
      summary: 'Interactive visualization step walking through queue state in BFS vs recursion stack in DFS for unweighted graphs.',
      resourceLink: '#drill-bfs'
    },
    {
      id: 'step-2',
      title: 'Definite Integration & Curve Area Micro-Mastery',
      topic: 'Definite Integration & Area Under Curves',
      type: 'Video Lesson',
      durationMinutes: 20,
      completed: true,
      difficulty: 'Intermediate',
      summary: 'Visual calculus guide focusing on substitution methods and definite bounds calculation.',
      resourceLink: '#video-calculus'
    },
    {
      id: 'step-3',
      title: 'Adaptive AI Target Drill: Integration Edge Cases',
      topic: 'Definite Integration & Area Under Curves',
      type: 'AI Practice Quiz',
      durationMinutes: 10,
      completed: false,
      difficulty: 'Advanced',
      summary: '3 targeted questions generated dynamically by Gemini to boost integral evaluation accuracy.',
      resourceLink: '#quiz-integration'
    }
  ],
  aiAnalysisSummary: 'Alex demonstrates robust logical analytical speed in Computer Science algorithms and foundational calculus derivatives. To elevate the predicted exam score from 86% to 95%+, priority focus should be given to graph edge traversal algorithms and definite integration substitution techniques.',
  lastUpdated: '2026-07-30 18:45'
};

export const INITIAL_QUIZ_ATTEMPTS = [
  {
    id: 'attempt-init-1',
    quizId: 'quiz-cs101',
    quizTitle: 'Data Structures & Algorithmic Complexity',
    studentId: 'usr-student-alex',
    studentEmail: 'student@spark.edu',
    studentName: 'Alex Rivera',
    subject: 'Computer Science',
    scorePercentage: 75,
    totalQuestions: 4,
    correctAnswers: 3,
    completedAt: '2026-07-30 19:22',
    topicMasteryMap: { 'Trees & Graph Traversal': 75 }
  },
  {
    id: 'attempt-init-2',
    quizId: 'quiz-math201',
    quizTitle: 'Calculus & Optimization Diagnostics',
    studentId: 'usr-student-alex',
    studentEmail: 'student@spark.edu',
    studentName: 'Alex Rivera',
    subject: 'Mathematics',
    scorePercentage: 88,
    totalQuestions: 3,
    correctAnswers: 3,
    completedAt: '2026-08-01 14:10',
    topicMasteryMap: { 'Definite Integration & Area Under Curves': 88 }
  },
  {
    id: 'attempt-init-3',
    quizId: 'quiz-cs101',
    quizTitle: 'Data Structures & Algorithmic Complexity',
    studentId: 'usr-student-priya',
    studentEmail: 'priya.sharma@spark.edu',
    studentName: 'Priya Sharma',
    subject: 'Computer Science',
    scorePercentage: 100,
    totalQuestions: 4,
    correctAnswers: 4,
    completedAt: '2026-08-02 11:45',
    topicMasteryMap: { 'Trees & Graph Traversal': 100 }
  }
];

export const INITIAL_ACTIVITY_LOGS = [
  {
    id: 'log-1',
    timestamp: '2026-07-31 00:15',
    userEmail: 'lekhana@gmail.com',
    userName: 'Lekhana',
    role: 'admin',
    action: 'Admin System Inspection',
    type: 'admin',
    details: 'Lekhana reviewed platform security parameters and system telemetry.'
  },
  {
    id: 'log-2',
    timestamp: '2026-07-30 19:22',
    userEmail: 'student@spark.edu',
    userName: 'Alex Rivera',
    role: 'student',
    action: 'Completed Assessment',
    type: 'assessment',
    details: 'Completed "Data Structures & Algorithmic Complexity" with 75% score.'
  },
  {
    id: 'log-3',
    timestamp: '2026-07-30 16:10',
    userEmail: 'teacher@spark.edu',
    userName: 'Dr. Sarah Jenkins',
    role: 'teacher',
    action: 'Created New Assessment',
    type: 'assessment',
    details: 'Published "Calculus & Optimization Diagnostics" for Grade 11 STEM.'
  },
  {
    id: 'log-4',
    timestamp: '2026-07-28 14:05',
    userEmail: 'david.chen@spark.edu',
    userName: 'David Chen',
    role: 'student',
    action: 'Submitted Registration',
    type: 'registration',
    details: 'Registered for student account. Status set to pending approval.'
  }
];

export const INITIAL_CLASS_ANALYTICS = {
  subject: 'Computer Science & STEM',
  grade: 'Grade 11 - STEM Track',
  totalStudents: 28,
  averageMastery: 78,
  predictedPassRate: 92,
  atRiskCount: 3,
  topicBreakdown: [
    { topicName: 'Trees & Heap Operations', avgMastery: 85 },
    { topicName: 'Graph BFS / DFS', avgMastery: 64 },
    { topicName: 'Calculus Derivatives', avgMastery: 89 },
    { topicName: 'Definite Integration', avgMastery: 58 },
    { topicName: 'Neural Networks Basics', avgMastery: 79 }
  ]
};
