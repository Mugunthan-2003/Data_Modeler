export const updateFieldInFields = (fields, fieldName, updater) => {
    return fields.map((field) => {
        if (field.name === fieldName) {
            return updater(field);
        }
        return field;
    });
};

export const updateNodeInNodes = (nodes, nodeId, updater) => {
    return nodes.map((node) => {
        if (node.id === nodeId) {
            return updater(node);
        }
        return node;
    });
};

export const generateUniqueTableName = (nodes, baseName = "NewTable") => {
    let tableNumber = 1;
    let tableName = `${baseName}_${tableNumber}`;
    while (nodes.some((n) => n.id === `SOURCE_${tableName}` || n.id === `TARGET_${tableName}` || n.data?.label === tableName)) {
        tableNumber++;
        tableName = `${baseName}_${tableNumber}`;
    }
    return tableName;
};

export const calculateCenterPosition = (headerHeight = 56, nodeWidth = 300) => {
    const reactFlowContainerWidth = window.innerWidth;
    const reactFlowContainerHeight = window.innerHeight - headerHeight;
    const centerX = reactFlowContainerWidth / 2 - nodeWidth / 2;
    const centerY = reactFlowContainerHeight / 2 - 30;
    return { x: centerX, y: centerY };
};
