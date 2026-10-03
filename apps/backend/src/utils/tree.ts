export interface Node {
  id: string;
  name: string;
  type: "folder" | "file";
  parentId: string | null;
  fileSizeBytes?: number;
  mimeType?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
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
    if (node.parentId) {
      const parent = nodeMap.get(node.parentId);
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
