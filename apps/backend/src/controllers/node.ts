import { type Context } from "elysia";
import { sql } from "@/config/db";
import { buildTree, type Node } from "@/utils/tree";

export const NodeController = {
  // GET ALL
  async getAll() {
    const rawNodes = await sql<
      Node[]
    >`SELECT * FROM infokes.nodes ORDER BY type DESC, name ASC`;

    return buildTree(rawNodes);
  },

  // GET ALL FOLDER
  async getAllFolder() {
    const rawNodes = await sql<
      Node[]
    >`SELECT * FROM infokes.nodes WHERE type = 'folder' ORDER BY name ASC`;

    return buildTree(rawNodes);
  },

  // GET CHILDREN
  async getChildren({ params, set }: Context<{ params: { id: string } }>) {
    const { id } = params;

    const [parent] = await sql`SELECT type FROM infokes.nodes WHERE id = ${id}`;
    if (!parent) {
      set.status = 404;
      return { message: "Folder not found." };
    }
    if (parent.type !== "folder") {
      set.status = 400;
      return { message: "Target node must be a folder." };
    }

    const childrenNodes = await sql<
      Node[]
    >`SELECT * FROM infokes.nodes WHERE parent_id = ${id} ORDER BY type DESC, name ASC`;

    return childrenNodes;
  },

  // CREATE NODE
  async create({ body, set }: Context<{ body: any }>) {
    const { name, type, parentId, fileSizeBytes, mimeType } = body;

    console.log(parentId)
    if (parentId) {
      const [parent] =
        await sql`SELECT type FROM infokes.nodes WHERE id = ${parentId}`;
      if (!parent) {
        set.status = 404;
        return { message: "Folder not found." };
      }
      if (parent.type !== "folder") {
        set.status = 400;
        return { message: "Target node is not a folder." };
      }
    }

    const [newNode] = await sql`
      INSERT INTO infokes.nodes (name, type, parent_id, file_size_bytes, mime_type)
      VALUES (${name}, ${type}, ${parentId || null}, ${fileSizeBytes || 0}, ${mimeType || null})
      RETURNING *
    `;

    set.status = 201;
    return newNode;
  },

  async update({ params, body, set }: Context<{ params: { id: string }; body: any }>) {
    const { id } = params;
    const { name, parentId, fileSizeBytes, mimeType } = body;

    const [currentNode] =
      await sql`SELECT * FROM infokes.nodes WHERE id = ${id}`;
    if (!currentNode) {
      set.status = 404;
      return { message: "Node not found." };
    }

    if (parentId === id) {
      set.status = 400;
      return { message: "A node cannot be its own parent." };
    }

    const updatePayload: Record<string, any> = {
      updated_at: new Date(),
    };

    if (name !== undefined) updatePayload.name = name;
    if (parentId !== undefined) updatePayload.parent_id = parentId;
    if (fileSizeBytes !== undefined)
      updatePayload.file_size_bytes = fileSizeBytes;
    if (mimeType !== undefined) updatePayload.mime_type = mimeType;

    if (Object.keys(updatePayload).length === 1) {
      console.log("No update");
      return currentNode;
    }

    const [updatedNode] = await sql`
      UPDATE infokes.nodes
      SET ${sql(updatePayload)}
      WHERE id = ${id}
      RETURNING *
    `;

    if (!updatedNode) {
      set.status = 404;
      return { message: "Node not found." };
    }
    return updatedNode;
  },

  async delete({ params, set }: Context<{ params: { id: string } }>) {
    const result =
      await sql`DELETE FROM infokes.nodes WHERE id = ${params.id} RETURNING id`;

    if (result.length === 0) {
      set.status = 404;
      return { message: "Node not found." };
    }

    return {
      success: true,
      message: "Node and its descendants successfully removed.",
    };
  },
};
