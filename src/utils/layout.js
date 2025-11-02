import dagre from "dagre";

/**
 * Calculate layout positions for nodes and edges using dagre
 * @param {Array} nodes - Array of node objects
 * @param {Array} edges - Array of edge objects
 * @param {string} direction - Layout direction (LR, TB, etc.)
 * @returns {Object} Object containing layouted nodes and edges
 */
export const getLayoutedElements = (nodes, edges, direction = "LR") => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({
        rankdir: direction,
        nodesep: 120,
        ranksep: 200,
    });

    nodes.forEach((n) => {
        const fieldRows = n.data.fields?.length ?? 0;
        const height = 60 + fieldRows * 22;
        dagreGraph.setNode(n.id, { width: 300, height });
    });
    edges.forEach((e) => dagreGraph.setEdge(e.source, e.target));
    dagre.layout(dagreGraph);

    return {
        nodes: nodes.map((n) => {
            const pos = dagreGraph.node(n.id);
            return {
                ...n,
                position: {
                    x: pos.x - pos.width / 2,
                    y: pos.y - pos.height / 2,
                },
            };
        }),
        edges,
    };
};

