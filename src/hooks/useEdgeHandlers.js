import { useCallback } from "react";
import { addEdge } from "reactflow";
import {
    generateEdgeId,
    extractFieldName,
    createEdge,
    createReference,
    parseReference,
    getHandleId,
} from "../utils/edgeUtils";
import {
    updateNodeInNodes,
    updateFieldInFields,
} from "../utils/nodeUtils";

/**
 * Custom hook for edge-related handlers
 * @param {Array} nodes - Current nodes array
 * @param {Array} edges - Current edges array
 * @param {Function} setNodes - Function to update nodes
 * @param {Function} setEdges - Function to update edges
 * @returns {Object} Object containing all edge handlers
 */
export const useEdgeHandlers = (nodes, edges, setNodes, setEdges) => {
    const handleEdgeConfigConfirm = useCallback(
        (
            edgeType,
            calculationExpression = "",
            isEdit = false,
            existingEdgeId = null,
            config = null,
            edgeContextMenu = null
        ) => {
            const edgeConfig =
                isEdit && edgeContextMenu
                    ? {
                          source: edgeContextMenu.edge.source,
                          target: edgeContextMenu.edge.target,
                          sourceHandle: edgeContextMenu.edge.sourceHandle,
                          targetHandle: edgeContextMenu.edge.targetHandle,
                      }
                    : config;

            if (!edgeConfig) return;

            const { source, target, sourceHandle, targetHandle } = edgeConfig;

            // Determine edge ID and style based on type
            const isCalcEdge = edgeType === "calculation";
            const edgeId = generateEdgeId(edgeType, sourceHandle, targetHandle);

            const newEdge = createEdge({
                id: edgeId,
                ref_type: isCalcEdge ? "calculation" : "normal",
                source,
                target,
                sourceHandle,
                targetHandle,
            });

            // Extract field names from handles
            const sourceFieldName = extractFieldName(sourceHandle, source);
            const targetFieldName = extractFieldName(targetHandle, target);
            const sourceRef = createReference(source, sourceFieldName);

            // If editing an existing edge, delete it first
            if (isEdit && existingEdgeId) {
                setEdges((eds) => eds.filter((e) => e.id !== existingEdgeId));

                // Remove the reference from the field data
                const existingEdge = edges.find((e) => e.id === existingEdgeId);
                if (existingEdge) {
                    const existingTargetFieldName = extractFieldName(
                        existingEdge.targetHandle,
                        existingEdge.target
                    );
                    const existingSourceRef = extractFieldName(
                        existingEdge.sourceHandle,
                        existingEdge.source
                    );
                    const existingFullRef = createReference(
                        existingEdge.source,
                        existingSourceRef
                    );

                    setNodes((nds) =>
                        updateNodeInNodes(nds, existingEdge.target, (node) => ({
                            ...node,
                            data: {
                                ...node.data,
                                fields: updateFieldInFields(
                                    node.data.fields,
                                    existingTargetFieldName,
                                    (field) => {
                                        if (
                                            existingEdge.ref_type ===
                                            "calculation"
                                        ) {
                                            return {
                                                ...field,
                                                calculation: undefined,
                                            };
                                        } else {
                                            return {
                                                ...field,
                                                ref: (field.ref || []).filter(
                                                    (r) => r !== existingFullRef
                                                ),
                                            };
                                        }
                                    }
                                ),
                            },
                        }))
                    );
                }
            }

            // If it's a calculation ref, update the target field to include calculation
            if (isCalcEdge && calculationExpression) {
                setNodes((nds) =>
                    updateNodeInNodes(nds, target, (node) => ({
                        ...node,
                        data: {
                            ...node.data,
                            fields: updateFieldInFields(
                                node.data.fields,
                                targetFieldName,
                                (field) => ({
                                    ...field,
                                    calculation: {
                                        expression: calculationExpression,
                                        ref: [sourceRef],
                                    },
                                })
                            ),
                        },
                    }))
                );
            } else if (!isCalcEdge) {
                // For normal refs, update the field's ref array
                setNodes((nds) =>
                    updateNodeInNodes(nds, target, (node) => ({
                        ...node,
                        data: {
                            ...node.data,
                            fields: updateFieldInFields(
                                node.data.fields,
                                targetFieldName,
                                (field) => {
                                    const existingRefs = field.ref || [];
                                    if (!existingRefs.includes(sourceRef)) {
                                        return {
                                            ...field,
                                            ref: [...existingRefs, sourceRef],
                                        };
                                    }
                                    return field;
                                }
                            ),
                        },
                    }))
                );
            }

            setEdges((eds) => addEdge(newEdge, eds));
            return { shouldCloseDialog: true, shouldCloseMenu: true };
        },
        [edges, setEdges, setNodes]
    );

    const handleDeleteEdge = useCallback(
        (edgeId) => {
            const edge = edges.find((e) => e.id === edgeId);
            if (!edge) return;

            // Remove the reference from the target field
            const targetFieldName = extractFieldName(
                edge.targetHandle,
                edge.target
            );
            const sourceFieldName = extractFieldName(
                edge.sourceHandle,
                edge.source
            );
            const sourceRef = createReference(edge.source, sourceFieldName);

            setNodes((nds) =>
                updateNodeInNodes(nds, edge.target, (node) => ({
                    ...node,
                    data: {
                        ...node.data,
                        fields: updateFieldInFields(
                            node.data.fields,
                            targetFieldName,
                            (field) => {
                                if (edge.ref_type === "calculation") {
                                    return { ...field, calculation: undefined };
                                } else {
                                    return {
                                        ...field,
                                        ref: (field.ref || []).filter(
                                            (r) => r !== sourceRef
                                        ),
                                    };
                                }
                            }
                        ),
                    },
                }))
            );

            // Delete the edge
            setEdges((eds) => eds.filter((e) => e.id !== edgeId));
            return { shouldCloseMenu: true };
        },
        [edges, setEdges, setNodes]
    );

    const handleDeleteFieldRef = useCallback(
        (nodeId, fieldName, refToDelete, isCalcRef = false) => {
            const handleId = getHandleId(nodeId, fieldName);

            // Update field to remove the reference
            setNodes((nds) =>
                updateNodeInNodes(nds, nodeId, (node) => ({
                    ...node,
                    data: {
                        ...node.data,
                        fields: updateFieldInFields(
                            node.data.fields,
                            fieldName,
                            (field) => {
                                if (isCalcRef) {
                                    return {
                                        ...field,
                                        calculation: field.calculation?.ref?.some(
                                            (r) => r === refToDelete
                                        )
                                            ? undefined
                                            : field.calculation,
                                    };
                                } else {
                                    return {
                                        ...field,
                                        ref: (field.ref || []).filter(
                                            (r) => r !== refToDelete
                                        ),
                                    };
                                }
                            }
                        ),
                    },
                }))
            );

            // Find and delete the corresponding edge
            const { entity: sourceEntity, field: sourceField } =
                parseReference(refToDelete);
            const sourceHandle = getHandleId(sourceEntity, sourceField);

            setEdges((eds) =>
                eds.filter(
                    (edge) =>
                        !(
                            edge.sourceHandle === sourceHandle &&
                            edge.targetHandle === handleId
                        )
                )
            );
        },
        [setNodes, setEdges]
    );

    return {
        handleEdgeConfigConfirm,
        handleDeleteEdge,
        handleDeleteFieldRef,
    };
};

