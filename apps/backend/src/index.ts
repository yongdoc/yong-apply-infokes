import { app } from './app';

export type App = typeof app;

if (import.meta.main) {
  app.listen(process.env.PORT || 3000);
  console.log(`Elysia database tree API listening at http://localhost:${app.server?.port}`);
}
