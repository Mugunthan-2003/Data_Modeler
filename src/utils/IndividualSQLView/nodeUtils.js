/**
 * Update field in node's fields array
 * @param {Array} fields - Array of field objects
 * @param {string} fieldName - Field name to update
 * @param {Function} updater - Function that receives field and returns updated field
 * @returns {Array} Updated fields array
 */
export const updateFieldInFields = (fields, fieldName, updater) => {
    return fields.map((field) => {
        if (field.name === fieldName) {
            return updater(field);
        }
        return field;
    });
};

/**
 * Update node in nodes array
 * @param {Array} nodes - Array of node objects
 * @param {string} nodeId - Node ID to update
 * @param {Function} updater - Function that receives node and returns updated node
 * @returns {Array} Updated nodes array
 */
export const updateNodeInNodes = (nodes, nodeId, updater) => {
    return nodes.map((node) => {
        if (node.id === nodeId) {
            return updater(node);
        }
        return node;
    });
};

/**
 * Generate unique table name
 * @param {Array} nodes - Existing nodes array
 * @param {string} baseName - Base name for the table (default: 'NewTable')
 * @returns {string} Unique table name
 */
export const generateUniqueTableName = (nodes, baseName = "NewTable") => {
    let tableNumber = 1;
    let tableName = `${baseName}_${tableNumber}`;
    while (nodes.some((n) => n.id === tableName)) {
        tableNumber++;
        tableName = `${baseName}_${tableNumber}`;
    }
    return tableName;
};

/**
 * Calculate center position for new node
 * @param {number} headerHeight - Height of header
 * @param {number} nodeWidth - Width of node
 * @returns {Object} Position object with x and y
 */
export const calculateCenterPosition = (headerHeight = 56, nodeWidth = 300) => {
    const reactFlowContainerWidth = window.innerWidth;
    const reactFlowContainerHeight = window.innerHeight - headerHeight;
    const centerX = reactFlowContainerWidth / 2 - nodeWidth / 2;
    const centerY = reactFlowContainerHeight / 2 - 30;
    return { x: centerX, y: centerY };
};

