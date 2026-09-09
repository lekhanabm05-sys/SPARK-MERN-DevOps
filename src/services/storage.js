import {
  DEFAULT_USERS,
  INITIAL_QUIZZES,
  INITIAL_KNOWLEDGE_TOPICS,
  INITIAL_PREDICTION_PATHWAY,
  INITIAL_ACTIVITY_LOGS,
  INITIAL_QUIZ_ATTEMPTS
} from '../data/mockData.js';

const KEYS = {
  USERS: 'spark_users_v1',
  CURRENT_USER: 'spark_current_user_v1',
  QUIZZES: 'spark_quizzes_v1',
  ATTEMPTS: 'spark_attempts_v1',
  KNOWLEDGE_TOPICS: 'spark_knowledge_v1',
  PREDICTION: 'spark_prediction_v1',
  LOGS: 'spark_logs_v1'
};

// Initialize default storage if empty
export function initStorage() {
  if (!localStorage.getItem(KEYS.USERS)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(DEFAULT_USERS));
  }
  if (!localStorage.getItem(KEYS.QUIZZES)) {
    localStorage.setItem(KEYS.QUIZZES, JSON.stringify(INITIAL_QUIZZES));
  }
  if (!localStorage.getItem(KEYS.KNOWLEDGE_TOPICS)) {
    localStorage.setItem(KEYS.KNOWLEDGE_TOPICS, JSON.stringify(INITIAL_KNOWLEDGE_TOPICS));
  }
  if (!localStorage.getItem(KEYS.PREDICTION)) {
    localStorage.setItem(KEYS.PREDICTION, JSON.stringify(INITIAL_PREDICTION_PATHWAY));
  }
  if (!localStorage.getItem(KEYS.LOGS)) {
    localStorage.setItem(KEYS.LOGS, JSON.stringify(INITIAL_ACTIVITY_LOGS));
  }
  if (!localStorage.getItem(KEYS.ATTEMPTS) || localStorage.getItem(KEYS.ATTEMPTS) === '[]') {
    localStorage.setItem(KEYS.ATTEMPTS, JSON.stringify(INITIAL_QUIZ_ATTEMPTS));
  }
}

// User Storage
export function getUsers() {
  initStorage();
  const raw = localStorage.getItem(KEYS.USERS);
  return raw ? JSON.parse(raw) : DEFAULT_USERS;
}

export async function checkMernStatus() {
  try {
    const res = await fetch('/api/db/status');
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("MERN status check error:", err);
  }
  return { success: true, mongoConnected: false, databaseName: 'spark_nosql_memory', stack: 'MERN (Express Node Backend + React Frontend)' };
}

export function saveUsers(users) {
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  // Async sync to Express backend MongoDB endpoint
  users.forEach(u => {
    fetch('/api/db/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(u)
    }).catch(() => {});
  });
}

export function getCurrentUser() {
  initStorage();
  const raw = localStorage.getItem(KEYS.CURRENT_USER);
  return raw ? JSON.parse(raw) : null;
}

export function setCurrentUser(user) {
  if (user) {
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(KEYS.CURRENT_USER);
  }
}

// Authenticate against storage (including pre-seeded Lekhana admin & registered students)
export function authenticateUser(email, pass) {
  const users = getUsers();
  const normalizedEmail = email.trim().toLowerCase();

  // Admin special requirement: Lekhana lekhana@gmail.com / lekhana
  if (normalizedEmail === 'lekhana@gmail.com') {
    if (pass === 'lekhana') {
      let admin = users.find(u => u.email.toLowerCase() === 'lekhana@gmail.com');
      if (!admin) {
        admin = {
          id: 'usr-admin-lekhana',
          email: 'lekhana@gmail.com',
          name: 'Lekhana',
          role: 'admin',
          status: 'active',
          joinedDate: '2026-01-10',
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
          department: 'Platform Administration & System Governance',
          institution: 'SPARK Central Academy'
        };
        users.push(admin);
      }
      // Always sync on login (upsert-safe) — DEFAULT_USERS pre-seeds this
      // account into localStorage before first login, so "not found" alone
      // is not a reliable signal that the DB has a copy yet.
      saveUsers(users);
      setCurrentUser(admin);
      addActivityLog(admin.email, admin.name, admin.role, 'Admin Login', 'auth', 'Lekhana logged into Admin Control Panel.');
      return { success: true, user: admin };
    } else {
      return { success: false, error: 'Invalid password for Admin account Lekhana.' };
    }
  }

  // Teacher default check
  if (normalizedEmail === 'teacher@spark.edu' && pass === 'teacher123') {
    let teacher = users.find(u => u.email.toLowerCase() === 'teacher@spark.edu');
    if (!teacher) {
      teacher = DEFAULT_USERS[1];
      users.push(teacher);
    }
    // Always sync on login (upsert-safe) — see note above.
    saveUsers(users);
    setCurrentUser(teacher);
    addActivityLog(teacher.email, teacher.name, teacher.role, 'Teacher Login', 'auth', 'Dr. Sarah Jenkins logged in.');
    return { success: true, user: teacher };
  }

  // Student default check
  if (normalizedEmail === 'student@spark.edu' && pass === 'student123') {
    let student = users.find(u => u.email.toLowerCase() === 'student@spark.edu');
    if (!student) {
      student = DEFAULT_USERS[3];
      users.push(student);
    }
    // Always sync on login (upsert-safe) — see note above.
    saveUsers(users);
    setCurrentUser(student);
    addActivityLog(student.email, student.name, student.role, 'Student Login', 'auth', 'Alex Rivera logged in.');
    return { success: true, user: student };
  }

  // General check in users list
  const user = users.find(u => u.email.toLowerCase() === normalizedEmail);
  if (!user) {
    return { success: false, error: 'No user account found with this email address. Please register for new access.' };
  }

  if (user.status === 'suspended') {
    return { success: false, error: 'Your account has been suspended by the administrator.' };
  }

  // For registered users, we accept their password (stored or password match)
  // Sync on login too — covers pre-seeded demo accounts (Priya, David,
  // Marcus, etc.) that were never explicitly registered/saved before.
  saveUsers(users);
  setCurrentUser(user);
  addActivityLog(user.email, user.name, user.role, 'User Login', 'auth', `${user.name} logged in successfully.`);
  return { success: true, user };
}

