import { t } from "elysia";

export const GetChildrenSchema = {
  params: t.Object({
    id: t.String({ format: "uuid" }),
  }),
};

export const CreateNodeSchema = {
  body: t.Object({
    name: t.String({ minLength: 1, maxLength: 255 }),
    type: t.Union([t.Literal("folder"), t.Literal("file")]),
    parent_id: t.Optional(t.String({ format: "uuid" })),
    file_size_bytes: t.Optional(t.Numeric({ minimum: 0 })),
    mime_type: t.Optional(t.String({ maxLength: 100 })),
  }),
};

export const UpdateNodeSchema = {
  params: t.Object({
    id: t.String({ format: "uuid" }),
  }),
  body: t.Object({
    name: t.Optional(t.String({ minLength: 1, maxLength: 255 })),
    parent_id: t.Optional(t.Nullable(t.String({ format: "uuid" }))),
    file_size_bytes: t.Optional(t.Numeric({ minimum: 0 })),
    mime_type: t.Optional(t.Nullable(t.String({ maxLength: 100 }))),
  }),
};

export const DeleteNodeSchema = {
  params: t.Object({
    id: t.String({ format: "uuid" }),
  }),
};
