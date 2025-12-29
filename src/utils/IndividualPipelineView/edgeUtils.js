export const generateEdgeId = (edgeType, sourceHandle, targetHandle) => {
    const prefix = edgeType === "calculation" ? "calc" : "ref";
    return `${prefix}-${sourceHandle}->${targetHandle}`;
};

export const extractFieldName = (handle, nodeId) => {
    return handle.replace(`${nodeId}-`, "");
};

export const createEdge = (config) => {
    const { id, ref_type, source, target, sourceHandle, targetHandle } = config;
    const isCalcEdge = ref_type === "calculation";

    return {
        id,
        ref_type,
        type: "step",
        source,
        target,
        sourceHandle,
        targetHandle,
        animated: !isCalcEdge,
        style: isCalcEdge
            ? { 
                stroke: "#0066ff", 
                strokeDasharray: "8,4",
                strokeWidth: 3,
            }
            : { 
                stroke: "#ef4444",
                strokeWidth: 3,
            },
        pathOptions: {
            offset: 10,
            borderRadius: 10,
        },
        markerEnd: {
            type: "arrowclosed",
            color: isCalcEdge ? "#0066ff" : "#ef4444",
        },
    };
};

export const parseReference = (ref) => {
    const [entity, field] = ref.split(".");
    return { entity, field };
};

export const createReference = (entity, field) => {
    return `${entity}.${field}`;
};

export const getHandleId = (nodeId, fieldName) => {
    return `${nodeId}-${fieldName}`;
};
