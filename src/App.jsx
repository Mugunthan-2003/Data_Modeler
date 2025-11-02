import { useCallback, useEffect, useState } from "react";
import ReactFlow, { MiniMap, Controls, Background } from "reactflow";
import TableNode from "./components/TableNode/TableNode";
import EdgeConfigDialog from "./components/EdgeConfigDialog";
import FlowHeader from "./components/FlowHeader";
import EdgeContextMenu from "./components/EdgeContextMenu";
import FieldDrawer from "./components/FieldDrawer";
import { useFlowState } from "./hooks/useFlowState";
import { useNodeHandlers } from "./hooks/useNodeHandlers";
import { useEdgeHandlers } from "./hooks/useEdgeHandlers";
import { useEdgeFiltering } from "./hooks/useEdgeFiltering";
import { useFieldHighlighting } from "./hooks/useFieldHighlighting";
import { useNodeDecoration } from "./hooks/useNodeDecoration";
import { getLayoutedElements } from "./utils/layout";
import "reactflow/dist/style.css";
import "./index.css";

const nodeTypes = { tableNode: TableNode };

export default function App() {
    // Flow state management
    const { nodes, edges, setNodes, setEdges, onNodesChange, onEdgesChange } =
        useFlowState();

    // UI state
    const [editingNode, setEditingNode] = useState(null);
    const [editingLabels, setEditingLabels] = useState({});
    const [editingAliases, setEditingAliases] = useState({});
    const [edgeConfigDialog, setEdgeConfigDialog] = useState(null);
    const [edgeContextMenu, setEdgeContextMenu] = useState(null);

    // Filter toggles
    const [showNormalRefs, setShowNormalRefs] = useState(true);
    const [showCalcRefs, setShowCalcRefs] = useState(true);
    const [showOnlyHighlighted, setShowOnlyHighlighted] = useState(false);

    // Field highlighting
    const {
        highlightedEdges,
        selectedField,
        handleFieldClick,
        setSelectedField,
        setHighlightedEdges,
        clearHighlighting,
    } = useFieldHighlighting(edges);

    // Node handlers
    const {
        handleAddField,
        handleUpdateNodeLabel,
        handleUpdateNodeAlias,
        handleUpdateFieldName,
        handleDeleteField,
        handleUpdateFieldCalculation,
        handleAddNewTable,
    } = useNodeHandlers(
        nodes,
        edges,
        setNodes,
        setEdges,
        setEditingNode,
        setEditingLabels,
        setEditingAliases
    );

    // Edge handlers
    const { handleEdgeConfigConfirm, handleDeleteEdge, handleDeleteFieldRef } =
        useEdgeHandlers(nodes, edges, setNodes, setEdges);

    // Node decoration handlers
    const handleLabelChange = useCallback((nodeId, value) => {
        setEditingLabels((prev) => ({ ...prev, [nodeId]: value }));
    }, []);

    const handleAliasChange = useCallback((nodeId, value) => {
        setEditingAliases((prev) => ({ ...prev, [nodeId]: value }));
    }, []);

    const handleEditClick = useCallback((nodeId, nodeData) => {
        setEditingNode((prev) => {
            if (prev === nodeId) {
                // Exiting edit mode
                setEditingLabels((labels) => {
                    const updated = { ...labels };
                    delete updated[nodeId];
                    return updated;
                });
                setEditingAliases((aliases) => {
                    const updated = { ...aliases };
                    delete updated[nodeId];
                    return updated;
                });
                return null;
            }
            // Entering edit mode
            setEditingLabels((prev) => ({
                ...prev,
                [nodeId]: nodeData.label,
            }));
            setEditingAliases((prev) => ({
                ...prev,
                [nodeId]: nodeData.alias ?? "",
            }));
            return nodeId;
        });
    }, []);

    // Node decoration
    const decoratedNodes = useNodeDecoration(
        nodes,
        edges,
        selectedField,
        editingNode,
        editingLabels,
        editingAliases,
        handleFieldClick,
        handleAddField,
        handleUpdateNodeLabel,
        handleUpdateNodeAlias,
        handleUpdateFieldName,
        handleDeleteField,
        handleUpdateFieldCalculation,
        handleDeleteFieldRef,
        handleLabelChange,
        handleAliasChange,
        handleEditClick
    );

    // Edge filtering
    const decoratedEdges = useEdgeFiltering(
        edges,
        highlightedEdges,
        showNormalRefs,
        showCalcRefs,
        showOnlyHighlighted
    );

    // Layout handler
    const onLayout = useCallback(() => {
        const { nodes: layoutedNodes, edges: layoutedEdges } =
            getLayoutedElements(nodes, edges, "LR");
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
    }, [nodes, edges, setNodes, setEdges]);

    // Auto-arrange on mount
    useEffect(() => {
        onLayout();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Edge connection handler
    const onConnect = useCallback((params) => {
        setEdgeConfigDialog({
            source: params.source,
            target: params.target,
            sourceHandle: params.sourceHandle,
            targetHandle: params.targetHandle,
        });
    }, []);

    // Edge context menu handler
    const onEdgeContextMenu = useCallback((event, edge) => {
        event.preventDefault();
        setEdgeContextMenu({
            edge,
            x: event.clientX,
            y: event.clientY,
        });
    }, []);

    // Edge config confirm handler wrapper
    const handleEdgeConfigConfirmWrapper = useCallback(
        (edgeType, calcExpr) => {
            const result = handleEdgeConfigConfirm(
                edgeType,
                calcExpr,
                !!edgeConfigDialog?.existingEdgeId,
                edgeConfigDialog?.existingEdgeId,
                edgeConfigDialog,
                edgeContextMenu
            );
            if (result?.shouldCloseDialog) {
                setEdgeConfigDialog(null);
            }
            if (result?.shouldCloseMenu) {
                setEdgeContextMenu(null);
            }
        },
        [handleEdgeConfigConfirm, edgeConfigDialog, edgeContextMenu]
    );

    // Edit edge handler
    const handleEditEdge = useCallback(
        (edge) => {
            const targetFieldName = edge.targetHandle.replace(
                `${edge.target}-`,
                ""
            );
            const targetNode = nodes.find((n) => n.id === edge.target);
            const targetField = targetNode?.data.fields.find(
                (f) => f.name === targetFieldName
            );
            const calculationExpression =
                targetField?.calculation?.expression || "";

            setEdgeConfigDialog({
                source: edge.source,
                target: edge.target,
                sourceHandle: edge.sourceHandle,
                targetHandle: edge.targetHandle,
                existingEdgeId: edge.id,
                existingEdgeType: edge.ref_type,
                existingCalculationExpression: calculationExpression,
            });
            setEdgeContextMenu(null);
        },
        [nodes]
    );

    // Delete edge handler wrapper
    const handleDeleteEdgeWrapper = useCallback(
        (edgeId) => {
            const result = handleDeleteEdge(edgeId);
            if (result?.shouldCloseMenu) {
                setEdgeContextMenu(null);
            }
        },
        [handleDeleteEdge]
    );

    // Use change handlers from useFlowState directly
    // onNodesChange and onEdgesChange are already wrapped by useNodesState/useEdgesState

    return (
        <div
            style={{
                width: "100vw",
                height: "100vh",
                display: "flex",
                flexDirection: "row",
            }}
        >
            {/* Main Graph Section */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                {/* Header */}
                <FlowHeader
                    onLayout={onLayout}
                    onAddNewTable={handleAddNewTable}
                    showNormalRefs={showNormalRefs}
                    showCalcRefs={showCalcRefs}
                    showOnlyHighlighted={showOnlyHighlighted}
                    onToggleNormalRefs={() => setShowNormalRefs((v) => !v)}
                    onToggleCalcRefs={() => setShowCalcRefs((v) => !v)}
                    onToggleOnlyHighlighted={() =>
                        setShowOnlyHighlighted((v) => !v)
                    }
                />

                <ReactFlow
                    nodes={decoratedNodes}
                    edges={decoratedEdges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onEdgeContextMenu={onEdgeContextMenu}
                    nodeTypes={nodeTypes}
                    fitView
                    connectionLineType="smoothstep"
                >
                    <MiniMap />
                    <Controls />
                    <Background gap={16} />
                </ReactFlow>
            </div>

            {/* Edge Configuration Dialog */}
            {edgeConfigDialog && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "rgba(0, 0, 0, 0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1000,
                    }}
                    onClick={() => setEdgeConfigDialog(null)}
                >
                    <EdgeConfigDialog
                        source={edgeConfigDialog.source}
                        target={edgeConfigDialog.target}
                        sourceHandle={edgeConfigDialog.sourceHandle}
                        targetHandle={edgeConfigDialog.targetHandle}
                        onConfirm={handleEdgeConfigConfirmWrapper}
                        onCancel={() => setEdgeConfigDialog(null)}
                        initialEdgeType={edgeConfigDialog.existingEdgeType}
                        initialCalculationExpression={
                            edgeConfigDialog.existingCalculationExpression
                        }
                    />
                </div>
            )}

            {/* Edge Context Menu */}
            {edgeContextMenu && (
                <EdgeContextMenu
                    edge={edgeContextMenu.edge}
                    position={{
                        x: edgeContextMenu.x,
                        y: edgeContextMenu.y,
                    }}
                    onEdit={() => handleEditEdge(edgeContextMenu.edge)}
                    onDelete={() =>
                        handleDeleteEdgeWrapper(edgeContextMenu.edge.id)
                    }
                    onClose={() => setEdgeContextMenu(null)}
                />
            )}

            {/* Field Drawer */}
            <FieldDrawer
                selectedField={selectedField}
                onClose={() => {
                    setSelectedField(null);
                    setHighlightedEdges(new Set());
                }}
            />
        </div>
    );
}
