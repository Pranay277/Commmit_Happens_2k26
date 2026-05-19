import { useCallback, useEffect, useState } from "react";
import { ReactFlow, Background, Controls, Handle, Position } from "reactflow";
import "reactflow/dist/style.css";

import { severityColors } from "../constants/severityColors";
import NodeInspector from "./NodeInspector";

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

export default function DependencyGraph({ data }) {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    if (data) {
      setNodes(data.nodes || []);
      setEdges(data.edges || []);
    }
  }, [data]);

  const onNodeClick = useCallback((_event, node) => {
    setSelectedNode(node.data);
  }, []);

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
      <NodeInspector
        nodeData={selectedNode}
        onClose={() => setSelectedNode(null)}
      />
    </div>
  );
}
