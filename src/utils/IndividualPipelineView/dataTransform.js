export function modelToFlow(modelData = {}) {
    const nodes = [];
    const edges = [];
    let y = 0;
    const rowHeight = 180;

    const sourceEntities = modelData.source_entities || {};
    const targetEntities = modelData.target_entities || {};

    Object.entries(sourceEntities).forEach(([entityName, entity]) => {
        const nodeId = `SOURCE_${entityName}`;
        
        nodes.push({
            id: nodeId,
            type: "tableNode",
            position: { x: 0, y },
            data: {
                label: entityName,
                alias: entity.alias || "",
                source_path: entity.source_path || "",
                fields: Object.entries(entity.fields || {}).map(([fname, fdata]) => ({
                    name: fname,
                    ...fdata,
                })),
                tableType: "SOURCE",
                nodeId: nodeId,
            },
        });

        y += rowHeight;
    });

    Object.entries(targetEntities).forEach(([entityName, entity]) => {
        const nodeId = `TARGET_${entityName}`;
        
        nodes.push({
            id: nodeId,
            type: "tableNode",
            position: { x: 0, y },
            data: {
                label: entityName,
                alias: entity.alias || "",
                source_path: entity.source_path || "",
                fields: Object.entries(entity.fields || {}).map(([fname, fdata]) => ({
                    name: fname,
                    ...fdata,
                })),
                tableType: "TARGET",
                nodeId: nodeId,
            },
        });

        Object.entries(entity.fields || {}).forEach(([fieldName, field]) => {
            if (field.ref) {
                field.ref.forEach((ref) => {
                    const lastDot = ref.lastIndexOf(".");
                    const sourceEntity = ref.substring(0, lastDot);
                    const sourceField = ref.substring(lastDot + 1);
                    const sourceNodeId = `SOURCE_${sourceEntity}`;
                    
                    edges.push({
                        id: `ref-${sourceNodeId}.${sourceField}->${nodeId}.${fieldName}`,
                        ref_type: "normal",
                        type: "smoothstep",
                        source: sourceNodeId,
                        target: nodeId,
                        sourceHandle: `${sourceNodeId}-${sourceField}`,
                        targetHandle: `${nodeId}-${fieldName}`,
                        animated: true,
                        style: { stroke: "#fd5d5dff" },
                    });
                });
            }

            if (field.calculation?.ref) {
                field.calculation.ref.forEach((ref) => {
                    const lastDot = ref.lastIndexOf(".");
                    const srcE = ref.substring(0, lastDot);
                    const srcF = ref.substring(lastDot + 1);
                    const sourceNodeId = `SOURCE_${srcE}`;
                    
                    edges.push({
                        id: `calc-${sourceNodeId}.${srcF}->${nodeId}.${fieldName}`,
                        ref_type: "calculation",
                        source: sourceNodeId,
                        type: "smoothstep",
                        target: nodeId,
                        sourceHandle: `${sourceNodeId}-${srcF}`,
                        targetHandle: `${nodeId}-${fieldName}`,
                        animated: false,
                        style: { stroke: "#0066ff", strokeDasharray: "5,5" },
                    });
                });
            }
        });

        y += rowHeight;
    });

    return { nodes, edges };
}

export function extractTableType(entityName) {
    if (entityName.startsWith("SOURCE_")) return "SOURCE";
    if (entityName.startsWith("TARGET_")) return "TARGET";
    return null;
}

export function removeTablePrefix(entityName) {
    if (entityName.startsWith("SOURCE_")) {
        return entityName.substring(7);
    }
    if (entityName.startsWith("TARGET_")) {
        return entityName.substring(7);
    }
    return entityName;
}

export function addTablePrefix(entityName, tableType) {
    if (tableType === "SOURCE") return `SOURCE_${entityName}`;
    if (tableType === "TARGET") return `TARGET_${entityName}`;
    return entityName;
}
