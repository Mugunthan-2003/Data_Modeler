import { useCallback, useEffect, useState, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
} from "reactflow";
import TableNode from "../components/IndividualPipelineView/TableNode/TableNode";
import EdgeConfigDialog from "../components/IndividualPipelineView/EdgeConfigDialog";
import FlowHeader from "../components/IndividualPipelineView/FlowHeader";
import EdgeContextMenu from "../components/IndividualPipelineView/EdgeContextMenu";
import FieldDrawer from "../components/IndividualPipelineView/FieldDrawer";
import FitViewHelper from "../components/IndividualPipelineView/FitViewHelper";
import { usePipelineFlowState } from "../hooks/usePipelineFlowState";
import { usePipelineNodeHandlers } from "../hooks/usePipelineNodeHandlers";
import { usePipelineEdgeHandlers } from "../hooks/usePipelineEdgeHandlers";
import { useEdgeFiltering } from "../hooks/useEdgeFiltering";
import { useFieldHighlighting } from "../hooks/useFieldHighlighting";
import { useNodeDecoration } from "../hooks/useNodeDecoration";
import { applyLayout } from "../utils/IndividualPipelineView/layout";
import { flowToModel } from "../utils/IndividualPipelineView/flowToModel";
import { modelToFlow } from "../utils/IndividualPipelineView/dataTransform";
import { getFile, setCurrentFile, clearCurrentFile } from "../utils/ControlPage/fileStorage";

const IndividualPipelineView = () => {
    const { fileId } = useParams();
    const navigate = useNavigate();
    const { nodes, edges, setNodes, setEdges, onNodesChange, onEdgesChange } =
        usePipelineFlowState();

    const nodeTypes = useMemo(() => ({ tableNode: TableNode }), []);

    const [editingNode, setEditingNode] = useState(null);
    const [editingLabels, setEditingLabels] = useState({});
    const [editingAliases, setEditingAliases] = useState({});
    const [editingSourcePaths, setEditingSourcePaths] = useState({});
    const [edgeConfigDialog, setEdgeConfigDialog] = useState(null);
    const [edgeContextMenu, setEdgeContextMenu] = useState(null);
    const [selectedTableType, setSelectedTableType] = useState("SOURCE");

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
        handleUpdateSourcePath,
        handleUpdateFieldName,
        handleDeleteField,
        handleUpdateFieldCalculation,
        handleAddNewTable,
        handleDeleteTable,
    } = usePipelineNodeHandlers(
        nodes,
        edges,
        setNodes,
        setEdges,
        setEditingNode,
        setEditingLabels,
        setEditingAliases
    );

    const { handleEdgeConfigConfirm, handleDeleteEdge, handleDeleteFieldRef } =
        usePipelineEdgeHandlers(nodes, edges, setNodes, setEdges);

    const handleLabelChange = useCallback((nodeId, value) => {
        setEditingLabels((prev) => ({ ...prev, [nodeId]: value }));
    }, []);

    const handleAliasChange = useCallback((nodeId, value) => {
        setEditingAliases((prev) => ({ ...prev, [nodeId]: value }));
    }, []);

    const handleSourcePathChange = useCallback((nodeId, value) => {
        setEditingSourcePaths((prev) => ({ ...prev, [nodeId]: value }));
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
                setEditingSourcePaths((paths) => {
                    const updated = { ...paths };
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
            setEditingSourcePaths((prev) => ({
                ...prev,
                [nodeId]: nodeData.source_path ?? "",
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
    ).map((node) => ({
        ...node,
        data: {
            ...node.data,
            editingSourcePath: editingSourcePaths[node.id] ?? node.data.source_path ?? "",
            onSourcePathChange: (value) => handleSourcePathChange(node.id, value),
            onUpdateSourcePath: (newSourcePath) => handleUpdateSourcePath(node.id, newSourcePath),
        },
    }));

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
                        suggestedName: "pipeline_model.json",
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
                link.download = "pipeline_model.json";
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
                const file = await getFile(fileId, 'pipeline', 'individual');
                if (file && file.data) {
                    await setCurrentFile(fileId);
                    try {
                        const { nodes: importedNodes, edges: importedEdges } = modelToFlow(file.data);
                        setNodes(importedNodes);
                        setEdges(importedEdges);
                        setEditingNode(null);
                        setEditingLabels({});
                        setEditingAliases({});
                        setEditingSourcePaths({});
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
                        navigate("/?modeler=pipeline");
                    }
                } else {
                    navigate("/?modeler=pipeline");
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
        navigate("/?modeler=pipeline");
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
                onUpdateFieldCalculation={handleUpdateFieldCalculation}
                onClose={() => {
                    setSelectedField(null);
                    setHighlightedEdges(new Set());
                }}
            />
        </div>
    );
};

export default IndividualPipelineView;
