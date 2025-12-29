import { useCallback, useEffect, useState, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
} from "reactflow";
import "reactflow/dist/style.css";
import TableNode from "../components/IndividualPipelineView/TableNode/TableNode";
import AvailableEntitiesSidebar from "../components/ConsolidatedPipelineView/AvailableEntitiesSidebar";
import ConsolidatedFlowHeader from "../components/ConsolidatedPipelineView/ConsolidatedFlowHeader";
import FitViewHelper from "../components/IndividualPipelineView/FitViewHelper";
import EdgeConfigDialog from "../components/IndividualPipelineView/EdgeConfigDialog";
import EdgeContextMenu from "../components/IndividualPipelineView/EdgeContextMenu";
import { usePipelineFlowState } from "../hooks/usePipelineFlowState";
import { usePipelineNodeHandlers } from "../hooks/usePipelineNodeHandlers";
import { usePipelineEdgeHandlers } from "../hooks/usePipelineEdgeHandlers";
import { useNodeDecoration } from "../hooks/useNodeDecoration";
import { applyLayout } from "../utils/IndividualPipelineView/layout";
import { modelToFlow } from "../utils/IndividualPipelineView/dataTransform";
import { flowToModel } from "../utils/IndividualPipelineView/flowToModel";
import { addTablePrefix } from "../utils/IndividualPipelineView/dataTransform";
import { generateUniqueTableName, calculateCenterPosition } from "../utils/IndividualPipelineView/nodeUtils";
import { getMergedFile } from "../utils/ControlPage/fileStorage";

const ConsolidatedPipelineView = () => {
    const { fileId } = useParams();
    const navigate = useNavigate();
    const { nodes, edges, setNodes, setEdges, onNodesChange, onEdgesChange } =
        usePipelineFlowState();

    const nodeTypes = useMemo(() => ({ tableNode: TableNode }), []);

    const [editingNode, setEditingNode] = useState(null);
    const [editingLabels, setEditingLabels] = useState({});
    const [editingAliases, setEditingAliases] = useState({});
    const [editingSourcePaths, setEditingSourcePaths] = useState({});
    const [sourceEntities, setSourceEntities] = useState({});
    const [targetEntities, setTargetEntities] = useState({});
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [edgeConfigDialog, setEdgeConfigDialog] = useState(null);
    const [edgeContextMenu, setEdgeContextMenu] = useState(null);

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
        null,
        editingNode,
        editingLabels,
        editingAliases,
        () => {},
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

    const fitViewRef = useRef(null);
    const centerNodeRef = useRef(null);

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

    const handleAddEntityFromSidebar = useCallback((entity) => {
        const tableType = entity.type || "SOURCE";
        const baseName = entity.name || generateUniqueTableName(nodes);
        const uniqueName = generateUniqueTableName(nodes, baseName);
        const nodeId = addTablePrefix(uniqueName, tableType);
        
        const position = calculateCenterPosition(56, 300);
        
        const newNode = {
            id: nodeId,
            type: "tableNode",
            position,
            data: {
                label: uniqueName,
                alias: entity.alias || "",
                source_path: entity.source_path || "",
                fields: Object.entries(entity.fields || {}).map(([fname, fdata]) => ({
                    name: fname,
                    ...fdata,
                })),
                tableType: tableType,
                nodeId: nodeId,
            },
        };

        setNodes((nds) => [...nds, newNode]);
        
        setTimeout(() => {
            if (centerNodeRef.current) {
                centerNodeRef.current(nodeId, position);
            }
        }, 100);
    }, [nodes, setNodes]);

    useEffect(() => {
        const loadMergedFile = async () => {
            if (!fileId) {
                setSourceEntities({});
                setTargetEntities({});
                setNodes([]);
                setEdges([]);
                return;
            }

            try {
                const mergedFile = await getMergedFile(fileId, 'pipeline');
                if (mergedFile && mergedFile.data) {
                    const sourceEntitiesData = mergedFile.data.source_entities || {};
                    const targetEntitiesData = mergedFile.data.target_entities || {};
                    
                    setSourceEntities(sourceEntitiesData);
                    setTargetEntities(targetEntitiesData);
                    
                    if (Object.keys(sourceEntitiesData).length === 0 && Object.keys(targetEntitiesData).length === 0) {
                        setNodes([]);
                        setEdges([]);
                    }
                } else {
                    setSourceEntities({});
                    setTargetEntities({});
                    setNodes([]);
                    setEdges([]);
                }
            } catch (error) {
                console.error("Error loading merged file:", error);
                setSourceEntities({});
                setTargetEntities({});
                setNodes([]);
                setEdges([]);
            }
        };

        loadMergedFile();
    }, [fileId, setNodes, setEdges]);

    const handleBack = useCallback(() => {
        navigate("/?modeler=pipeline");
    }, [navigate]);

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

    const handleSave = useCallback(async () => {
        try {
            const model = flowToModel(nodes, edges);

            const jsonString = JSON.stringify(model, null, 2);
            const blob = new Blob([jsonString], { type: "application/json" });

            if (window.showSaveFilePicker) {
                try {
                    const handle = await window.showSaveFilePicker({
                        suggestedName: "consolidated_pipeline.json",
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
                    alert("File saved successfully!");
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
                link.download = "consolidated_pipeline.json";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error("Save error:", error);
            if (error.name !== "AbortError") {
                alert("Error saving file. Please try again.");
            }
        }
    }, [nodes, edges]);

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
            <AvailableEntitiesSidebar
                sourceEntities={sourceEntities}
                targetEntities={targetEntities}
                onAddEntity={handleAddEntityFromSidebar}
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />

            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <ConsolidatedFlowHeader
                    onBack={handleBack}
                    onLayout={onLayout}
                    onSave={handleSave}
                    tableCount={nodes.length}
                    connectionCount={edges.length}
                />

                <ReactFlow
                    nodes={decoratedNodes}
                    edges={edges}
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
            </div>
        </div>
    );
};

export default ConsolidatedPipelineView;
