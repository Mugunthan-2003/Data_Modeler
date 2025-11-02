/**
 * Converts ReactFlow nodes and edges back to the JSON model format
 * @param {Array} nodes - Array of ReactFlow nodes
 * @param {Array} edges - Array of ReactFlow edges
 * @returns {Object} JSON model in the format matching AccountsPayable.json
 */
export function flowToModel(nodes, edges) {
    const entities = {};

    // Process each node
    nodes.forEach((node) => {
        const entityName = node.data.label || node.id;
        const alias = node.data.alias || "";
        
        const entity = {
            ...(alias && { alias }),
            fields: {},
        };

        // Process each field in the node
        if (node.data.fields) {
            node.data.fields.forEach((field) => {
                const fieldName = field.name;
                const fieldData = {};

                // Collect normal references from edges
                const normalRefsFromEdges = edges
                    .filter(
                        (e) =>
                            e.ref_type === "normal" &&
                            e.target === entityName &&
                            e.targetHandle === `${entityName}-${fieldName}`
                    )
                    .map((e) => {
                        const sourceFieldName = e.sourceHandle.replace(
                            `${e.source}-`,
                            ""
                        );
                        return `${e.source}.${sourceFieldName}`;
                    });

                // Collect calculation references from edges
                const calcRefsFromEdges = edges
                    .filter(
                        (e) =>
                            e.ref_type === "calculation" &&
                            e.target === entityName &&
                            e.targetHandle === `${entityName}-${fieldName}`
                    )
                    .map((e) => {
                        const sourceFieldName = e.sourceHandle.replace(
                            `${e.source}-`,
                            ""
                        );
                        return `${e.source}.${sourceFieldName}`;
                    });

                // Merge existing refs from field data with refs from edges
                // Remove duplicates
                const existingRefs = field.ref || [];
                const allNormalRefs = [...new Set([...existingRefs, ...normalRefsFromEdges])];
                
                // Handle calculation
                // Use calculation from field data if it exists, otherwise build from edges
                let calculation = null;
                if (field.calculation) {
                    // Use existing calculation expression and refs
                    const calcRefs = field.calculation.ref || [];
                    // Merge with refs from calculation edges
                    const allCalcRefs = [...new Set([...calcRefs, ...calcRefsFromEdges])];
                    
                    calculation = {
                        expression: field.calculation.expression || "",
                        ref: allCalcRefs,
                    };
                } else if (calcRefsFromEdges.length > 0) {
                    // No calculation object but we have calculation edges
                    // This shouldn't normally happen, but handle it gracefully
                    calculation = {
                        expression: "",
                        ref: calcRefsFromEdges,
                    };
                }

                // Match the format: if field has no refs and no calculation, use empty object {}
                // Otherwise include ref array and/or calculation
                if (allNormalRefs.length === 0 && !calculation) {
                    // Simple field with no refs or calculations - use empty object
                    entity.fields[fieldName] = {};
                } else {
                    // Field has refs or calculations - include them
                    if (allNormalRefs.length > 0) {
                        fieldData.ref = allNormalRefs;
                    } else {
                        // Some fields in the format have ref: [] even when empty
                        // especially when there's a calculation
                        fieldData.ref = [];
                    }
                    
                    if (calculation) {
                        fieldData.calculation = calculation;
                    }
                    
                    entity.fields[fieldName] = fieldData;
                }
            });
        }

        entities[entityName] = entity;
    });

    return {
        entities,
    };
}

