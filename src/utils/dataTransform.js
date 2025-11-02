// src/utils/dataTransform.js
import rawModel from "../grok_output/VendorPerformance.json";

/**
 * Transforms the raw model data into ReactFlow nodes and edges
 * @returns {Object} Object containing nodes and edges arrays
 */
export function modelToFlow() {
  const nodes = [];
  const edges = [];
  let y = 0;
  const rowHeight = 180;

  Object.entries(rawModel.entities).forEach(([entityName, entity]) => {
    const isViewOrCTE = entityName.includes("CTE_") || entityName.includes("VIEW_");
    const nodeId = entityName;

    nodes.push({
      id: nodeId,
      type: "tableNode",
      position: { x: 0, y },
      data: {
        label: entityName,
        alias: entity.alias || "",
        fields: Object.entries(entity.fields).map(([fname, fdata]) => ({
          name: fname,
          ...fdata,
        })),
        isViewOrCTE,
      },
    });

    // Normal ref edges
    Object.entries(entity.fields).forEach(([fieldName, field]) => {
      if (field.ref) {
        field.ref.forEach((ref) => {
          const [sourceEntity, sourceField] = ref.split(".");
          edges.push({
            id: `ref-${sourceEntity}.${sourceField}->${entityName}.${fieldName}`,
            ref_type: "normal",
            type: "smoothstep",
            source: sourceEntity,
            target: entityName,
            sourceHandle: `${sourceEntity}-${sourceField}`,
            targetHandle: `${entityName}-${fieldName}`,
            animated: true,
            style: { stroke: "#fd5d5dff" },
          });
        });
      }

      // Calculation edges
      if (field.calculation?.ref) {
        field.calculation.ref.forEach((ref) => {
          const [srcE, srcF] = ref.split(".");
          edges.push({
            id: `calc-${srcE}.${srcF}->${entityName}.${fieldName}`,
            ref_type: "calculation",
            source: srcE,
            type: "smoothstep",
            target: entityName,
            sourceHandle: `${srcE}-${srcF}`,
            targetHandle: `${entityName}-${fieldName}`,
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

