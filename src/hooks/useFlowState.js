import { useMemo, useState } from "react";
import { useNodesState, useEdgesState } from "reactflow";
import { modelToFlow } from "../utils/IndividualView/dataTransform";

/**
 * Custom hook for managing flow state (nodes and edges)
 * @returns {Object} Object containing nodes, edges, and their setters
 */
export const useFlowState = () => {
    const { nodes: initialNodes, edges: initialEdges } = useMemo(
        () => modelToFlow(),
        []
    );
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    return {
        nodes,
        edges,
        setNodes,
        setEdges,
        onNodesChange,
        onEdgesChange,
    };
};

