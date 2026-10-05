import { type Context } from "elysia";
import { sql } from "@/config/db";
import { buildTree, type Node } from "@/utils/tree";
import { NotFoundError, BadRequestError, UnauthorizedError } from "@/utils/error";

export const NodeController = {
  // GET ALL
  async getAll(ctx: Context) {
    const { user } = ctx as any;
    const rawNodes = await sql<
      Node[]
    >`SELECT * FROM infokes.nodes WHERE owner_id = ${user.id} ORDER BY type DESC, name ASC`;

    return buildTree(rawNodes);
  },

  // GET ALL FOLDER
  async getAllFolder(ctx: Context) {
    const { user } = ctx as any;
    const rawNodes = await sql<
      Node[]
    >`SELECT * FROM infokes.nodes WHERE type = 'folder' AND owner_id = ${user.id} ORDER BY name ASC`;

    return buildTree(rawNodes);
  },

  // GET CHILDREN
  async getChildren(ctx: Context<{ params: { id: string } }>) {
    const { params } = ctx;
    const { id } = params;
    const { user } = ctx as any;

    const [parent] = await sql`SELECT type FROM infokes.nodes WHERE id = ${id} AND owner_id = ${user.id}`;
    if (!parent) throw new NotFoundError('Folder not found or access denied.');
    if (parent.type !== "folder") throw new BadRequestError('Target node is a file, not a folder.');

    return await sql<
      Node[]
    >`SELECT * FROM infokes.nodes WHERE parent_id = ${id} AND owner_id = ${user.id} ORDER BY type DESC, name ASC`;
  },

  // CREATE NODE
  async create(ctx: Context<{ body: { name: string; type: 'folder' | 'file'; parent_id?: string | null; file_size_bytes?: number; mime_type?: string | null } }>) {
    const { body } = ctx;
    const { user } = ctx as any;
    const { name, type, parent_id, file_size_bytes, mime_type } = body;

    if (parent_id) {
      const [parent] =
        await sql`SELECT type FROM infokes.nodes WHERE id = ${parent_id} AND owner_id = ${user.id}`;
      if (!parent) throw new NotFoundError('Specified parent folder directory does not exist.');
      if (parent.type !== "folder") throw new BadRequestError('Target parent placement node must be a folder type');
    }

    const [newNode] = await sql`
      INSERT INTO infokes.nodes (name, type, parent_id, owner_id, file_size_bytes, mime_type)
      VALUES (${name}, ${type}, ${parent_id || null}, ${user.id}, ${file_size_bytes || 0}, ${mime_type || null})
      RETURNING *
    `;

    ctx.set.status = 201;
    return newNode;
  },

  async update(ctx: Context<{ params: { id: string }; body: any }>) {
    const { params, body } = ctx;
    const { id } = params;
    const { name, parent_id, file_size_bytes, mime_type } = body;
    const { user } = ctx as any;

    if (parent_id === id) throw new BadRequestError('A structural directory node cannot be bound to itself as its own parent.');

    const [currentNode] = await sql`SELECT id FROM infokes.nodes WHERE id = ${id} AND owner_id = ${user.id}`;
    if (!currentNode) throw new NotFoundError('Target node not found or access denied.');

    if (parent_id) {
      const [parentFolder] = await sql`
        SELECT type FROM infokes.nodes 
        WHERE id = ${parent_id} AND owner_id = ${user.id}
      `;
      if (!parentFolder) throw new NotFoundError('Specified destination parent folder does not exist or access denied.');
      if (parentFolder.type !== 'folder') throw new BadRequestError('Target destination must be a folder type.');
    }
    
    const updatePayload: Record<string, any> = {
      updated_at: new Date(),
    };

    if (name !== undefined) updatePayload.name = name;
    if (parent_id !== undefined) updatePayload.parent_id = parent_id;
    if (file_size_bytes !== undefined) updatePayload.file_size_bytes = file_size_bytes;
    if (mime_type !== undefined) updatePayload.mime_type = mime_type;

    if (Object.keys(updatePayload).length === 1) {
      return currentNode;
    }

    const [updatedNode] = await sql`
      UPDATE infokes.nodes
      SET ${sql(updatePayload)}
      WHERE id = ${id}
      RETURNING *
    `;

    ctx.set.status = 201;
    return updatedNode;
  },

  async delete(ctx: Context<{ params: { id: string } }>) {
    const { params } = ctx;
    const { user } = ctx as any;
    const result =
      await sql`DELETE FROM infokes.nodes WHERE id = ${params.id} AND owner_id = ${user.id} RETURNING id`;

    if (result.length === 0) throw new NotFoundError('Node not found, already deleted, or access denied.');

    return {
      success: true,
      message: "Node and its descendants successfully removed.",
    };
  },
};
