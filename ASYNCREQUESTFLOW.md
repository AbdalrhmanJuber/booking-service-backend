
                        ┌─────────────────────────────┐
                        │     Incoming HTTP Request   │
                        │   (e.g., GET /api/users)    │
                        └──────────────┬──────────────┘
                                       │
                                       ▼
                             ┌───────────────────────┐
                             │ Express Route Layer   │
                             │ router.get("/", ...)  │
                             └────────────┬──────────┘
                                          │
                                          ▼
                             ┌──────────────────────────────────┐
                             │ asyncHandler(fn) wrapper         │
                             │                                  │
                             │  → Executes:                     │
                             │    Promise.resolve(fn(req, res, next))│
                             │      .catch(next)                │
                             └────────────┬─────────────────────┘
                                          │
                                          │
                               ┌──────────┴──────────┐
                               │                     │
                               ▼                     ▼
                         ✅ Promise resolves     ❌ Promise rejects (error)
                         (normal success)         (throw / rejection)
                               │                     │
                               ▼                     ▼
                          ┌───────────────┐     ┌──────────────────────┐
                          │ res.json(...) │     │ next(error)          │
                          │ → sends data   │     │ → triggers Express  │
                          └──────┬─────────┘     │   global error flow │
                                 │               └──────────┬──────────┘
                                 ▼                          ▼
                                             ┌────────────────────────────┐
                                             │  Global Error Handler      │
                                             │  app.use(errorHandler)     │
                                             │                            │
                                             │  - Logs error details      │
                                             │  - Sends proper status code│
                                             │  - Formats response JSON   │
                                             └────────────┬───────────────┘
                                                          │
                                                          ▼
                                             ┌──────────────────────────┐
                                             │   Response sent to user  │
                                             │ (e.g., 400, 404, 500...) │
                                             └──────────────────────────┘
