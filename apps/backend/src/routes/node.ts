import { Elysia } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { NodeController } from '@/controllers/node';
import { UnauthorizedError } from '@/utils/error';
import {
  CreateNodeSchema,
  UpdateNodeSchema,
  DeleteNodeSchema,
  GetChildrenSchema,
  SearchNodesSchema,
} from '@/schemas/node';

export const nodeRoutes = new Elysia({ prefix: "/api/nodes" })
  .use(jwt({ name: 'jwt', secret: process.env.JWT_SECRET || 'super_secret_infokes_key_2026' }))
  .derive(async ({ headers, jwt }) => {
    const auth = headers['authorization'];
    if (!auth?.startsWith('Bearer ')) {
      throw new UnauthorizedError('Unauthorized.');
    }

    try {
      const user = await jwt.verify(auth.split(' ')[1]);
      if (!user) {
        throw new UnauthorizedError('Session expired.');
      }
      return { user };
    } catch {
      throw new UnauthorizedError('Invalid token.');
    }
  })
  .get("/", NodeController.getAll)
  .get("/folder", NodeController.getAllFolder)
  .get("/search", NodeController.search, SearchNodesSchema)
  .get("/:id/children", NodeController.getChildren, GetChildrenSchema)
  .post("/", NodeController.create, CreateNodeSchema)
  .put("/:id", NodeController.update, UpdateNodeSchema)
  .delete("/:id", NodeController.delete, DeleteNodeSchema);
