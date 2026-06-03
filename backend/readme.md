src/
 ├── app.ts                # Express app setup (middleware, routes, error handling)
 ├── server.ts             # Server bootstrap (starts Express)
 │
 ├── config/               # Configuration files (env, db, mail, queues)
 │   ├── env.ts
 │   ├── prisma.ts
 │   ├── mailer.ts
 │   └── bull.ts
 │
 ├── modules/              # Feature-based structure (DDD-style)
 │   ├── user/
 │   │   ├── user.controller.ts
 │   │   ├── user.service.ts
 │   │   ├── user.repository.ts
 │   │   ├── user.routes.ts
 │   │   └── user.types.ts
 │   │
 │   ├── auth/
 │   │   ├── auth.controller.ts
 │   │   ├── auth.service.ts
 │   │   ├── auth.routes.ts
 │   │   └── auth.types.ts
 │   │
 │   └── email/
 │       ├── email.service.ts
 │       ├── email.queue.ts
 │       └── email.worker.ts
 │
 ├── jobs/                 # Queue jobs (Bull workers)
 │   └── emailJob.ts
 │
 ├── middlewares/          # Custom Express middlewares
 │   ├── auth.middleware.ts
 │   └── error.middleware.ts
 │
 ├── utils/                # Utility functions (helpers, formatters)
 │   ├── logger.ts
 │   └── response.ts
 │
 ├── types/                # Global TypeScript types
 │   └── express.d.ts       # Extend Express Request types
 │
 ├── prisma/               # Prisma schema + migrations
 │   └── schema.prisma
 │
 └── tests/                # Unit & integration tests
     └── user.test.ts
