export const mergedJsonToVisNetwork = (mergedData) => {
    const visNodes = [];
    const visEdges = [];
    const nodeMap = new Map();

    const sourceEntities = mergedData.SOURCE_entities || [];
    const targetEntities = mergedData.TARGET_entities || {};

    const defaultSourceColor = "#cbd5e1";
    const defaultTargetColor = "#86efac";
    const sourceHighlightColor = "#64748b";
    const targetHighlightColor = "#16a34a";

    sourceEntities.forEach((entityName) => {
        if (!nodeMap.has(entityName)) {
            visNodes.push({
                id: entityName,
                label: entityName,
                color: defaultSourceColor,
                font: { color: "#475569", size: 12 },
                shape: "dot",
                size: 30,
            });
            nodeMap.set(entityName, "source");
        }
    });

    Object.keys(targetEntities).forEach((targetName) => {
        if (!nodeMap.has(targetName)) {
            visNodes.push({
                id: targetName,
                label: targetName,
                color: defaultTargetColor,
                font: { color: "#166534", size: 12 },
                shape: "dot",
                size: 30,
            });
            nodeMap.set(targetName, "target");
        }

        const refs = targetEntities[targetName].ref || [];
        refs.forEach((sourceName) => {
            if (!nodeMap.has(sourceName)) {
                visNodes.push({
                    id: sourceName,
                    label: sourceName,
                    color: defaultSourceColor,
                    font: { color: "#475569", size: 12 },
                    shape: "dot",
                    size: 30,
                });
                nodeMap.set(sourceName, "source");
            }

            const edgeId = `${sourceName}-${targetName}`;
            visEdges.push({
                id: edgeId,
                from: sourceName,
                to: targetName,
                color: { color: "#94a3b8" },
                width: 2,
                arrows: { to: { enabled: false } },
            });
        });
    });

    return { nodes: visNodes, edges: visEdges, nodeMap };
};

