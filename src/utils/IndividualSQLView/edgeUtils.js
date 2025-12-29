/**
 * Generate edge ID based on type and handles
 * @param {string} edgeType - Type of edge ('normal' or 'calculation')
 * @param {string} sourceHandle - Source handle ID
 * @param {string} targetHandle - Target handle ID
 * @returns {string} Edge ID
 */
export const generateEdgeId = (edgeType, sourceHandle, targetHandle) => {
    const prefix = edgeType === "calculation" ? "calc" : "ref";
    return `${prefix}-${sourceHandle}->${targetHandle}`;
};

/**
 * Extract field name from handle
 * @param {string} handle - Handle ID (format: ${nodeId}-${fieldName})
 * @param {string} nodeId - Node ID
 * @returns {string} Field name
 */
export const extractFieldName = (handle, nodeId) => {
    return handle.replace(`${nodeId}-`, "");
};

/**
 * Create edge object with appropriate styling
 * @param {Object} config - Edge configuration
 * @returns {Object} Edge object
 */
export const createEdge = (config) => {
    const { id, ref_type, source, target, sourceHandle, targetHandle } = config;
    const isCalcEdge = ref_type === "calculation";

    return {
        id,
        ref_type,
        type: "step", // Use step for better parallel edge separation
        source,
        target,
        sourceHandle,
        targetHandle,
        animated: !isCalcEdge,
        style: isCalcEdge
            ? { 
                stroke: "#0066ff", 
                strokeDasharray: "8,4", // More visible dash pattern
                strokeWidth: 3, // Thicker for better visibility
            }
            : { 
                stroke: "#ef4444", // More vibrant red
                strokeWidth: 3, // Thicker for better visibility
            },
        // Better edge routing with more separation
        pathOptions: {
            offset: 10, // Increased offset for parallel edges
            borderRadius: 10, // Smooth curves
        },
        // Add marker for better visibility
        markerEnd: {
            type: "arrowclosed",
            color: isCalcEdge ? "#0066ff" : "#ef4444",
        },
    };
};

/**
 * Parse reference string into entity and field
 * @param {string} ref - Reference string (format: entity.field)
 * @returns {Object} Object with entity and field
 */
export const parseReference = (ref) => {
    const [entity, field] = ref.split(".");
    return { entity, field };
};

/**
 * Create reference string from entity and field
 * @param {string} entity - Entity name
 * @param {string} field - Field name
 * @returns {string} Reference string
 */
export const createReference = (entity, field) => {
    return `${entity}.${field}`;
};

/**
 * Get handle ID from node and field
 * @param {string} nodeId - Node ID
 * @param {string} fieldName - Field name
 * @returns {string} Handle ID
 */
export const getHandleId = (nodeId, fieldName) => {
    return `${nodeId}-${fieldName}`;
};

