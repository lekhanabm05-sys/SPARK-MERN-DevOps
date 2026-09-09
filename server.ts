import express from "express";
import { createServer as createHttpServer } from "node:http";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// MongoDB Mongoose Schemas & Models (MERN Stack: M)
const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['student', 'teacher', 'admin'], required: true },
  status: { type: String, default: 'active' },
  joinedDate: { type: String },
  grade: { type: String },
  institution: { type: String },
  department: { type: String },
  avatar: { type: String },
  registrationApproved: { type: Boolean, default: true }
}, { timestamps: true });

const QuizSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String },
  subject: { type: String, required: true },
  topic: { type: String, required: true },
  difficulty: { type: String, default: 'Intermediate' },
  createdBy: { type: String, required: true },
  createdByName: { type: String },
  timeLimitMinutes: { type: Number, default: 15 },
  totalPoints: { type: Number, default: 100 },
  // Assignment fields: without these, Mongoose silently strips them on save
  // (schemas are strict by default), and visibleQuizzes filtering in App.jsx
  // depends on assignedTo/assignedEmails to decide which students see a quiz.
  assignedTo: { type: String, default: 'all' }, // 'all' or 'selected'
  assignedEmails: { type: [String], default: [] },
  isAiGenerated: { type: Boolean, default: false },
  questions: [{
    id: String,
    text: String,
    options: [String],
    correctOptionIndex: Number,
    explanation: String,
    topic: String,
    subject: String,
    difficulty: String
  }]
}, { timestamps: true });

const QuizAttemptSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  quizId: { type: String, required: true },
  quizTitle: { type: String, required: true },
  subject: { type: String, required: true },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  correctAnswers: { type: Number, required: true },
  percentage: { type: Number, required: true },
  completedAt: { type: String, required: true },
  topicMasteryMap: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

const KnowledgeTopicSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  topicName: { type: String, required: true },
  subject: { type: String, required: true },
  masteryPercentage: { type: Number, required: true },
  status: { type: String, required: true },
  trend: { type: String, default: 'stable' },
  lastEvaluated: { type: String }
}, { timestamps: true });

const SystemLogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  timestamp: { type: String, required: true },
  userEmail: { type: String, required: true },
  userName: { type: String, required: true },
  role: { type: String, required: true },
  action: { type: String, required: true },
  type: { type: String, required: true },
  details: { type: String, required: true }
}, { timestamps: true });

// Models
const MongoUser: any = mongoose.models.User || mongoose.model("User", UserSchema);
const MongoQuiz: any = mongoose.models.Quiz || mongoose.model("Quiz", QuizSchema);
const MongoAttempt: any = mongoose.models.QuizAttempt || mongoose.model("QuizAttempt", QuizAttemptSchema);
const MongoKnowledgeTopic: any = mongoose.models.KnowledgeTopic || mongoose.model("KnowledgeTopic", KnowledgeTopicSchema);
const MongoSystemLog: any = mongoose.models.SystemLog || mongoose.model("SystemLog", SystemLogSchema);

