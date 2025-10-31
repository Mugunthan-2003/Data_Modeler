// src/data.js
// import rawModel from "./grok_output/VendorLeadTimeOverview.json";
import rawModel from "./grok_output/AccountsPayable.json";

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

    // Add edges based on "ref"
    Object.entries(entity.fields).forEach(([fieldName, field]) => {
      if (field.ref) {
        field.ref.forEach((ref) => {
          const [sourceEntity, sourceField] = ref.split(".");
          edges.push({
            id: `${sourceEntity}.${sourceField}->${entityName}.${fieldName}`,
            source: sourceEntity,
            target: entityName,
            sourceHandle: `${sourceEntity}-${sourceField}`,
            targetHandle: `${entityName}-${fieldName}`,
            type: "smoothstep",
            animated: true,
            style: { stroke: "#fd5d5dff", margin: "0 20px" },
          });
        });
      }

      // Add dashed edges for calculations
      if (field.calculation?.ref) {
        field.calculation.ref.forEach((ref) => {
          const [srcE, srcF] = ref.split(".");
          edges.push({
            id: `calc-${srcE}.${srcF}->${entityName}.${fieldName}`,
            source: srcE,
            target: entityName,
            sourceHandle: `${srcE}-${srcF}`,
            targetHandle: `${entityName}-${fieldName}`,
            type: "smoothstep",
            animated: false,
            style: { stroke: "#0066ffff", strokeDasharray: "5,5" },
          });
        });
      }
    });

    y += rowHeight;
  });

  return { nodes, edges };
}
