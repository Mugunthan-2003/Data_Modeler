export const mergedJsonToVisNetwork = (mergedData) => {
    const visNodes = [];
    const visEdges = [];
    const nodeMap = new Map();

    const sourceEntities = mergedData.SOURCE_entities || [];
    const targetEntities = mergedData.TARGET_entities || {};

    const defaultSourceColor = "#cbd5e1";
    const defaultTargetColor = "#86efac";

    sourceEntities.forEach((entityName) => {
        const sourceNodeId = `SOURCE_${entityName}`;
        if (!nodeMap.has(sourceNodeId)) {
            visNodes.push({
                id: sourceNodeId,
                label: entityName,
                color: defaultSourceColor,
                font: { color: "#475569", size: 12 },
                shape: "dot",
                size: 30,
            });
            nodeMap.set(sourceNodeId, "source");
            nodeMap.set(entityName, sourceNodeId);
        }
    });

    Object.keys(targetEntities).forEach((targetName) => {
        const targetNodeId = `TARGET_${targetName}`;

        if (!nodeMap.has(targetNodeId)) {
            visNodes.push({
                id: targetNodeId,
                label: targetName,
                color: defaultTargetColor,
                font: { color: "#166534", size: 12 },
                shape: "dot",
                size: 30,
            });
            nodeMap.set(targetNodeId, "target");
        }

        const refs = targetEntities[targetName].ref || [];
        refs.forEach((sourceName) => {
            let sourceNodeId = nodeMap.get(sourceName);
            if (!sourceNodeId) {
                sourceNodeId = `SOURCE_${sourceName}`;
                if (!nodeMap.has(sourceNodeId)) {
                    visNodes.push({
                        id: sourceNodeId,
                        label: sourceName,
                        color: defaultSourceColor,
                        font: { color: "#475569", size: 12 },
                        shape: "dot",
                        size: 30,
                    });
                    nodeMap.set(sourceNodeId, "source");
                    nodeMap.set(sourceName, sourceNodeId);
                }
            }

            const edgeId = `${sourceNodeId}-${targetNodeId}`;
            visEdges.push({
                id: edgeId,
                from: sourceNodeId,
                to: targetNodeId,
                color: { color: "#94a3b8" },
                width: 2,
                arrows: { to: { enabled: false } },
            });
        });
    });

    return { nodes: visNodes, edges: visEdges, nodeMap };
};