// In-Memory Fallback Collections (Guarantee continuous zero-crash operation when MongoDB URI is absent)
const memoryCollections = {
  users: [
    {
      id: 'usr-admin-lekhana',
      email: 'lekhana@gmail.com',
      name: 'Lekhana',
      role: 'admin',
      status: 'active',
      joinedDate: '2026-01-10',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
      department: 'Platform Administration & Governance',
      institution: 'SPARK Academy'
    },
    {
      id: 'usr-teacher-1',
      email: 'teacher@spark.edu',
      name: 'Dr. Sarah Jenkins',
      role: 'teacher',
      status: 'active',
      joinedDate: '2026-01-15',
      department: 'STEM & Computer Science',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
    },
    {
      id: 'usr-student-1',
      email: 'student@spark.edu',
      name: 'Alex Rivera',
      role: 'student',
      status: 'active',
      joinedDate: '2026-02-01',
      grade: 'Grade 11 - STEM',
      institution: 'SPARK Academy',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200'
    }
  ],
  quizzes: [
    {
      id: 'q-stem-01',
      title: 'Advanced Data Structures & Big-O Time Complexity',
      description: 'Diagnostic assessment covering binary trees, hash map collision resolution, and amortized time bounds.',
      subject: 'Computer Science',
      topic: 'Data Structures',
      difficulty: 'Advanced',
      createdBy: 'Dr. Sarah Jenkins',
      timeLimitMinutes: 15,
      totalPoints: 100,
      questions: [
        {
          id: 'q1-1',
          text: 'What is the tightest upper bound for searching a key in a self-balancing AVL tree containing N elements?',
          options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'],
          correctOptionIndex: 1,
          explanation: 'Self-balancing AVL trees maintain strict height balance factor <= 1, guaranteeing O(log N) lookup.',
          topic: 'Data Structures',
          subject: 'Computer Science',
          difficulty: 'Advanced'
        },
        {
          id: 'q1-2',
          text: 'In hash tables, what is the amortized worst-case complexity of open addressing with linear probing under a load factor < 0.7?',
          options: ['O(1)', 'O(log N)', 'O(N)', 'O(N^2)'],
          correctOptionIndex: 0,
          explanation: 'When load factor remains below critical threshold, expected probe length is bounded by a constant, leading to O(1) amortized search.',
          topic: 'Data Structures',
          subject: 'Computer Science',
          difficulty: 'Intermediate'
        }
      ]
    }
  ],
  attempts: [] as any[],
  topics: [
    { id: 'kt-1', topicName: 'Data Structures', subject: 'Computer Science', masteryPercentage: 82, status: 'Proficient', trend: 'improving', lastEvaluated: '2026-07-28' },
    { id: 'kt-2', topicName: 'Algorithmic Optimization', subject: 'Computer Science', masteryPercentage: 68, status: 'Needs Practice', trend: 'stable', lastEvaluated: '2026-07-29' },
    { id: 'kt-3', topicName: 'Asymptotic Analysis', subject: 'Computer Science', masteryPercentage: 91, status: 'Mastered', trend: 'improving', lastEvaluated: '2026-07-30' }
  ],
  logs: [
    { id: 'log-01', timestamp: '2026-07-31 00:00', userEmail: 'lekhana@gmail.com', userName: 'Lekhana', role: 'admin', action: 'MERN MongoDB Initialization', type: 'system', details: 'Initialized MongoDB NoSQL models & Express backend API engine.' }
  ]
};

// Connect to MongoDB
let isMongoConnected = false;
async function connectMongoDB() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.log("ℹ️ MONGODB_URI not provided in env. MERN server running with local NoSQL document engine.");
    return;
  }

  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000
      });
      isMongoConnected = true;
      console.log("✅ Successfully connected to MongoDB Database instance via Mongoose!");
      return;
    } catch (err: any) {
      const message = err?.message || String(err);
      if (attempt < maxAttempts) {
        console.warn(`⚠️ MongoDB connection attempt ${attempt}/${maxAttempts} failed: ${message}`);
        continue;
      }

      console.warn("⚠️ MongoDB connection warning:", message);
      if (/whitelist|ip address|not authorized|Could not connect to any servers/i.test(message)) {
        console.warn("ℹ️ Add this machine's public IP in MongoDB Atlas → Network Access, then restart the server.");
      } else if (/querySrv|ENOTFOUND|ECONNREFUSED/i.test(message)) {
        console.warn("ℹ️ MongoDB Atlas DNS lookup failed. Check the network DNS/VPN, or use the standard (non-SRV) Atlas connection string.");
      }
      console.log("ℹ️ Server seamlessly falling back to local NoSQL document engine.");
    }
  }
}

connectMongoDB();

let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

