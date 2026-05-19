import { useCallback, useEffect, useState } from "react";
import { ReactFlow, Background, Controls, Handle, Position } from "reactflow";
import "reactflow/dist/style.css";

import { severityColors } from "../constants/severityColors";
import { layoutNodes } from "../utils/graphLayout";
import NodeInspector from "./NodeInspector";

const severityLabels = [
  { label: "Critical", key: "critical" },
  { label: "High", key: "high" },
  { label: "Medium", key: "medium" },
  { label: "Low", key: "low" },
  { label: "None", key: "none" },
];

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
        transition: "transform 0.2s, box-shadow 0.2s",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.05)";
        e.currentTarget.style.boxShadow = `0 4px 14px ${color}66`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "none";
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

export default function DependencyGraph({ data, onInsightGenerated }) {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    if (data) {
      const positioned = layoutNodes(data.nodes || [], data.edges || []);
      setNodes(positioned);
      setEdges(data.edges || []);
    }
  }, [data]);

  const onNodeClick = useCallback((_event, node) => {
    setSelectedNode(node);
  }, []);

  const handleInsightGenerated = useCallback(
    (nodeId, insight) => {
      setNodes((prev) =>
        prev.map((n) =>
          n.id === nodeId ? { ...n, data: { ...n.data, aiInsight: insight } } : n
        )
      );
      if (onInsightGenerated) onInsightGenerated(nodeId, insight);
    },
    [onInsightGenerated]
  );

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

      <div
        style={{
          position: "absolute",
          bottom: 24,
          left: 24,
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: 8,
          padding: "10px 14px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          zIndex: 10,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#64748b",
            textTransform: "uppercase",
            letterSpacing: 1,
            marginBottom: 6,
          }}
        >
          Severity
        </div>
        {severityLabels.map((s) => (
          <div
            key={s.key}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12,
              color: "#334155",
              marginBottom: 3,
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: severityColors[s.key],
                display: "inline-block",
              }}
            />
            {s.label}
          </div>
        ))}
      </div>

      <NodeInspector
        nodeData={selectedNode ? selectedNode.data : null}
        nodeId={selectedNode ? selectedNode.id : null}
        onClose={() => setSelectedNode(null)}
        onInsightGenerated={handleInsightGenerated}
      />
    </div>
  );
}
