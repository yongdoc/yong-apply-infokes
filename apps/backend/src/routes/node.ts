import { Elysia } from 'elysia';
import { NodeController } from '@/controllers/node';
import { CreateNodeSchema, UpdateNodeSchema, DeleteNodeSchema, GetChildrenSchema } from '@/schemas/node';

export const nodeRoutes = new Elysia({ prefix: '/api/nodes' })
    .get('/', NodeController.getAll)
    .get('/folder', NodeController.getAllFolder)
    .get('/:id/children', NodeController.getChildren, GetChildrenSchema)
    .post('/', NodeController.create, CreateNodeSchema)
    .put('/:id', NodeController.update, UpdateNodeSchema)
    .delete('/:id', NodeController.delete, DeleteNodeSchema);
