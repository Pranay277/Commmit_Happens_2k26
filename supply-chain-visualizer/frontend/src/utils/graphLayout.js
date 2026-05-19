import dagre from "dagre";

const nodeWidth = 130;
const nodeHeight = 50;

export function layoutNodes(nodes, edges) {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "TB", nodesep: 80, ranksep: 150 });

  for (const n of nodes) {
    if (n && n.id != null) {
      g.setNode(n.id, { width: nodeWidth, height: nodeHeight });
    }
  }
  for (const e of edges) {
    if (e && e.source != null && e.target != null) {
      g.setEdge(e.source, e.target);
    }
  }

  dagre.layout(g);

  return nodes
    .filter((n) => n && n.id != null)
    .map((n) => {
      const pos = g.node(n.id);
      if (!pos) {
        return {
          ...n,
          position: { x: 0, y: 0 },
        };
      }
      return {
        ...n,
        position: {
          x: pos.x - nodeWidth / 2,
          y: pos.y - nodeHeight / 2,
        },
      };
    });
}
