import dagre from "dagre";

/**
 * Calculate node dimensions
 */
const getNodeDimensions = (node) => {
    const fieldRows = node.data.fields?.length ?? 0;
    const headerHeight = 50;
    const fieldListPadding = 16;
    const fieldRowHeight = 38;
    const height = headerHeight + fieldListPadding + (fieldRows * fieldRowHeight);
    const width = 380;
    return { width, height };
};

/**
 * Build hierarchical structure from edges
 */
const buildHierarchy = (nodes, edges) => {
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    const childrenMap = new Map();
    const parents = new Set();
    
    edges.forEach((edge) => {
        if (!childrenMap.has(edge.target)) {
            childrenMap.set(edge.target, []);
        }
        childrenMap.get(edge.target).push(edge.source);
        parents.add(edge.source);
    });
    
    // Find root nodes (nodes with no incoming edges)
    const roots = nodes.filter((node) => !parents.has(node.id));
    
    return { childrenMap, roots, nodeMap };
};

/**
 * Hierarchical layout using Dagre (ELK-like approach)
 * @param {Array} nodes - Array of node objects
 * @param {Array} edges - Array of edge objects
 * @param {string} direction - Layout direction (LR, TB, BT, RL)
 * @returns {Object} Object containing layouted nodes and edges
 */
export const getHierarchicalLayout = (nodes, edges, direction = "TB") => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    
    dagreGraph.setGraph({
        rankdir: direction,
        nodesep: 400, // Significantly increased spacing for hierarchical layout
        ranksep: 550, // Much more vertical space for edges
        align: 'UL',
        // Hierarchical layout optimized for tree-like structures
        acyclicer: 'greedy',
        edgesep: 45, // Increased edge separation in hierarchical layout
        marginx: 100,
        marginy: 100,
    });

    // Add nodes with dimensions
    nodes.forEach((node) => {
        const { width, height } = getNodeDimensions(node);
        dagreGraph.setNode(node.id, { width, height });
    });
    
    // Add edges
    edges.forEach((edge) => dagreGraph.setEdge(edge.source, edge.target));
    
    // Run layout
    dagre.layout(dagreGraph);

    return {
        nodes: nodes.map((node) => {
            const pos = dagreGraph.node(node.id);
            return {
                ...node,
                position: {
                    x: pos.x - pos.width / 2,
                    y: pos.y - pos.height / 2,
                },
            };
        }),
        edges,
    };
};

/**
 * Tree layout - organizes nodes in a tree structure
 * @param {Array} nodes - Array of node objects
 * @param {Array} edges - Array of edge objects
 * @param {string} direction - Tree direction (TB, BT, LR, RL)
 * @returns {Object} Object containing layouted nodes and edges
 */
export const getTreeLayout = (nodes, edges, direction = "TB") => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    
    dagreGraph.setGraph({
        rankdir: direction,
        nodesep: 380, // Significantly increased spacing for tree layout
        ranksep: 500, // Much more space between tree levels
        align: 'UL',
        // Tree layout optimized for hierarchical tree structures
        acyclicer: 'greedy',
        edgesep: 40, // Increased edge separation in tree layout
        marginx: 100,
        marginy: 100,
    });

    // Add nodes with dimensions
    nodes.forEach((node) => {
        const { width, height } = getNodeDimensions(node);
        dagreGraph.setNode(node.id, { width, height });
    });
    
    // Add edges
    edges.forEach((edge) => dagreGraph.setEdge(edge.source, edge.target));
    
    // Run layout
    dagre.layout(dagreGraph);

    return {
        nodes: nodes.map((node) => {
            const pos = dagreGraph.node(node.id);
            return {
                ...node,
                position: {
                    x: pos.x - pos.width / 2,
                    y: pos.y - pos.height / 2,
                },
            };
        }),
        edges,
    };
};

/**
 * Standard Dagre layout (original implementation)
 * @param {Array} nodes - Array of node objects
 * @param {Array} edges - Array of edge objects
 * @param {string} direction - Layout direction (LR, TB, BT, RL)
 * @returns {Object} Object containing layouted nodes and edges
 */
export const getLayoutedElements = (nodes, edges, direction = "LR") => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    
    dagreGraph.setGraph({
        rankdir: direction,
        nodesep: 250, // Reduced horizontal spacing for more compact layout
        ranksep: 350, // Reduced vertical spacing for more compact layout
        align: 'UL',
        // Improved edge routing with compact spacing
        edgesep: 30, // Reduced separation between parallel edges
        ranker: 'network-simplex', // Better algorithm for edge routing
        // Reduced margins for more compact layout
        marginx: 50, // Reduced horizontal margin
        marginy: 50, // Reduced vertical margin
    });

    // Add nodes with dimensions
    nodes.forEach((node) => {
        const { width, height } = getNodeDimensions(node);
        dagreGraph.setNode(node.id, { width, height });
    });
    
    edges.forEach((edge) => dagreGraph.setEdge(edge.source, edge.target));
    dagre.layout(dagreGraph);

    return {
        nodes: nodes.map((node) => {
            const pos = dagreGraph.node(node.id);
            return {
                ...node,
                position: {
                    x: pos.x - pos.width / 2,
                    y: pos.y - pos.height / 2,
                },
            };
        }),
        edges,
    };
};

/**
 * Main layout function - always uses dagre layout
 * @param {Array} nodes - Array of node objects
 * @param {Array} edges - Array of edge objects
 * @param {string} layoutType - Not used (kept for compatibility)
 * @param {string} direction - Layout direction: 'LR' or 'RL'
 * @returns {Object} Object containing layouted nodes and edges
 */
export const applyLayout = (nodes, edges, layoutType = 'dagre', direction = 'LR') => {
    // Always use dagre layout, only support LR and RL directions
    const validDirection = direction === 'RL' ? 'RL' : 'LR';
    return getLayoutedElements(nodes, edges, validDirection);
};

