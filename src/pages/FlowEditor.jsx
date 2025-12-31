import { useCallback, useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useReactFlow,
} from "reactflow";
import TableNode from "../components/TableNode/TableNode";
import EdgeConfigDialog from "../components/EdgeConfigDialog";
import FlowHeader from "../components/FlowHeader";
import EdgeContextMenu from "../components/EdgeContextMenu";
import FieldDrawer from "../components/FieldDrawer";
import { useFlowState } from "../hooks/useFlowState";
import { useNodeHandlers } from "../hooks/useNodeHandlers";
import { useEdgeHandlers } from "../hooks/useEdgeHandlers";
import { useEdgeFiltering } from "../hooks/useEdgeFiltering";
import { useFieldHighlighting } from "../hooks/useFieldHighlighting";
import { useNodeDecoration } from "../hooks/useNodeDecoration";
import { applyLayout } from "../utils/layout";
import { flowToModel } from "../utils/flowToModel";
import { modelToFlow } from "../utils/dataTransform";
import { getFile, setCurrentFile, clearCurrentFile } from "../utils/fileStorage";

const nodeTypes = { tableNode: TableNode };

function FitViewHelper({ onFitView, onCenterNode }) {
    const { fitView, getNode, setCenter, getZoom } = useReactFlow();

    useEffect(() => {
        const timer = setTimeout(() => {
            fitView({ padding: 0.1, duration: 0 });
        }, 100);
        return () => clearTimeout(timer);
    }, [fitView]);

    useEffect(() => {
        if (onFitView) {
            onFitView(() => {
                fitView({ padding: 0.1, duration: 300 });
            });
        }
    }, [fitView]);

    useEffect(() => {
        if (onCenterNode) {
            onCenterNode((nodeId, position) => {
                const node = getNode(nodeId);
                if (node) {
                    const zoom = getZoom();
                    const nodeWidth = 380;
                    const nodeHeight = 200;
                    const centerX = node.position.x + nodeWidth / 2;
                    const centerY = node.position.y + nodeHeight / 2;
                    setCenter(centerX, centerY, { duration: 400, zoom });
                } else if (position) {
                    const nodeWidth = 380;
                    const nodeHeight = 200;
                    const centerX = position.x + nodeWidth / 2;
                    const centerY = position.y + nodeHeight / 2;
                    setCenter(centerX, centerY, { duration: 400 });
                }
            });
        }
    }, [getNode, setCenter, getZoom]);

    return null;
}