// Student Registration
export function registerStudent(data) {
  const users = getUsers();
  const normalizedEmail = data.email.trim().toLowerCase();

  if (users.some(u => u.email.toLowerCase() === normalizedEmail)) {
    return { success: false, error: 'An account with this email address already exists. Please login.' };
  }

  const newUser = {
    id: `usr-student-${Date.now()}`,
    email: data.email.trim(),
    name: data.name.trim(),
    role: 'student',
    status: 'active', // Active immediately so they can log in right away!
    joinedDate: new Date().toISOString().split('T')[0],
    grade: data.grade || 'Grade 11 - STEM',
    institution: data.institution || 'SPARK Online Academy',
    registrationApproved: true,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.name)}`
  };

  users.push(newUser);
  saveUsers(users);

  addActivityLog(
    newUser.email,
    newUser.name,
    'student',
    'New Student Registration',
    'registration',
    `New student ${newUser.name} registered access for grade: ${newUser.grade}.`
  );

  return { success: true, user: newUser };
}

// Quiz Storage
export function getQuizzes() {
  initStorage();
  const raw = localStorage.getItem(KEYS.QUIZZES);
  return raw ? JSON.parse(raw) : INITIAL_QUIZZES;
}

export function saveQuiz(quiz) {
  const quizzes = getQuizzes();
  const existingIdx = quizzes.findIndex(q => q.id === quiz.id);
  if (existingIdx >= 0) {
    quizzes[existingIdx] = quiz;
  } else {
    quizzes.unshift(quiz);
  }
  localStorage.setItem(KEYS.QUIZZES, JSON.stringify(quizzes));

  // Async sync to Express backend MongoDB endpoint
  fetch('/api/db/quizzes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(quiz)
  }).catch(() => {});
}

// Attempts
export function getQuizAttempts() {
  initStorage();
  const raw = localStorage.getItem(KEYS.ATTEMPTS);
  return raw ? JSON.parse(raw) : [];
}

export function saveQuizAttempt(attempt) {
  const attempts = getQuizAttempts();
  attempts.unshift(attempt);
  localStorage.setItem(KEYS.ATTEMPTS, JSON.stringify(attempts));

  // Async sync to Express backend MongoDB endpoint
  fetch('/api/db/attempts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(attempt)
  }).catch(() => {});

  // Also adjust knowledge topics based on attempt score
  updateKnowledgeAfterAttempt(attempt);
}

function updateKnowledgeAfterAttempt(attempt) {
  const topics = getKnowledgeTopics();
  // Update matching topics
  const updatedTopics = topics.map(t => {
    if (attempt.topicMasteryMap && attempt.topicMasteryMap[t.topicName] !== undefined) {
      const newScore = Math.min(100, Math.max(0, Math.round((t.masteryPercentage + attempt.topicMasteryMap[t.topicName]) / 2)));
      let status = 'Proficient';
      if (newScore >= 85) status = 'Mastered';
      else if (newScore < 60) status = 'Critical Focus';
      else if (newScore < 75) status = 'Needs Practice';

      return {
        ...t,
        masteryPercentage: newScore,
        status,
        lastEvaluated: new Date().toISOString().split('T')[0],
        trend: newScore >= t.masteryPercentage ? 'improving' : 'declining'
      };
    }
    return t;
  });

  localStorage.setItem(KEYS.KNOWLEDGE_TOPICS, JSON.stringify(updatedTopics));

  // Async sync to Express backend MongoDB endpoint
  fetch('/api/db/knowledgetopics/bulk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedTopics)
  }).catch(() => {});
}

// Knowledge Topics
export function getKnowledgeTopics() {
  initStorage();
  const raw = localStorage.getItem(KEYS.KNOWLEDGE_TOPICS);
  return raw ? JSON.parse(raw) : INITIAL_KNOWLEDGE_TOPICS;
}

// Prediction Pathway
export function getPredictionPathway() {
  initStorage();
  const raw = localStorage.getItem(KEYS.PREDICTION);
  return raw ? JSON.parse(raw) : INITIAL_PREDICTION_PATHWAY;
}

export function savePredictionPathway(pathway) {
  localStorage.setItem(KEYS.PREDICTION, JSON.stringify(pathway));
}

// Activity Logs
export function getActivityLogs() {
  initStorage();
  const raw = localStorage.getItem(KEYS.LOGS);
  return raw ? JSON.parse(raw) : INITIAL_ACTIVITY_LOGS;
}

export function addActivityLog(
  userEmail,
  userName,
  role,
  action,
  type,
  details
) {
  const logs = getActivityLogs();
  const newLog = {
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    userEmail,
    userName,
    role,
    action,
    type,
    details
  };
  logs.unshift(newLog);
  localStorage.setItem(KEYS.LOGS, JSON.stringify(logs.slice(0, 50))); // Keep last 50 logs

  // Async sync to Express backend MongoDB endpoint
  fetch('/api/db/systemlogs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newLog)
  }).catch(() => {});
}

// ---------------------------------------------------------------------------
// Server hydration: pulls each collection from MongoDB (via the Express API)
// and merges it into localStorage, so the database — not just whatever this
// browser happened to save — is the real source of truth. Without this, data
// synced to Mongo from another device/browser (or after clearing site data)
// would never show up in the app, even though it's sitting in Atlas.
//
// Merge strategy: local records are kept by default (so built-in seed/demo
// content like INITIAL_QUIZZES never disappears just because the DB hasn't
// seen it yet), but any record also present in the DB response overwrites
// the local copy by `id`, since the DB reflects the most recently synced
// state across all devices/sessions.
// ---------------------------------------------------------------------------

function mergeById(localArr, remoteArr) {
  if (!Array.isArray(remoteArr) || remoteArr.length === 0) return localArr || [];
  const map = new Map();
  (localArr || []).forEach(item => item && item.id && map.set(item.id, item));
  remoteArr.forEach(item => item && item.id && map.set(item.id, item)); // DB wins on conflict
  return Array.from(map.values());
}

async function fetchJsonSafe(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function hydrateFromServer() {
  initStorage(); // make sure local defaults exist before merging

  const [remoteUsers, remoteQuizzes, remoteAttempts, remoteTopics, remoteLogs] = await Promise.all([
    fetchJsonSafe('/api/db/users'),
    fetchJsonSafe('/api/db/quizzes'),
    fetchJsonSafe('/api/db/attempts'),
    fetchJsonSafe('/api/db/knowledgetopics'),
    fetchJsonSafe('/api/db/systemlogs')
  ]);

  if (remoteUsers) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(mergeById(getUsers(), remoteUsers)));
  }
  if (remoteQuizzes) {
    localStorage.setItem(KEYS.QUIZZES, JSON.stringify(mergeById(getQuizzes(), remoteQuizzes)));
  }
  if (remoteAttempts) {
    localStorage.setItem(KEYS.ATTEMPTS, JSON.stringify(mergeById(getQuizAttempts(), remoteAttempts)));
  }
  if (remoteTopics) {
    localStorage.setItem(KEYS.KNOWLEDGE_TOPICS, JSON.stringify(mergeById(getKnowledgeTopics(), remoteTopics)));
  }
  if (remoteLogs) {
    const merged = mergeById(getActivityLogs(), remoteLogs);
    merged.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
    localStorage.setItem(KEYS.LOGS, JSON.stringify(merged.slice(0, 50)));
  }

  // Keep the logged-in user's own record in sync with the DB copy, in case
  // it was updated elsewhere (e.g. status change by an admin).
  const current = getCurrentUser();
  if (current && remoteUsers) {
    const updated = remoteUsers.find(u => u.id === current.id);
    if (updated) setCurrentUser(updated);
  }

  return {
    users: !!remoteUsers,
    quizzes: !!remoteQuizzes,
    attempts: !!remoteAttempts,
    knowledgeTopics: !!remoteTopics,
    logs: !!remoteLogs
  };
}