function addTablePrefix(displayName, tableType) {
    if (tableType === "SOURCE") return `SOURCE_${displayName}`;
    if (tableType === "TARGET") return `TARGET_${displayName}`;
    return displayName;
}

export function flowToModel(nodes, edges) {
    const source_entities = {};
    const target_entities = {};

    nodes.forEach((node) => {
        const displayName = node.data.label || node.id;
        const tableType = node.data.tableType || "SOURCE";
        let entityName;
        
        if (node.id.startsWith("SOURCE_") || node.id.startsWith("TARGET_")) {
            entityName = displayName;
        } else {
            entityName = displayName;
        }
        
        const alias = node.data.alias || "";
        const source_path = node.data.source_path || "";
        
        const entity = {};
        if (alias) entity.alias = alias;
        if (source_path) entity.source_path = source_path;
        entity.fields = {};

        if (node.data.fields) {
            node.data.fields.forEach((field) => {
                const fieldName = field.name;
                const fieldData = {};

                const normalRefsFromEdges = edges
                    .filter(
                        (e) =>
                            e.ref_type === "normal" &&
                            e.target === node.id &&
                            e.targetHandle === `${node.id}-${fieldName}`
                    )
                    .map((e) => {
                        const sourceFieldName = e.sourceHandle.replace(`${e.source}-`, "");
                        const sourceNode = nodes.find((n) => n.id === e.source);
                        const sourceEntityName = sourceNode ? sourceNode.data.label : e.source.replace("SOURCE_", "").replace("TARGET_", "");
                        return `${sourceEntityName}.${sourceFieldName}`;
                    });

                const calcRefsFromEdges = edges
                    .filter(
                        (e) =>
                            e.ref_type === "calculation" &&
                            e.target === node.id &&
                            e.targetHandle === `${node.id}-${fieldName}`
                    )
                    .map((e) => {
                        const sourceFieldName = e.sourceHandle.replace(`${e.source}-`, "");
                        const sourceNode = nodes.find((n) => n.id === e.source);
                        const sourceEntityName = sourceNode ? sourceNode.data.label : e.source.replace("SOURCE_", "").replace("TARGET_", "");
                        return `${sourceEntityName}.${sourceFieldName}`;
                    });

                let existingRefs = field.ref || [];
                existingRefs = existingRefs.map((ref) => {
                    const [refEntity, refField] = ref.split(".");
                    if (!refEntity) return ref;
                    const refNode = nodes.find((n) => n.data?.label === refEntity || n.id === `SOURCE_${refEntity}` || n.id === `TARGET_${refEntity}`);
                    if (refNode) {
                        return `${refNode.data.label}.${refField}`;
                    }
                    return ref;
                });
                
                const allNormalRefs = [...new Set([...existingRefs, ...normalRefsFromEdges])];
                
                let calculation = null;
                if (field.calculation) {
                    let calcRefs = field.calculation.ref || [];
                    calcRefs = calcRefs.map((ref) => {
                        const [refEntity, refField] = ref.split(".");
                        if (!refEntity) return ref;
                        const refNode = nodes.find((n) => n.data?.label === refEntity || n.id === `SOURCE_${refEntity}` || n.id === `TARGET_${refEntity}`);
                        if (refNode) {
                            return `${refNode.data.label}.${refField}`;
                        }
                        return ref;
                    });
                    const allCalcRefs = [...new Set([...calcRefs, ...calcRefsFromEdges])];
                    
                    calculation = {
                        expression: field.calculation.expression || "",
                        ref: allCalcRefs,
                    };
                } else if (calcRefsFromEdges.length > 0) {
                    calculation = {
                        expression: "",
                        ref: calcRefsFromEdges,
                    };
                }

                if (allNormalRefs.length === 0 && !calculation) {
                    entity.fields[fieldName] = {};
                } else {
                    if (allNormalRefs.length > 0) {
                        fieldData.ref = allNormalRefs;
                    }

                    if (calculation) {
                        fieldData.calculation = calculation;
                    }

                    entity.fields[fieldName] = fieldData;
                }
            });
        }

        if (tableType === "SOURCE") {
            source_entities[entityName] = entity;
        } else if (tableType === "TARGET") {
            target_entities[entityName] = entity;
        }
    });

    return {
        source_entities,
        target_entities,
    };
}
