import { PrismaClient, Difficulty, Category, TargetRole } from '@prisma/client'

const prisma = new PrismaClient()

const questions = [
  // ─── FRONTEND ──────────────────────────────────────────
  {
    title: 'Explain the Virtual DOM and how React uses it',
    description:
      'Describe what the Virtual DOM is, how React leverages it for efficient UI updates, and explain the reconciliation algorithm. Discuss the performance trade-offs.',
    difficulty: Difficulty.MEDIUM,
    category: Category.FRONTEND,
    targetRole: TargetRole.FRONTEND_DEV,
    tags: ['react', 'virtual-dom', 'performance', 'reconciliation'],
    hints: [
      'Think about how DOM manipulation is expensive',
      'What is diffing and how does React use it?',
    ],
  },
  {
    title: 'How does CSS specificity work?',
    description:
      'Explain CSS specificity, how browsers calculate it, and how conflicts between rules are resolved. Give examples of specificity calculations.',
    difficulty: Difficulty.EASY,
    category: Category.FRONTEND,
    targetRole: TargetRole.FRONTEND_DEV,
    tags: ['css', 'specificity', 'styling'],
    hints: ['Think about inline styles vs class vs id', 'What does !important do?'],
  },
  {
    title: 'Implement a debounce function from scratch',
    description:
      'Write a debounce utility function in JavaScript/TypeScript. Explain its use cases, how it differs from throttle, and demonstrate it with a real-world example like a search input.',
    difficulty: Difficulty.MEDIUM,
    category: Category.FRONTEND,
    targetRole: TargetRole.FRONTEND_DEV,
    tags: ['javascript', 'debounce', 'performance', 'closures'],
    hints: [
      'Think about closures and timers',
      'How do you cancel and reset the timer on each call?',
    ],
  },
  {
    title: 'Explain React hooks: useState vs useReducer',
    description:
      'Compare useState and useReducer in React. When would you choose one over the other? Implement a shopping cart using useReducer to demonstrate complex state management.',
    difficulty: Difficulty.MEDIUM,
    category: Category.FRONTEND,
    targetRole: TargetRole.FRONTEND_DEV,
    tags: ['react', 'hooks', 'state-management', 'useReducer'],
    hints: [
      'Think about when state logic becomes complex',
      'How does dispatch differ from setState?',
    ],
  },
  {
    title: 'What is code splitting and how do you implement it in Next.js?',
    description:
      'Explain code splitting, its benefits for performance, and how Next.js handles it automatically. Demonstrate dynamic imports and lazy loading with React.lazy().',
    difficulty: Difficulty.HARD,
    category: Category.FRONTEND,
    targetRole: TargetRole.FULLSTACK_DEV,
    tags: ['nextjs', 'performance', 'code-splitting', 'lazy-loading'],
    hints: [
      'How does dynamic import() work?',
      "What is Next.js's automatic code splitting strategy?",
    ],
  },

  // ─── BACKEND ───────────────────────────────────────────
  {
    title: 'Explain RESTful API design principles',
    description:
      'Describe the key constraints and principles of RESTful API design. Cover statelessness, resource naming, HTTP methods, status codes, and versioning strategies.',
    difficulty: Difficulty.MEDIUM,
    category: Category.BACKEND,
    targetRole: TargetRole.BACKEND_DEV,
    tags: ['rest', 'api-design', 'http', 'backend'],
    hints: [
      'What does stateless mean in the context of REST?',
      'How should you name resources?',
    ],
  },
  {
    title: 'How does JWT authentication work?',
    description:
      'Explain the JWT structure, how it works for authentication, the difference between access tokens and refresh tokens, and common security vulnerabilities to avoid.',
    difficulty: Difficulty.MEDIUM,
    category: Category.BACKEND,
    targetRole: TargetRole.BACKEND_DEV,
    tags: ['jwt', 'authentication', 'security', 'tokens'],
    hints: [
      'What are the three parts of a JWT?',
      'Where should you store JWTs on the client?',
    ],
  },
  {
    title: 'Explain the Node.js event loop',
    description:
      'Describe how the Node.js event loop works, the call stack, task queue, microtask queue, and how async operations are handled. Include examples with setTimeout and Promises.',
    difficulty: Difficulty.HARD,
    category: Category.BACKEND,
    targetRole: TargetRole.BACKEND_DEV,
    tags: ['nodejs', 'event-loop', 'async', 'javascript'],
    hints: [
      'What is the difference between macrotasks and microtasks?',
      'How does libuv relate to the event loop?',
    ],
  },
  {
    title: 'Design a rate limiting system for an API',
    description:
      'Design and implement a rate limiting system for a REST API. Compare token bucket, sliding window, and fixed window algorithms. Implement one using Redis.',
    difficulty: Difficulty.HARD,
    category: Category.BACKEND,
    targetRole: TargetRole.BACKEND_DEV,
    tags: ['rate-limiting', 'redis', 'api', 'system-design'],
    hints: [
      'What data structure in Redis is best for this?',
      'How do you handle distributed systems?',
    ],
  },

  // ─── DSA ───────────────────────────────────────────────
  {
    title: 'Explain Big O notation with examples',
    description:
      'Explain Big O notation, time and space complexity. Analyze the complexity of common operations on arrays, linked lists, hash maps, and trees. Give examples of O(1), O(log n), O(n), O(n log n), O(n²).',
    difficulty: Difficulty.EASY,
    category: Category.DSA,
    targetRole: TargetRole.GENERAL,
    tags: ['big-o', 'complexity', 'algorithms', 'data-structures'],
    hints: [
      'Think about how runtime scales with input size',
      'What is the difference between best and worst case?',
    ],
  },
  {
    title: 'Implement a binary search algorithm',
    description:
      'Implement binary search both iteratively and recursively. Explain its time complexity and when it can be applied. Extend it to find the first/last occurrence of a target.',
    difficulty: Difficulty.EASY,
    category: Category.DSA,
    targetRole: TargetRole.GENERAL,
    tags: ['binary-search', 'algorithms', 'arrays', 'recursion'],
    hints: [
      'What is the prerequisite for binary search?',
      'How do you handle the mid calculation to avoid overflow?',
    ],
  },
  {
    title: 'Explain and implement a LRU Cache',
    description:
      'Design and implement an LRU (Least Recently Used) cache with O(1) get and put operations. Explain the data structures used and why.',
    difficulty: Difficulty.HARD,
    category: Category.DSA,
    targetRole: TargetRole.GENERAL,
    tags: ['lru-cache', 'hash-map', 'linked-list', 'design'],
    hints: [
      'What combination of data structures gives O(1) for both operations?',
      'Think about a doubly linked list + hash map',
    ],
  },

  // ─── SYSTEM DESIGN ─────────────────────────────────────
  {
    title: 'Design a URL shortener like bit.ly',
    description:
      'Design a scalable URL shortening service. Cover the API design, database schema, hashing strategy, caching layer, and how to handle 100M+ URLs. Discuss trade-offs.',
    difficulty: Difficulty.HARD,
    category: Category.SYSTEM_DESIGN,
    targetRole: TargetRole.FULLSTACK_DEV,
    tags: ['system-design', 'scalability', 'caching', 'databases'],
    hints: [
      'How do you generate unique short codes?',
      'What are the read/write patterns?',
    ],
  },
  {
    title: 'Design a notification system',
    description:
      'Design a real-time notification system that supports push notifications, emails, and in-app notifications at scale. Discuss queuing, fan-out strategies, and delivery guarantees.',
    difficulty: Difficulty.HARD,
    category: Category.SYSTEM_DESIGN,
    targetRole: TargetRole.BACKEND_DEV,
    tags: ['system-design', 'notifications', 'queues', 'scalability'],
    hints: [
      'What is fan-out and when is it a problem?',
      'How do you handle notification preferences per user?',
    ],
  },

  // ─── DATABASE ──────────────────────────────────────────
  {
    title: 'Explain database indexing and when to use it',
    description:
      'Describe how database indexes work (B-tree, hash indexes), the trade-offs between read performance and write overhead, and strategies for choosing which columns to index.',
    difficulty: Difficulty.MEDIUM,
    category: Category.DATABASE,
    targetRole: TargetRole.BACKEND_DEV,
    tags: ['database', 'indexing', 'postgresql', 'performance'],
    hints: [
      'What problem does an index solve?',
      'When can an index hurt performance?',
    ],
  },
  {
    title: 'SQL vs NoSQL — when to use which?',
    description:
      'Compare SQL and NoSQL databases. Explain ACID vs BASE properties, CAP theorem, and give real-world scenarios where each type excels. Discuss hybrid approaches.',
    difficulty: Difficulty.MEDIUM,
    category: Category.DATABASE,
    targetRole: TargetRole.GENERAL,
    tags: ['sql', 'nosql', 'databases', 'architecture'],
    hints: [
      'What does ACID stand for?',
      'When does eventual consistency make sense?',
    ],
  },

  // ─── BEHAVIORAL ────────────────────────────────────────
  {
    title: 'Describe a time you resolved a technical conflict in a team',
    description:
      'Using the STAR method, describe a situation where you had a technical disagreement with a colleague. How did you approach it, what was the outcome, and what did you learn?',
    difficulty: Difficulty.MEDIUM,
    category: Category.BEHAVIORAL,
    targetRole: TargetRole.GENERAL,
    tags: ['behavioral', 'teamwork', 'conflict-resolution', 'soft-skills'],
    hints: [
      'Structure your answer: Situation, Task, Action, Result',
      'Focus on how you listened and found common ground',
    ],
  },
  {
    title: 'How do you handle tight deadlines and pressure?',
    description:
      'Describe your approach to working under pressure and meeting tight deadlines. Give a specific example, explain your prioritization strategy, and how you communicated with stakeholders.',
    difficulty: Difficulty.EASY,
    category: Category.BEHAVIORAL,
    targetRole: TargetRole.GENERAL,
    tags: ['behavioral', 'time-management', 'pressure', 'soft-skills'],
    hints: [
      'Be specific with a real example',
      'Show how you break down tasks and communicate proactively',
    ],
  },
]

async function main() {
  console.log('🌱 Starting seed...')

  // Clear existing questions
  await prisma.question.deleteMany()
  console.log('🗑️  Cleared existing questions')

  // Seed questions
  const created = await prisma.question.createMany({
    data: questions,
    skipDuplicates: true,
  })

  console.log(`✅ Seeded ${created.count} questions`)
  console.log('🎉 Seed complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