async function startServer() {
  const app = express();
  // Share one listener with Vite so HMR does not reserve port 24678.
  const httpServer = createHttpServer(app);
  app.use(express.json());

  // Full-Stack Health & Diagnostic Endpoint (MERN Stack: MongoDB + Express + React + Node)
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      stack: "MERN Stack (MongoDB + Express.js + React.js + Node.js)",
      backend: "Node.js + Express.js Web Framework",
      database: {
        engine: isMongoConnected ? "MongoDB Atlas" : "NoSQL Document Store (Mongoose)",
        connected: isMongoConnected,
        collections: ["users", "quizzes", "quizattempts", "knowledgetopics", "systemlogs"]
      },
      frontend: "React.js 19.0 + Vite",
      aiAvailable: !!process.env.GEMINI_API_KEY
    });
  });

  // MERN MongoDB Status Endpoint
  app.get("/api/db/status", async (req, res) => {
    try {
      let userCount = memoryCollections.users.length;
      let quizCount = memoryCollections.quizzes.length;
      let attemptCount = memoryCollections.attempts.length;

      if (isMongoConnected) {
        userCount = await MongoUser.countDocuments();
        quizCount = await MongoQuiz.countDocuments();
        attemptCount = await MongoAttempt.countDocuments();
      }

      res.json({
        success: true,
        stack: "MERN Stack Full Integration",
        mongoConnected: isMongoConnected,
        databaseName: isMongoConnected ? mongoose.connection.name : "spark_nosql_memory",
        collections: {
          users: userCount,
          quizzes: quizCount,
          attempts: attemptCount
        },
        driver: "Mongoose 8+ & Node MongoDB Driver"
      });
    } catch (err: any) {
      res.json({ success: false, error: err?.message || String(err) });
    }
  });

  // REST API Endpoints for MERN Stack Persistence
  // USERS API
  app.get("/api/db/users", async (req, res) => {
    if (isMongoConnected) {
      try {
        const users = await MongoUser.find({});
        return res.json(users);
      } catch (e) {
        console.error("Mongo fetch users error, falling back:", e);
      }
    }
    return res.json(memoryCollections.users);
  });

  // Upsert (by `id`) so re-saving an existing user (e.g. status change)
  // updates the document instead of failing on the unique id index.
  app.post("/api/db/users", async (req, res) => {
    const userData = req.body;
    if (!userData.id) userData.id = `usr-${Date.now()}`;

    if (isMongoConnected) {
      try {
        const saved = await MongoUser.findOneAndUpdate(
          { id: userData.id },
          userData,
          { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
        );
        return res.json({ success: true, user: saved });
      } catch (e: any) {
        return res.status(500).json({ error: e.message });
      }
    }

    const idx = memoryCollections.users.findIndex((u: any) => u.id === userData.id);
    if (idx >= 0) memoryCollections.users[idx] = userData;
    else memoryCollections.users.push(userData);
    return res.json({ success: true, user: userData });
  });

  // QUIZZES API
  app.get("/api/db/quizzes", async (req, res) => {
    if (isMongoConnected) {
      try {
        const quizzes = await MongoQuiz.find({}).sort({ createdAt: -1 });
        return res.json(quizzes);
      } catch (e) {
        console.error("Mongo fetch quizzes error:", e);
      }
    }
    return res.json(memoryCollections.quizzes);
  });

  app.post("/api/db/quizzes", async (req, res) => {
    const quizData = req.body;
    if (!quizData.id) quizData.id = `q-${Date.now()}`;

    if (isMongoConnected) {
      try {
        const created = await MongoQuiz.create(quizData);
        return res.json({ success: true, quiz: created });
      } catch (e: any) {
        return res.status(500).json({ error: e.message });
      }
    }

    memoryCollections.quizzes.unshift(quizData);
    return res.json({ success: true, quiz: quizData });
  });

  // ATTEMPTS API
  app.get("/api/db/attempts", async (req, res) => {
    if (isMongoConnected) {
      try {
        const attempts = await MongoAttempt.find({}).sort({ createdAt: -1 });
        return res.json(attempts);
      } catch (e) {
        console.error("Mongo fetch attempts error:", e);
      }
    }
    return res.json(memoryCollections.attempts);
  });

  app.post("/api/db/attempts", async (req, res) => {
    const attemptData = req.body;
    if (!attemptData.id) attemptData.id = `att-${Date.now()}`;

    // The frontend sends `scorePercentage`, but the schema's required
    // fields are `score` and `percentage` — normalize here so a naming
    // mismatch on the client doesn't turn into a 500 on every save.
    if (attemptData.scorePercentage !== undefined) {
      if (attemptData.score === undefined) attemptData.score = attemptData.scorePercentage;
      if (attemptData.percentage === undefined) attemptData.percentage = attemptData.scorePercentage;
    }

    if (isMongoConnected) {
      try {
        const created = await MongoAttempt.create(attemptData);
        return res.json({ success: true, attempt: created });
      } catch (e: any) {
        return res.status(500).json({ error: e.message });
      }
    }

    memoryCollections.attempts.unshift(attemptData);
    return res.json({ success: true, attempt: attemptData });
  });

  // KNOWLEDGE TOPICS API
  app.get("/api/db/knowledgetopics", async (req, res) => {
    if (isMongoConnected) {
      try {
        const topics = await MongoKnowledgeTopic.find({});
        return res.json(topics);
      } catch (e) {
        console.error("Mongo fetch knowledgetopics error:", e);
      }
    }
    return res.json(memoryCollections.topics);
  });

  // Upsert (by `id`) so repeated saves update the existing topic instead of
  // failing on the unique id index or creating duplicates.
  app.post("/api/db/knowledgetopics", async (req, res) => {
    const topicData = req.body;
    if (!topicData.id) topicData.id = `kt-${Date.now()}`;

    if (isMongoConnected) {
      try {
        const saved = await MongoKnowledgeTopic.findOneAndUpdate(
          { id: topicData.id },
          topicData,
          { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
        );
        return res.json({ success: true, topic: saved });
      } catch (e: any) {
        return res.status(500).json({ error: e.message });
      }
    }

    const idx = memoryCollections.topics.findIndex((t: any) => t.id === topicData.id);
    if (idx >= 0) memoryCollections.topics[idx] = topicData;
    else memoryCollections.topics.push(topicData);
    return res.json({ success: true, topic: topicData });
  });

  // Bulk upsert, used when a quiz attempt updates several topics at once
  app.post("/api/db/knowledgetopics/bulk", async (req, res) => {
    const topics = Array.isArray(req.body) ? req.body : [];

    if (isMongoConnected) {
      try {
        await Promise.all(
          topics.map((t: any) =>
            MongoKnowledgeTopic.findOneAndUpdate({ id: t.id }, t, {
              upsert: true,
              returnDocument: "after",
              setDefaultsOnInsert: true
            })
          )
        );
        return res.json({ success: true, count: topics.length });
      } catch (e: any) {
        return res.status(500).json({ error: e.message });
      }
    }

    topics.forEach((t: any) => {
      const idx = memoryCollections.topics.findIndex((x: any) => x.id === t.id);
      if (idx >= 0) memoryCollections.topics[idx] = t;
      else memoryCollections.topics.push(t);
    });
    return res.json({ success: true, count: topics.length });
  });

  // SYSTEM LOGS API
  app.get("/api/db/systemlogs", async (req, res) => {
    if (isMongoConnected) {
      try {
        const logs = await MongoSystemLog.find({}).sort({ createdAt: -1 });
        return res.json(logs);
      } catch (e) {
        console.error("Mongo fetch systemlogs error:", e);
      }
    }
    return res.json(memoryCollections.logs);
  });

  app.post("/api/db/systemlogs", async (req, res) => {
    const logData = req.body;
    if (!logData.id) logData.id = `log-${Date.now()}`;

    if (isMongoConnected) {
      try {
        const created = await MongoSystemLog.create(logData);
        return res.json({ success: true, log: created });
      } catch (e: any) {
        return res.status(500).json({ error: e.message });
      }
    }

    memoryCollections.logs.unshift(logData);
    return res.json({ success: true, log: logData });
  });

  // AI Quiz Generation Endpoint
  app.post("/api/ai/quiz", async (req, res) => {
    const { topic, subject, difficulty = "Intermediate", count = 3, existingQuestions = [] } = req.body;

    if (!topic || !subject) {
      return res.status(400).json({ error: "Topic and subject are required." });
    }

    if (!ai) {
      const existingSet = new Set((existingQuestions as string[]).map(q => q.toLowerCase().trim()));
      const pool = [
        {
          text: `In ${subject} (${topic}), what is the primary condition for optimizing asymptotic execution bounds?`,
          options: [
            "Minimizing auxiliary stack depth & recursive overhead",
            "Increasing memory heap allocation uniformly",
            "Executing quadratic loops synchronously",
            "Disabling cache hit predictions"
          ],
          correctOptionIndex: 0,
          explanation: "Minimizing auxiliary stack depth and eliminating redundant subproblem calculations optimizes time and space execution."
        },
        {
          text: `When analyzing key concepts in ${topic}, which strategy guarantees optimal real-time feedback?`,
          options: [
            "Incremental parameter tuning & real-time analytics",
            "Exhaustive brute force iteration",
            "Ignoring edge condition limits",
            "Static non-adaptive fixed evaluation"
          ],
          correctOptionIndex: 0,
          explanation: "Incremental parameter adjustments backed by continuous diagnostic measurements provide accurate predictive feedback."
        },
        {
          text: `In ${topic} (${difficulty} level), how do system state transformations handle error propagation?`,
          options: [
            "Through isolated fault barriers and exception bubbling control",
            "By suppressing all internal validation metrics",
            "By forcing continuous synchronous thread locks",
            "Via unstructured global state mutations"
          ],
          correctOptionIndex: 0,
          explanation: "Isolated fault barriers prevent cascading failure across diagnostic evaluation nodes."
        },
        {
          text: `Which core theoretical principle governs convergence in ${topic} algorithms?`,
          options: [
            "Monotonic cost reduction and bound constraints",
            "Unbounded random matrix expansion",
            "Fixed non-terminating recursion loops",
            "Arbitrary heuristic pruning without state verification"
          ],
          correctOptionIndex: 0,
          explanation: "Monotonic cost reduction ensures iterative steps approach mathematical convergence limits."
        },
        {
          text: `What is the recommended evaluation metric when measuring performance stability in ${topic}?`,
          options: [
            "Variance across standardized test distribution samples",
            "Single peak benchmark measurement",
            "Unweighted mean without variance analysis",
            "Maximal raw throughput disregarding error rate"
          ],
          correctOptionIndex: 0,
          explanation: "Measuring variance across standardized test distributions provides true insight into stability and edge-case handling."
        }
      ];

      const freshQuestions = pool
        .filter(q => !existingSet.has(q.text.toLowerCase().trim()))
        .map((q, idx) => ({
          id: `gen-q-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
          text: q.text,
          options: q.options,
          correctOptionIndex: q.correctOptionIndex,
          explanation: q.explanation,
          topic,
          subject,
          difficulty,
          timeLimitSeconds: 120
        }));

      // If all pool questions exist, generate a custom variation
      if (freshQuestions.length === 0) {
        freshQuestions.push({
          id: `gen-q-custom-${Date.now()}`,
          text: `Advanced ${difficulty} concept check #${existingQuestions.length + 1} regarding ${topic} in ${subject}: Which optimization applies?`,
          options: [
            `Apply adaptive state modeling specific to ${topic}`,
            "Disable parameter tracking",
            "Use unverified global state variables",
            "Bypass diagnostic validation rules"
          ],
          correctOptionIndex: 0,
          explanation: `Adaptive state modeling tailors performance directly to ${topic} domain constraints.`,
          topic,
          subject,
          difficulty,
          timeLimitSeconds: 120
        });
      }

      return res.json({
        quizTitle: `SPARK Smart Quiz: ${topic}`,
        questions: freshQuestions.slice(0, count)
      });
    }

    try {
      const existingPromptContext = existingQuestions.length > 0
        ? `CRITICAL REQUIREMENT: Do NOT repeat or generate questions similar to any of these existing questions:\n${JSON.stringify(existingQuestions)}\nGenerate ${count} completely NEW, unique, distinct diagnostic questions.`
        : `Generate ${count} distinct multiple choice questions.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `Generate a structured ${difficulty} assessment with ${count} multiple choice questions on subject "${subject}" and topic "${topic}". Include clear explanation for each answer. ${existingPromptContext}`,
        config: {
          systemInstruction: "You are SPARK, an expert AI assessment engine. Return valid JSON only containing high quality diagnostic multiple choice questions without repeating existing items.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              quizTitle: { type: Type.STRING },
              description: { type: Type.STRING },
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    text: { type: Type.STRING },
                    options: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    correctOptionIndex: { type: Type.INTEGER },
                    explanation: { type: Type.STRING },
                    topic: { type: Type.STRING },
                    subject: { type: Type.STRING },
                    difficulty: { type: Type.STRING }
                  },
                  required: ["id", "text", "options", "correctOptionIndex", "explanation", "topic", "subject", "difficulty"]
                }
              }
            },
            required: ["quizTitle", "description", "questions"]
          }
        }
      });

      const jsonText = response.text || "{}";
      const parsedData = JSON.parse(jsonText);
      return res.json(parsedData);
    } catch (err: any) {
      console.error("Gemini AI Quiz Generation Error:", err);
      return res.status(500).json({
        error: "Failed to generate AI quiz via Gemini API",
        details: err?.message || String(err)
      });
    }
  });

  // AI Knowledge Prediction & Learning Pathway Endpoint
  app.post("/api/ai/predict", async (req, res) => {
    const { studentName, subject, scorePercentage, topicMastery } = req.body;

    if (!ai) {
      return res.json({
        predictedExamScore: Math.min(98, Math.max(50, Math.round(scorePercentage + 8))),
        confidenceScore: 92,
        readinessLevel: scorePercentage >= 80 ? "High Exam Readiness" : scorePercentage >= 65 ? "Moderate Readiness" : "Requires Targeted Remediation",
        topStrengths: [`Core concepts in ${subject}`, "Analytical problem solving speed"],
        keyWeaknesses: [`Advanced edge cases in ${subject}`, "Time-constrained multi-step problem evaluation"],
        recommendedSteps: [
          {
            id: `step-rec-1-${Date.now()}`,
            title: `Micro-Drill: ${subject} Fundamental Principles`,
            topic: subject,
            type: "Interactive Drill",
            durationMinutes: 15,
            completed: false,
            difficulty: "Intermediate",
            summary: "Targeted problem set focusing on bridging missed question patterns."
          },
          {
            id: `step-rec-2-${Date.now()}`,
            title: "Real-time AI Simulated Practice Test",
            topic: subject,
            type: "AI Practice Quiz",
            durationMinutes: 10,
            completed: false,
            difficulty: "Advanced",
            summary: "Custom adaptive drill generated to test retention under timer conditions."
          }
        ],
        aiAnalysisSummary: `Based on real-time performance analytics, ${studentName || 'Student'} shows a solid baseline score of ${scorePercentage}%. Following the 2 recommended learning steps will optimize exam performance.`
      });
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `Analyze student performance for ${studentName || 'Student'} in ${subject}. Current score: ${scorePercentage}%. Topic breakdown: ${JSON.stringify(topicMastery || {})}. Predict exam readiness, highlight top strengths, key weaknesses, and suggest 2-3 specific learning pathway steps.`,
        config: {
          systemInstruction: "You are the SPARK Knowledge Prediction Engine. Return actionable, encouraging predictive analytics in structured JSON.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              predictedExamScore: { type: Type.INTEGER },
              confidenceScore: { type: Type.INTEGER },
              readinessLevel: { type: Type.STRING },
              topStrengths: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              keyWeaknesses: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              aiAnalysisSummary: { type: Type.STRING },
              recommendedSteps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING },
                    topic: { type: Type.STRING },
                    type: { type: Type.STRING },
                    durationMinutes: { type: Type.INTEGER },
                    completed: { type: Type.BOOLEAN },
                    difficulty: { type: Type.STRING },
                    summary: { type: Type.STRING }
                  },
                  required: ["id", "title", "topic", "type", "durationMinutes", "completed", "difficulty", "summary"]
                }
              }
            },
            required: ["predictedExamScore", "confidenceScore", "readinessLevel", "topStrengths", "keyWeaknesses", "aiAnalysisSummary", "recommendedSteps"]
          }
        }
      });

      const jsonText = response.text || "{}";
      const parsedData = JSON.parse(jsonText);
      return res.json(parsedData);
    } catch (err: any) {
      console.error("Gemini AI Prediction Error:", err);
      return res.status(500).json({
        error: "Failed to generate AI knowledge prediction",
        details: err?.message || String(err)
      });
    }
  });

  // Vite development middleware vs production static distribution
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: { server: httpServer }
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 SPARK MERN Stack Server running on http://localhost:${PORT} (MongoDB + Express.js + React.js + Node.js)`);
  });
}

startServer();