export interface Node {
  id: string;
  name: string;
  type: "folder" | "file";
  parent_id: string | null;
  file_size_bytes?: number;
  mime_type?: string | null;
  created_at?: Date;
  updated_at?: Date;
  children?: Node[];
}

export function buildTree(nodes: Node[]): Node[] {
  // Map by ID for quick lookups
  const nodeMap = new Map<string, Node>();
  nodes.forEach((node: any) => {
    nodeMap.set(node.id, { ...node, children: [] });
  });

  const rootNodes: any[] = [];

  // Build the tree structurally
  nodeMap.forEach((node) => {
    if (node.parent_id) {
      const parent = nodeMap.get(node.parent_id);
      if (parent) {
        parent.children!.push(node);
      } else {
        rootNodes.push(node);
      }
    } else {
      rootNodes.push(node);
    }
  });

  return rootNodes;
}
