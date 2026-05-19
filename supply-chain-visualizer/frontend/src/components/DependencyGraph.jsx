import { useState } from "react";
import { ReactFlow, Background, Controls, Handle, Position } from "reactflow";
import "reactflow/dist/style.css";

import { severityColors } from "../constants/severityColors";
import sampleGraph from "../mock/sampleGraph.json";

function PackageNode({ data }) {
  const color = severityColors[data.severity] || severityColors.none;
  return (
    <div
      style={{
        border: `2px solid ${color}`,
        borderRadius: 8,
        padding: "10px 16px",
        background: "#fff",
        minWidth: 140,
        textAlign: "center",
      }}
    >
      <Handle type="target" position={Position.Top} />
      <div style={{ fontWeight: 600, fontSize: 14 }}>{data.label}</div>
      <div style={{ fontSize: 12, color: "#64748b" }}>{data.version}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

const nodeTypes = { packageNode: PackageNode };

export default function DependencyGraph() {
  const [nodes] = useState(sampleGraph.nodes);
  const [edges] = useState(sampleGraph.edges);

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
