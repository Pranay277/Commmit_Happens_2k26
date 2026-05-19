import { useCallback, useEffect, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  useReactFlow,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";

import { severityColors } from "../constants/severityColors";
import { layoutNodes } from "../utils/graphLayout";
import NodeInspector from "./NodeInspector";

/* ─── Severity legend data — visual only ─── */
const severityLabels = [
  { label: "Critical", key: "critical" },
  { label: "High",     key: "high"     },
  { label: "Medium",   key: "medium"   },
  { label: "Low",      key: "low"      },
  { label: "None",     key: "none"     },
];

/* ═══════════════════════════════════════════════════════════════════════════
   CUSTOM PACKAGE NODE — visual card replacing default React Flow box
   Logic: Handle positions and data reading are unchanged
   ═══════════════════════════════════════════════════════════════════════════ */
function PackageNode({ data, selected }) {
  const borderColor = severityColors[data.severity] || severityColors.none;

  return (
    <div
      style={{
        background: "var(--node-bg)",
        border: `2px solid ${borderColor}`,
        borderRadius: 12,
        padding: "10px 16px",
        minWidth: 140,
        maxWidth: 200,
        textAlign: "center",
        boxShadow: selected
          ? `0 0 0 3px ${borderColor}40, var(--shadow-md)`
          : "var(--shadow-card)",
        transition: "box-shadow 0.2s",
        cursor: "pointer",
        fontFamily: "var(--font-sans)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 4px 16px ${borderColor}55, var(--shadow-md)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = selected
          ? `0 0 0 3px ${borderColor}40, var(--shadow-md)`
          : "var(--shadow-card)";
      }}
    >
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <div
        style={{
          fontWeight: 600,
          fontSize: 12,
          color: "var(--text-primary)",
          lineHeight: 1.3,
          wordBreak: "break-word",
        }}
      >
        {data.label}
      </div>
      <div
        style={{
          fontSize: 10,
          color: "var(--text-muted)",
          fontFamily: "ui-monospace, monospace",
          marginTop: 3,
        }}
      >
        {data.version}
      </div>
      {data.severity && data.severity !== "none" && (
        <div
          style={{
            display: "inline-block",
            marginTop: 6,
            padding: "1px 7px",
            borderRadius: 99,
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: "#fff",
            background: borderColor,
          }}
        >
          {data.severity}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </div>
  );
}

const nodeTypes = { packageNode: PackageNode };

/* ═══════════════════════════════════════════════════════════════════════════
   INNER GRAPH — needs ReactFlowProvider to use useReactFlow
   All data handling, layout, state logic is unchanged
   ═══════════════════════════════════════════════════════════════════════════ */
function GraphInner({ data, onInsightGenerated }) {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const { fitView } = useReactFlow();

  /* unchanged data/layout effect */
  useEffect(() => {
    if (data) {
      const positioned = layoutNodes(data.nodes || [], data.edges || []);
      setNodes(positioned);
      setEdges(data.edges || []);
      /* fitView is purely visual — called after layout is computed */
      setTimeout(() => fitView({ padding: 0.2, duration: 600 }), 50);
    }
  }, [data, fitView]);

  /* unchanged node click handler */
  const onNodeClick = useCallback((_event, node) => {
    setSelectedNode(node);
  }, []);

  /* unchanged insight propagation */
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

  /* visual edge style */
  const styledEdges = edges.map((e) => ({
    ...e,
    style: { stroke: "var(--text-muted)", strokeWidth: 1.5 },
  }));

  return (
    <div style={{ width: "100%", height: "calc(100vh - 180px)", minHeight: 500, position: "relative" }}>
      <ReactFlow
        nodes={nodes}
        edges={styledEdges}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background
          color="var(--border)"
          gap={24}
          size={1}
          style={{ opacity: 0.5 }}
        />
        <Controls
          style={{
            bottom: 16,
            left: 16,
            top: "unset",
          }}
        />
      </ReactFlow>

      {/* ── Severity legend — top-right, glassmorphic card ── */}
      <div
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          zIndex: 10,
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: "12px 16px",
          boxShadow: "var(--shadow-card)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          minWidth: 130,
        }}
      >
        <p
          style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            marginBottom: 8,
          }}
        >
          Severity
        </p>
        {severityLabels.map((s) => (
          <div
            key={s.key}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12,
              color: "var(--text-secondary)",
              marginBottom: 5,
              fontFamily: "var(--font-sans)",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: severityColors[s.key],
                display: "inline-block",
                flexShrink: 0,
              }}
            />
            {s.label}
          </div>
        ))}
      </div>

      {/* ── Node inspector side-sheet ── */}
      <NodeInspector
        nodeData={selectedNode ? selectedNode.data : null}
        nodeId={selectedNode ? selectedNode.id : null}
        onClose={() => setSelectedNode(null)}
        onInsightGenerated={handleInsightGenerated}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   EXPORTED COMPONENT — wraps GraphInner in ReactFlowProvider
   ═══════════════════════════════════════════════════════════════════════════ */
export default function DependencyGraph({ data, onInsightGenerated }) {
  return (
    <ReactFlowProvider>
      <GraphInner data={data} onInsightGenerated={onInsightGenerated} />
    </ReactFlowProvider>
  );
}
