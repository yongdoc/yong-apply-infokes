import { Elysia } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { NodeController } from '@/controllers/node';
import {
  CreateNodeSchema,
  UpdateNodeSchema,
  DeleteNodeSchema,
  GetChildrenSchema,
} from '@/schemas/node';

export const nodeRoutes = new Elysia({ prefix: "/api/nodes" })
  .use(jwt({ name: 'jwt', secret: process.env.JWT_SECRET || 'fallback' }))
  .derive(async ({ headers, jwt, set }) => {
    const auth = headers['authorization'];
    if (!auth?.startsWith('Bearer ')) { set.status = 401; return { error: 'Unauthorized.' }; }
    
    const user = await jwt.verify(auth.split(' ')[1]);
    if (!user) { set.status = 401; return { error: 'Session expired.' }; }
    
    return { user };
  })
  .get("/", NodeController.getAll)
  .get("/folder", NodeController.getAllFolder)
  .get("/:id/children", NodeController.getChildren, GetChildrenSchema)
  .post("/", NodeController.create, CreateNodeSchema)
  .put("/:id", NodeController.update, UpdateNodeSchema)
  .delete("/:id", NodeController.delete, DeleteNodeSchema);
