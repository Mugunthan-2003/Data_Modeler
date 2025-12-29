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
import ConnectionSuggestionModal from "../components/ConsolidatedPipelineView/ConnectionSuggestionModal";
import ConsolidatedFlowHeader from "../components/ConsolidatedPipelineView/ConsolidatedFlowHeader";
import FitViewHelper from "../components/IndividualPipelineView/FitViewHelper";
import EdgeConfigDialog from "../components/IndividualPipelineView/EdgeConfigDialog";
import EdgeContextMenu from "../components/IndividualPipelineView/EdgeContextMenu";
import FieldDrawer from "../components/IndividualPipelineView/FieldDrawer";
import { usePipelineFlowState } from "../hooks/usePipelineFlowState";
import { usePipelineNodeHandlers } from "../hooks/usePipelineNodeHandlers";
import { usePipelineEdgeHandlers } from "../hooks/usePipelineEdgeHandlers";
import { useEdgeFiltering } from "../hooks/useEdgeFiltering";
import { useFieldHighlighting } from "../hooks/useFieldHighlighting";
import { useNodeDecoration } from "../hooks/useNodeDecoration";
import { applyLayout } from "../utils/IndividualPipelineView/layout";
import { modelToFlow } from "../utils/IndividualPipelineView/dataTransform";
import { flowToModel } from "../utils/IndividualPipelineView/flowToModel";
import { addTablePrefix } from "../utils/IndividualPipelineView/dataTransform";
import { generateUniqueTableName, calculateCenterPosition } from "../utils/IndividualPipelineView/nodeUtils";
import { getMergedFile, saveMergedFile } from "../utils/ControlPage/fileStorage";

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
    const [connectionSuggestions, setConnectionSuggestions] = useState(null);
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

    const currentSourceEntities = useMemo(() => {
        const entities = {};
        nodes.forEach((node) => {
            if (node.data.tableType === "SOURCE") {
                const entityName = node.data.label;
                const fields = {};
                (node.data.fields || []).forEach((field) => {
                    fields[field.name] = {
                        ...(field.ref && { ref: field.ref }),
                        ...(field.calculation && { calculation: field.calculation }),
                    };
                });
                entities[entityName] = {
                    alias: node.data.alias || "",
                    source_path: node.data.source_path || "",
                    fields,
                };
            }
        });
        Object.keys(sourceEntities).forEach((key) => {
            if (!entities[key]) {
                entities[key] = sourceEntities[key];
            }
        });
        return entities;
    }, [nodes, sourceEntities]);

    const currentTargetEntities = useMemo(() => {
        const entities = {};
        nodes.forEach((node) => {
            if (node.data.tableType === "TARGET") {
                const entityName = node.data.label;
                const fields = {};
                (node.data.fields || []).forEach((field) => {
                    fields[field.name] = {
                        ...(field.ref && { ref: field.ref }),
                        ...(field.calculation && { calculation: field.calculation }),
                    };
                });
                entities[entityName] = {
                    alias: node.data.alias || "",
                    source_path: node.data.source_path || "",
                    fields,
                };
            }
        });
        Object.keys(targetEntities).forEach((key) => {
            if (!entities[key]) {
                entities[key] = targetEntities[key];
            }
        });
        return entities;
    }, [nodes, targetEntities]);

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

    const fitViewRef = useRef(null);
    const centerNodeRef = useRef(null);
    const reactFlowWrapper = useRef(null);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);

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

    const parseReference = useCallback((refValue) => {
        if (!refValue) return { entity: "", field: "" };
        const lastDot = refValue.lastIndexOf(".");
        if (lastDot === -1) return { entity: "", field: "" };
        return {
            entity: refValue.substring(0, lastDot),
            field: refValue.substring(lastDot + 1),
        };
    }, []);

    const getRequiredSourcesForTarget = useCallback(
        (targetName) => {
            const target = currentTargetEntities[targetName];
            if (!target) return [];
            const required = new Set();

            Object.values(target.fields || {}).forEach((field) => {
                (field.ref || []).forEach((ref) => {
                    const { entity } = parseReference(ref);
                    if (entity) required.add(entity);
                });
                (field.calculation?.ref || []).forEach((ref) => {
                    const { entity } = parseReference(ref);
                    if (entity) required.add(entity);
                });
            });

            return Array.from(required);
        },
        [currentTargetEntities, parseReference]
    );

    const findTargetsForSource = useCallback(
        (sourceName) => {
            const matches = [];
            Object.entries(currentTargetEntities || {}).forEach(([targetName, target]) => {
                const usesSource = Object.values(target.fields || {}).some((field) => {
                    const refs = [
                        ...(field.ref || []),
                        ...(field.calculation?.ref || []),
                    ];
                    return refs.some((ref) => ref.startsWith(`${sourceName}.`));
                });
                if (usesSource) {
                    matches.push(targetName);
                }
            });
            return matches;
        },
        [currentTargetEntities]
    );

    const createEdgeForRef = useCallback((sourceEntity, sourceField, targetEntity, targetField, refType = "normal") => {
        const sourceNodeId = addTablePrefix(sourceEntity, "SOURCE");
        const targetNodeId = addTablePrefix(targetEntity, "TARGET");
        const prefix = refType === "calculation" ? "calc" : "ref";
        return {
            id: `${prefix}-${sourceNodeId}.${sourceField}->${targetNodeId}.${targetField}`,
            ref_type: refType === "calculation" ? "calculation" : "normal",
            type: "smoothstep",
            source: sourceNodeId,
            target: targetNodeId,
            sourceHandle: `${sourceNodeId}-${sourceField}`,
            targetHandle: `${targetNodeId}-${targetField}`,
            animated: refType !== "calculation",
            style:
                refType === "calculation"
                    ? { stroke: "#0066ff", strokeDasharray: "5,5" }
                    : { stroke: "#fd5d5dff" },
        };
    }, []);

    const buildEdgesForTarget = useCallback(
        (targetName) => {
            const target = currentTargetEntities[targetName];
            if (!target) return [];
            const edgesList = [];

            Object.entries(target.fields || {}).forEach(([fieldName, field]) => {
                (field.ref || []).forEach((ref) => {
                    const { entity, field: sourceField } = parseReference(ref);
                    if (!entity || !currentSourceEntities[entity]) return;
                    edgesList.push(
                        createEdgeForRef(entity, sourceField, targetName, fieldName, "normal")
                    );
                });

                (field.calculation?.ref || []).forEach((ref) => {
                    const { entity, field: sourceField } = parseReference(ref);
                    if (!entity || !currentSourceEntities[entity]) return;
                    edgesList.push(
                        createEdgeForRef(
                            entity,
                            sourceField,
                            targetName,
                            fieldName,
                            "calculation"
                        )
                    );
                });
            });

            return edgesList;
        },
        [currentTargetEntities, currentSourceEntities, parseReference, createEdgeForRef]
    );

    const createNodeFromDefinition = useCallback((entityName, entityData, tableType, position) => {
        const nodeId = addTablePrefix(entityName, tableType);
        return {
            id: nodeId,
            type: "tableNode",
            position,
            data: {
                label: entityName,
                alias: entityData?.alias || "",
                source_path: entityData?.source_path || "",
                fields: Object.entries(entityData?.fields || {}).map(([fname, fdata]) => ({
                    name: fname,
                    ...fdata,
                })),
                tableType,
                nodeId,
            },
        };
    }, []);

    const applyConnectionsForTarget = useCallback(
        (targetName) => {
            const targetDef = currentTargetEntities[targetName];
            if (!targetDef) return;
            const requiredSources = getRequiredSourcesForTarget(targetName);
            const basePosition = calculateCenterPosition(56, 300);

            setNodes((nds) => {
                const existingIds = new Set(nds.map((n) => n.id));
                const next = [...nds];
                const targetId = addTablePrefix(targetName, "TARGET");

                if (!existingIds.has(targetId)) {
                    next.push(
                        createNodeFromDefinition(
                            targetName,
                            targetDef,
                            "TARGET",
                            basePosition
                        )
                    );
                    existingIds.add(targetId);
                }

                requiredSources.forEach((srcName, index) => {
                    const srcDef = currentSourceEntities[srcName];
                    if (!srcDef) return;
                    const srcId = addTablePrefix(srcName, "SOURCE");
                    if (existingIds.has(srcId)) return;
                    const pos = {
                        x: basePosition.x - 240 + index * 140,
                        y: basePosition.y - 180 + index * 60,
                    };
                    next.push(
                        createNodeFromDefinition(
                            srcName,
                            srcDef,
                            "SOURCE",
                            pos
                        )
                    );
                    existingIds.add(srcId);
                });

                return next;
            });

            setEdges((eds) => {
                const existingIds = new Set(eds.map((e) => e.id));
                const newEdges = buildEdgesForTarget(targetName);
                const filtered = newEdges.filter((e) => !existingIds.has(e.id));
                return [...eds, ...filtered];
            });

            setConnectionSuggestions(null);
        },
        [
            currentTargetEntities,
            currentSourceEntities,
            getRequiredSourcesForTarget,
            buildEdgesForTarget,
            createNodeFromDefinition,
            setNodes,
            setEdges,
        ]
    );

    const decoratedEdges = useEdgeFiltering(
        edges,
        highlightedEdges,
        showNormalRefs,
        showCalcRefs,
        showOnlyHighlighted
    );

    const handleAddEntityFromSidebar = useCallback((entity) => {
        const tableType = entity.type || "SOURCE";
        const baseName = entity.name || generateUniqueTableName(nodes);
        const nodeId = addTablePrefix(baseName, tableType);
        const nodeExists = nodes.some((n) => n.id === nodeId);
        const position = calculateCenterPosition(56, 300);

        if (!nodeExists) {
            const newNode = {
                id: nodeId,
                type: "tableNode",
                position,
                data: {
                    label: baseName,
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
        } else {
            setTimeout(() => {
                if (centerNodeRef.current) {
                    centerNodeRef.current(nodeId, position);
                }
            }, 100);
        }

        if (tableType === "SOURCE") {
            const matchingTargets = findTargetsForSource(baseName);
            if (matchingTargets.length) {
                setConnectionSuggestions({
                    mode: "SOURCE",
                    sourceName: baseName,
                    targetOptions: matchingTargets.map((name) => ({
                        name,
                        requiredSources: getRequiredSourcesForTarget(name),
                    })),
                });
            }
        } else {
            const requiredSources = getRequiredSourcesForTarget(baseName);
            if (requiredSources.length) {
                setConnectionSuggestions({
                    mode: "TARGET",
                    targetName: baseName,
                    requiredSources,
                });
            }
        }
    }, [nodes, setNodes, findTargetsForSource, getRequiredSourcesForTarget]);

    const handleAddAllEntities = useCallback(() => {
        const basePosition = calculateCenterPosition(56, 300);
        const nodesToAdd = [];
        const edgesToAdd = [];
        const existingIds = new Set(nodes.map((n) => n.id));

        let sourceX = basePosition.x - 400;
        let sourceY = basePosition.y;

        Object.entries(currentSourceEntities).forEach(([entityName, entityData], index) => {
            const nodeId = addTablePrefix(entityName, "SOURCE");
            if (!existingIds.has(nodeId)) {
                const position = {
                    x: sourceX,
                    y: sourceY + (index * 200),
                };
                nodesToAdd.push(
                    createNodeFromDefinition(entityName, entityData, "SOURCE", position)
                );
                existingIds.add(nodeId);
            }
        });

        let targetX = basePosition.x + 400;
        let targetY = basePosition.y;

        Object.entries(currentTargetEntities).forEach(([entityName, entityData], index) => {
            const nodeId = addTablePrefix(entityName, "TARGET");
            if (!existingIds.has(nodeId)) {
                const position = {
                    x: targetX,
                    y: targetY + (index * 200),
                };
                nodesToAdd.push(
                    createNodeFromDefinition(entityName, entityData, "TARGET", position)
                );
                existingIds.add(nodeId);
            }

            const targetEdges = buildEdgesForTarget(entityName);
            edgesToAdd.push(...targetEdges);
        });

        const updatedNodes = [...nodes, ...nodesToAdd];
        const existingEdgeIds = new Set(edges.map((e) => e.id));
        const filteredNewEdges = edgesToAdd.filter((e) => !existingEdgeIds.has(e.id));
        const updatedEdges = [...edges, ...filteredNewEdges];

        if (nodesToAdd.length > 0 || filteredNewEdges.length > 0) {
            const { nodes: layoutedNodes, edges: layoutedEdges } = applyLayout(
                updatedNodes,
                updatedEdges,
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
        }
    }, [
        nodes,
        edges,
        currentSourceEntities,
        currentTargetEntities,
        createNodeFromDefinition,
        buildEdgesForTarget,
        setNodes,
        setEdges,
        fitViewRef,
    ]);

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

    const handleCreateEntity = useCallback((tableType) => {
        const timestamp = Date.now();
        const entityName = `new_${tableType.toLowerCase()}_${timestamp}`;
        const newEntity = {
            alias: "",
            source_path: "",
            fields: {},
        };

        if (tableType === "SOURCE") {
            setSourceEntities((prev) => ({
                ...prev,
                [entityName]: newEntity,
            }));
        } else {
            setTargetEntities((prev) => ({
                ...prev,
                [entityName]: newEntity,
            }));
        }

        handleAddEntityFromSidebar({
            name: entityName,
            ...newEntity,
            type: tableType,
        });
    }, [handleAddEntityFromSidebar]);

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    }, []);

    const onDrop = useCallback(
        (event) => {
            event.preventDefault();

            if (!reactFlowInstance) return;

            const entityData = event.dataTransfer.getData("application/reactflow");
            if (!entityData) return;

            try {
                const entity = JSON.parse(entityData);
                const position = reactFlowInstance.screenToFlowPosition({
                    x: event.clientX,
                    y: event.clientY,
                });

                const tableType = entity.type || "SOURCE";
                const baseName = entity.name;
                const nodeId = addTablePrefix(baseName, tableType);
                const nodeExists = nodes.some((n) => n.id === nodeId);

                if (!nodeExists) {
                    const newNode = {
                        id: nodeId,
                        type: "tableNode",
                        position,
                        data: {
                            label: baseName,
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
                }
            } catch (error) {
                console.error("Error dropping entity:", error);
            }
        },
        [reactFlowInstance, nodes, setNodes]
    );

    const handleSave = useCallback(async () => {
        try {
            const model = flowToModel(nodes, edges);
            
            const fileName = prompt(
                "Enter a filename for the consolidated pipeline:",
                "consolidated_pipeline.json"
            );
            
            if (!fileName) {
                return;
            }
            
            const finalFileName = fileName.endsWith(".json") ? fileName : `${fileName}.json`;
            
            await saveMergedFile(finalFileName, model, [], "pipeline");
            
            alert("File saved successfully!");
            navigate("/?modeler=pipeline");
        } catch (error) {
            console.error("Save error:", error);
            alert("Error saving file. Please try again.");
        }
    }, [nodes, edges, navigate]);

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
                sourceEntities={currentSourceEntities}
                targetEntities={currentTargetEntities}
                addedEntityIds={new Set(nodes.map((n) => n.id))}
                onAddEntity={handleAddEntityFromSidebar}
                onCreateEntity={handleCreateEntity}
                onAddAllEntities={handleAddAllEntities}
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
                    showNormalRefs={showNormalRefs}
                    showCalcRefs={showCalcRefs}
                    showOnlyHighlighted={showOnlyHighlighted}
                    onToggleNormalRefs={() => setShowNormalRefs((v) => !v)}
                    onToggleCalcRefs={() => setShowCalcRefs((v) => !v)}
                    onToggleOnlyHighlighted={() => setShowOnlyHighlighted((v) => !v)}
                    linkDirection={linkDirection}
                    onLinkDirectionChange={setLinkDirection}
                />

                <div 
                    ref={reactFlowWrapper} 
                    style={{ width: "100%", height: "100%" }}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                >
                    <ReactFlow
                        nodes={decoratedNodes}
                        edges={decoratedEdges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onEdgeContextMenu={onEdgeContextMenu}
                        onPaneContextMenu={onPaneContextMenu}
                        onInit={setReactFlowInstance}
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

                {connectionSuggestions && (
                    <ConnectionSuggestionModal
                        mode={connectionSuggestions.mode}
                        sourceName={connectionSuggestions.sourceName}
                        targetName={connectionSuggestions.targetName}
                        targetOptions={connectionSuggestions.targetOptions}
                        requiredSources={connectionSuggestions.requiredSources}
                        onSelectTarget={(targetName) =>
                            applyConnectionsForTarget(targetName)
                        }
                        onSkip={() => setConnectionSuggestions(null)}
                    />
                )}
            </div>

            <div
                style={{
                    position: "fixed",
                    top: 72,
                    right: 0,
                    bottom: 0,
                    width: selectedField ? 400 : 0,
                    overflow: "hidden",
                    transition: "width 200ms ease",
                    background: selectedField ? "#fff" : "transparent",
                    borderLeft: selectedField ? "2px solid #e5e7eb" : "none",
                    boxShadow: selectedField
                        ? "-4px 0 20px rgba(0, 0, 0, 0.15)"
                        : "none",
                    zIndex: 1100,
                }}
            >
                <FieldDrawer
                    selectedField={selectedField}
                    onClose={() => {
                        setSelectedField(null);
                        setHighlightedEdges(new Set());
                    }}
                />
            </div>
        </div>
    );
};

export default ConsolidatedPipelineView;
