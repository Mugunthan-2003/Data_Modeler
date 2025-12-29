import { useMemo, useState } from "react";
import { useNodesState, useEdgesState } from "reactflow";
import { modelToFlow } from "../utils/IndividualPipelineView/dataTransform";

export const usePipelineFlowState = () => {
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
