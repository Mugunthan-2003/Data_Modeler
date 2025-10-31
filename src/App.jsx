// src/App.jsx
import { useCallback, useMemo, useState } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
} from "reactflow";
import dagre from "dagre";
import TableNode from "./TableNode";
import { modelToFlow } from "./data";
import "reactflow/dist/style.css";
import "./index.css";

const nodeTypes = { tableNode: TableNode };

const getLayoutedElements = (nodes, edges, direction = "LR") => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 120,
    ranksep: 200,
  });

  nodes.forEach((n) => {
    const fieldRows = n.data.fields?.length ?? 0;
    const height = 60 + fieldRows * 22;
    dagreGraph.setNode(n.id, { width: 300, height });
  });
  edges.forEach((e) => dagreGraph.setEdge(e.source, e.target));

  dagre.layout(dagreGraph);

  return {
    nodes: nodes.map((n) => {
      const pos = dagreGraph.node(n.id);
      return {
        ...n,
        position: { x: pos.x - pos.width / 2, y: pos.y - pos.height / 2 },
      };
    }),
    edges,
  };
};

export default function App() {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => modelToFlow(), []);
  const [nodes, setNodes] = useNodesState(initialNodes);
  const [edges, setEdges] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params) => {
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            style: { stroke: "#555" },
          },
          eds
        )
      );
    },
    [setEdges]
  );

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  const onLayout = useCallback(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges, "LR");
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [nodes, edges, setNodes, setEdges]);

  const [newTableName, setNewTableName] = useState("");
  const addTable = () => {
    if (!newTableName.trim()) return;
    const id = newTableName.trim();
    const newNode = {
      id,
      type: "tableNode",
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: {
        label: id,
        alias: "",
        fields: [{ name: "id", ref: [] }],
        isViewOrCTE: false,
      },
    };
    setNodes((nds) => nds.concat(newNode));
    setNewTableName("");
  };

  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          padding: "8px",
          background: "#f5f5f5",
          borderBottom: "1px solid #ddd",
          display: "flex",
          gap: 8,
        }}
      >
        <button onClick={onLayout} style={{ padding: "4px 12px" }}>
          Auto-Arrange
        </button>

        <input
          placeholder="New table name"
          value={newTableName}
          onChange={(e) => setNewTableName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTable()}
          style={{ padding: "4px" }}
        />
        <button onClick={addTable}>Add Table</button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        connectionLineType="smoothstep"
      >
        <MiniMap />
        <Controls />
        <Background gap={16} />
      </ReactFlow>
    </div>
  );
}