const FlowEditor = () => {
    const { fileId } = useParams();
    const navigate = useNavigate();
    const { nodes, edges, setNodes, setEdges, onNodesChange, onEdgesChange } =
        useFlowState();

    const [editingNode, setEditingNode] = useState(null);
    const [editingLabels, setEditingLabels] = useState({});
    const [editingAliases, setEditingAliases] = useState({});
    const [edgeConfigDialog, setEdgeConfigDialog] = useState(null);
    const [edgeContextMenu, setEdgeContextMenu] = useState(null);
    const [selectedTableType, setSelectedTableType] = useState("BASE");

    const [showNormalRefs, setShowNormalRefs] = useState(true);
    const [showCalcRefs, setShowCalcRefs] = useState(true);
    const [showOnlyHighlighted, setShowOnlyHighlighted] = useState(false);

    const [linkDirection, setLinkDirection] = useState("upstream");

    const {
        highlightedEdges,
        selectedField,
        handleFieldClick,
        setSelectedField,
        setHighlightedEdges,
        clearHighlighting,
    } = useFieldHighlighting(edges, linkDirection);

    useEffect(() => {
        clearHighlighting();
    }, [linkDirection, clearHighlighting]);

    const {
        handleAddField,
        handleUpdateNodeLabel,
        handleUpdateNodeAlias,
        handleUpdateFieldName,
        handleDeleteField,
        handleUpdateFieldCalculation,
        handleAddNewTable,
        handleDeleteTable,
    } = useNodeHandlers(
        nodes,
        edges,
        setNodes,
        setEdges,
        setEditingNode,
        setEditingLabels,
        setEditingAliases
    );

    const { handleEdgeConfigConfirm, handleDeleteEdge, handleDeleteFieldRef } =
        useEdgeHandlers(nodes, edges, setNodes, setEdges);

    const handleLabelChange = useCallback((nodeId, value) => {
        setEditingLabels((prev) => ({ ...prev, [nodeId]: value }));
    }, []);

    const handleAliasChange = useCallback((nodeId, value) => {
        setEditingAliases((prev) => ({ ...prev, [nodeId]: value }));
    }, []);

    const handleEditClick = useCallback((nodeId, nodeData) => {
        setEditingNode((prev) => {
            if (prev === nodeId) {
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
        handleEditClick,
        handleDeleteTable
    );

    const decoratedEdges = useEdgeFiltering(
        edges,
        highlightedEdges,
        showNormalRefs,
        showCalcRefs,
        showOnlyHighlighted
    );

    const fitViewRef = useRef(null);
    const centerNodeRef = useRef(null);
    const loadedFileIdRef = useRef(null);

    const setFitViewRef = useCallback((fn) => {
        fitViewRef.current = fn;
    }, []);

    const setCenterNodeRef = useCallback((fn) => {
        centerNodeRef.current = fn;
    }, []);

    const onLayout = useCallback(() => {
        const { nodes: layoutedNodes, edges: layoutedEdges } = applyLayout(
            nodes,
            edges,
            "dagre",
            "LR"
        );
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
        setTimeout(() => {
            if (fitViewRef.current) {
                fitViewRef.current();
            }
        }, 100);
    }, [nodes, edges, setNodes, setEdges]);

    const onExport = useCallback(async () => {
        try {
            const model = flowToModel(nodes, edges);
            const jsonString = JSON.stringify(model, null, 2);
            const blob = new Blob([jsonString], { type: "application/json" });

            if (window.showSaveFilePicker) {
                try {
                    const handle = await window.showSaveFilePicker({
                        suggestedName: "data_model.json",
                        types: [
                            {
                                description: "JSON Files",
                                accept: { "application/json": [".json"] },
                            },
                        ],
                    });
                    const writable = await handle.createWritable();
                    await writable.write(blob);
                    await writable.close();
                    alert("File exported successfully!");
                } catch (error) {
                    if (error.name !== "AbortError") {
                        console.error("Error using File System API:", error);
                        throw error;
                    }
                }
            } else {
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = "data_model.json";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error("Export error:", error);
            if (error.name !== "AbortError") {
                alert("Error exporting file. Please try again.");
            }
        }
    }, [nodes, edges]);

    useEffect(() => {
        if (fileId) {
            if (loadedFileIdRef.current === fileId) {
                return;
            }
            loadedFileIdRef.current = null;
            const loadFile = async () => {
                const file = await getFile(fileId);
                if (file && file.data) {
                    await setCurrentFile(fileId);
                    try {
                        const { nodes: importedNodes, edges: importedEdges } = modelToFlow(file.data);
                        setNodes(importedNodes);
                        setEdges(importedEdges);
                        setEditingNode(null);
                        setEditingLabels({});
                        setEditingAliases({});
                        loadedFileIdRef.current = fileId;
                        setTimeout(() => {
                            const { nodes: layoutedNodes, edges: layoutedEdges } = applyLayout(
                                importedNodes,
                                importedEdges,
                                "dagre",
                                "LR"
                            );
                            setNodes(layoutedNodes);
                            setEdges(layoutedEdges);
                            if (fitViewRef.current) {
                                fitViewRef.current();
                            }
                        }, 100);
                    } catch (error) {
                        console.error("Error loading file data:", error);
                        alert("Error loading file. Please try again.");
                        navigate("/");
                    }
                } else {
                    navigate("/");
                }
            };
            loadFile();
        } else {
            loadedFileIdRef.current = null;
            onLayout();
        }
    }, [fileId, navigate, setNodes, setEdges]);

    const handleBack = async () => {
        await clearCurrentFile();
        navigate("/");
    };

    const onConnect = useCallback((params) => {
        setEdgeConfigDialog({
            source: params.source,
            target: params.target,
            sourceHandle: params.sourceHandle,
            targetHandle: params.targetHandle,
        });
    }, []);

    const onEdgeContextMenu = useCallback((event, edge) => {
        event.preventDefault();
        setEdgeContextMenu({
            edge,
            x: event.clientX,
            y: event.clientY,
        });
    }, []);

    const onPaneContextMenu = useCallback((event) => {
        event.preventDefault();
    }, []);

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

    const handleDeleteEdgeWrapper = useCallback(
        (edgeId) => {
            const result = handleDeleteEdge(edgeId);
            if (result?.shouldCloseMenu) {
                setEdgeContextMenu(null);
            }
        },
        [handleDeleteEdge]
    );

    return (
        <div
            style={{
                width: "100vw",
                height: "100vh",
                display: "flex",
                flexDirection: "row",
                background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                overflow: "hidden",
            }}
        >
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <FlowHeader
                    onLayout={onLayout}
                    onAddNewTable={(tableType) => {
                        const newTableInfo = handleAddNewTable(tableType || selectedTableType);
                        if (newTableInfo && centerNodeRef.current) {
                            setTimeout(() => {
                                centerNodeRef.current(
                                    newTableInfo.nodeId,
                                    newTableInfo.position
                                );
                            }, 100);
                        }
                    }}
                    onExport={onExport}
                    showNormalRefs={showNormalRefs}
                    showCalcRefs={showCalcRefs}
                    showOnlyHighlighted={showOnlyHighlighted}
                    onToggleNormalRefs={() => setShowNormalRefs((v) => !v)}
                    onToggleCalcRefs={() => setShowCalcRefs((v) => !v)}
                    onToggleOnlyHighlighted={() =>
                        setShowOnlyHighlighted((v) => !v)
                    }
                    linkDirection={linkDirection}
                    onLinkDirectionChange={setLinkDirection}
                    selectedTableType={selectedTableType}
                    onTableTypeChange={setSelectedTableType}
                    onBack={handleBack}
                />

                <ReactFlow
                    nodes={decoratedNodes}
                    edges={decoratedEdges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onEdgeContextMenu={onEdgeContextMenu}
                    onPaneContextMenu={onPaneContextMenu}
                    nodeTypes={nodeTypes}
                    minZoom={0.05}
                    maxZoom={4}
                    zoomOnScroll={true}
                    zoomOnPinch={true}
                    panOnScroll={false}
                    panOnDrag={true}
                    connectionLineType="step"
                    defaultEdgeOptions={{
                        type: "step",
                        animated: false,
                        style: {
                            strokeWidth: 3,
                        },
                        pathOptions: {
                            offset: 10,
                            borderRadius: 10,
                        },
                    }}
                    snapToGrid={false}
                    snapGrid={[20, 20]}
                    edgeUpdaterRadius={10}
                    connectionRadius={20}
                >
                    <FitViewHelper
                        onFitView={setFitViewRef}
                        onCenterNode={setCenterNodeRef}
                    />
                    <MiniMap />
                    <Controls />
                    <Background gap={16} />
                </ReactFlow>
            </div>

            {edgeConfigDialog && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "rgba(0, 0, 0, 0.65)",
                        backdropFilter: "blur(6px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1000,
                        animation: "fadeIn 200ms ease",
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

            <FieldDrawer
                selectedField={selectedField}
                onClose={() => {
                    setSelectedField(null);
                    setHighlightedEdges(new Set());
                }}
            />
        </div>
    );
};

export default FlowEditor;

