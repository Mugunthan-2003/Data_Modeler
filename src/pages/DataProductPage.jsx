import { useState, useCallback, useEffect, memo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiPackage, FiDatabase, FiPlus, FiSave, FiTrash2, FiSearch, FiEdit2, FiChevronsRight, FiChevronsLeft } from "react-icons/fi";
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    MarkerType,
    Handle,
    Position,
} from "reactflow";
import "reactflow/dist/style.css";
import { getFile, saveDataProduct } from "../utils/fileStorage";

// Custom Table Node Component
const TableNode = memo(({ data, id }) => {
    const getTypeColor = (type) => {
        switch (type) {
            case 'BASE': return { from: '#3b82f6', to: '#2563eb', border: '#3b82f6' };
            case 'CTE': return { from: '#8b5cf6', to: '#7c3aed', border: '#8b5cf6' };
            case 'VIEW': return { from: '#10b981', to: '#059669', border: '#10b981' };
            default: return { from: '#3b82f6', to: '#2563eb', border: '#3b82f6' };
        }
    };

    const colors = getTypeColor(data.tableType);

    return (
        <div style={{
            background: 'white',
            border: `2px solid ${colors.border}`,
            borderRadius: '8px',
            minWidth: '280px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            position: 'relative'
        }}>
            <div style={{
                fontWeight: 'bold',
                fontSize: '14px',
                padding: '12px 16px',
                background: `linear-gradient(135deg, ${colors.from} 0%, ${colors.to} 100%)`,
                color: 'white',
                borderTopLeftRadius: '6px',
                borderTopRightRadius: '6px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div>
                    <div>{data.tableName}</div>
                    <div style={{ fontSize: '10px', opacity: 0.9, marginTop: '2px' }}>
                        {data.tableType}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            data.onAddField(id);
                        }}
                        style={{
                            background: 'rgba(255, 255, 255, 0.2)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            borderRadius: '4px',
                            color: 'white',
                            cursor: 'pointer',
                            padding: '4px 8px',
                            fontSize: '11px',
                            fontWeight: 600
                        }}
                        title="Add Field"
                    >
                        + Field
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            data.onDeleteTable(id);
                        }}
                        style={{
                            background: 'rgba(239, 68, 68, 0.8)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            borderRadius: '4px',
                            color: 'white',
                            cursor: 'pointer',
                            padding: '4px 8px',
                            fontSize: '11px',
                            fontWeight: 600
                        }}
                        title="Delete Table"
                    >
                        ✕
                    </button>
                </div>
            </div>
            <div style={{ padding: '8px 0', minHeight: '50px' }}>
                {data.fields.length === 0 ? (
                    <div style={{
                        padding: '20px',
                        textAlign: 'center',
                        color: '#9ca3af',
                        fontSize: '12px'
                    }}>
                        No fields yet. Click "+ Field" to add.
                    </div>
                ) : (
                    data.fields.map((field, idx) => (
                        <div 
                            key={idx}
                            style={{
                                position: 'relative',
                                padding: '8px 16px',
                                fontSize: '12px',
                                color: '#1f2937',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: '8px',
                                background: idx % 2 === 0 ? '#f9fafb' : 'white',
                                borderLeft: '3px solid transparent',
                                transition: 'all 150ms ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#eff6ff';
                                e.currentTarget.style.borderLeftColor = colors.border;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = idx % 2 === 0 ? '#f9fafb' : 'white';
                                e.currentTarget.style.borderLeftColor = 'transparent';
                            }}
                        >
                            <Handle
                                type="target"
                                position={Position.Left}
                                id={`${field.name}-target`}
                                style={{
                                    left: -8,
                                    width: 12,
                                    height: 12,
                                    background: '#3b82f6',
                                    border: '2px solid white'
                                }}
                            />
                            <span style={{ fontWeight: 500, flex: 1 }}>{field.name}</span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    data.onRemoveField(id, field.name);
                                }}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#ef4444',
                                    cursor: 'pointer',
                                    padding: '2px 6px',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    borderRadius: '4px'
                                }}
                                title="Remove Field"
                            >
                                ✕
                            </button>
                            <Handle
                                type="source"
                                position={Position.Right}
                                id={`${field.name}-source`}
                                style={{
                                    right: -8,
                                    width: 12,
                                    height: 12,
                                    background: '#10b981',
                                    border: '2px solid white'
                                }}
                            />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
});

TableNode.displayName = 'TableNode';

const nodeTypes = {
    tableNode: TableNode,
};

const DataProductPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { distinctTables = [], selectedFileIds = [], dataProductData = null, dataProductId = null, dataProductName = null } = location.state || {};
    
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [tableMetadata, setTableMetadata] = useState({});
    const [fileBaseTables, setFileBaseTables] = useState([]);
    const [fileViewTables, setFileViewTables] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [selectedEdge, setSelectedEdge] = useState(null);
    const [showCreateTableDialog, setShowCreateTableDialog] = useState(false);
    const [newTableName, setNewTableName] = useState("");
    const [newTableType, setNewTableType] = useState("BASE");
    const [customTables, setCustomTables] = useState({ BASE: [], CTE: [], VIEW: [] });
    const [showAddFieldDialog, setShowAddFieldDialog] = useState(false);
    const [addFieldNodeId, setAddFieldNodeId] = useState(null);
    const [newFieldName, setNewFieldName] = useState("");
    const [newFieldType, setNewFieldType] = useState("VARCHAR");
    const [showDeleteFieldConfirm, setShowDeleteFieldConfirm] = useState(false);
    const [deleteFieldInfo, setDeleteFieldInfo] = useState({ nodeId: null, fieldName: null });
    const [activeTableTab, setActiveTableTab] = useState("BASE");
    const [sidebarSearchQuery, setSidebarSearchQuery] = useState("");
    const [showConnectionTypeDialog, setShowConnectionTypeDialog] = useState(false);
    const [selectedEdgeDetails, setSelectedEdgeDetails] = useState(null);
    const [showCalculationDialog, setShowCalculationDialog] = useState(false);
    const [calculationExpression, setCalculationExpression] = useState("");
    const [currentDataProductId, setCurrentDataProductId] = useState(dataProductId);
    const [currentDataProductName, setCurrentDataProductName] = useState(dataProductName);

    // Load data product only once on mount if provided
    useEffect(() => {
        if (dataProductData) {
            loadDataProduct(dataProductData);
        }
    }, []); // Run only once on mount

    // Load table metadata when creating new data product
    useEffect(() => {
        if (!dataProductData && selectedFileIds.length > 0) {
            loadTableMetadata();
        }
    }, [selectedFileIds]);

    const loadTableMetadata = async () => {
        const metadata = {};
        const baseTables = new Set();
        const viewTables = new Set();
        
        for (const fileId of selectedFileIds) {
            try {
                const fileData = await getFile(fileId);
                if (fileData && fileData.data && fileData.data.entities) {
                    for (const entityName in fileData.data.entities) {
                        // Process BASE tables
                        if (entityName.startsWith('BASE_')) {
                            const baseName = entityName.replace('BASE_', '');
                            baseTables.add(baseName);
                            const entity = fileData.data.entities[entityName];
                            if (!metadata[baseName]) {
                                metadata[baseName] = {
                                    name: baseName,
                                    type: 'BASE',
                                    fields: []
                                };
                            }
                            if (entity.fields) {
                                for (const fieldName in entity.fields) {
                                    const field = entity.fields[fieldName];
                                    if (!metadata[baseName].fields.some(f => f.name === fieldName)) {
                                        metadata[baseName].fields.push({
                                            name: fieldName,
                                            type: field.type || 'unknown'
                                        });
                                    }
                                }
                            }
                        }
                        // Process VIEW tables
                        else if (entityName.startsWith('VIEW_')) {
                            const viewName = entityName.replace('VIEW_', '');
                            viewTables.add(viewName);
                            const entity = fileData.data.entities[entityName];
                            if (!metadata[viewName]) {
                                metadata[viewName] = {
                                    name: viewName,
                                    type: 'VIEW',
                                    fields: []
                                };
                            }
                            if (entity.fields) {
                                for (const fieldName in entity.fields) {
                                    const field = entity.fields[fieldName];
                                    if (!metadata[viewName].fields.some(f => f.name === fieldName)) {
                                        metadata[viewName].fields.push({
                                            name: fieldName,
                                            type: field.type || 'unknown'
                                        });
                                    }
                                }
                            }
                        }
                        // Skip CTE_ entities - they won't be listed from files
                    }
                }
            } catch (error) {
                console.error(`Error loading metadata for file ${fileId}:`, error);
            }
        }
        
        setTableMetadata(metadata);
        setFileBaseTables(Array.from(baseTables).sort());
        setFileViewTables(Array.from(viewTables).sort());
    };

    const loadDataProduct = (dataProduct) => {
        try {
            const loadedNodes = [];
            const loadedEdges = [];
            const nodeMap = new Map(); // To track entity to node ID mapping
            
            // First pass: Create nodes from entities
            if (dataProduct.entities) {
                let nodeIndex = 0;
                for (const entityKey in dataProduct.entities) {
                    const entity = dataProduct.entities[entityKey];
                    
                    // Parse entity key (e.g., "BASE_users" -> type="BASE", name="users")
                    const parts = entityKey.split('_');
                    const tableType = parts[0];
                    const tableName = parts.slice(1).join('_');
                    
                    // Extract fields
                    const fields = [];
                    if (entity.fields) {
                        for (const fieldName in entity.fields) {
                            fields.push({
                                name: fieldName,
                                type: entity.fields[fieldName].type || 'unknown'
                            });
                        }
                    }
                    
                    // Create node
                    const nodeId = `node-${nodeIndex++}`;
                    nodeMap.set(entityKey, nodeId);
                    
                    loadedNodes.push({
                        id: nodeId,
                        type: 'tableNode',
                        position: { x: 100 + (nodeIndex * 320), y: 100 + ((nodeIndex % 3) * 250) },
                        data: {
                            tableName,
                            tableType,
                            fields,
                            onAddField: handleAddField,
                            onRemoveField: handleRemoveField,
                            onDeleteTable: handleDeleteTable
                        }
                    });
                }
            }
            
            // Second pass: Create edges from relationships
            if (dataProduct.relationships) {
                dataProduct.relationships.forEach((rel, idx) => {
                    const sourceNodeId = nodeMap.get(rel.from.entity);
                    const targetNodeId = nodeMap.get(rel.to.entity);
                    
                    if (sourceNodeId && targetNodeId) {
                        const edge = {
                            id: `edge-${idx}`,
                            source: sourceNodeId,
                            target: targetNodeId,
                            sourceHandle: `${rel.from.field}-source`,
                            targetHandle: `${rel.to.field}-target`,
                            type: 'default',
                            animated: false,
                            style: {
                                stroke: rel.type === 'calculation' ? '#8b5cf6' : '#3b82f6',
                                strokeWidth: 2
                            },
                            markerEnd: {
                                type: MarkerType.ArrowClosed,
                                color: rel.type === 'calculation' ? '#8b5cf6' : '#3b82f6'
                            },
                            data: {
                                connectionType: rel.type || 'ref',
                                calculation: rel.calculation || null
                            }
                        };
                        
                        loadedEdges.push(edge);
                    }
                });
            }
            
            // Set the loaded nodes and edges
            setNodes(loadedNodes);
            setEdges(loadedEdges);
            
            // Restore available tables if saved
            if (dataProduct.availableTables) {
                setTableMetadata(dataProduct.availableTables.tableMetadata || {});
                setFileBaseTables(dataProduct.availableTables.fileBaseTables || []);
                setFileViewTables(dataProduct.availableTables.fileViewTables || []);
                setCustomTables(dataProduct.availableTables.customTables || { BASE: [], CTE: [], VIEW: [] });
            }
            
            // Keep sidebar open to show available tables
            setSidebarOpen(true);
            
        } catch (error) {
            console.error('Error loading data product:', error);
            alert('Error loading data product: ' + error.message);
        }
    };

    const onConnect = useCallback(
        (params) => {
            // Check if source or target attribute already has a calculation connection
            const hasCalculationConnection = edges.some(edge => 
                (edge.sourceHandle === params.sourceHandle || edge.targetHandle === params.targetHandle) &&
                edge.data?.connectionType === 'calculation'
            );
            
            const connectionType = hasCalculationConnection ? 'calculation' : 'ref';
            const color = connectionType === 'calculation' ? '#8b5cf6' : '#3b82f6';
            
            const newEdge = {
                ...params,
                type: 'smoothstep',
                animated: true,
                markerEnd: { type: MarkerType.ArrowClosed },
                data: { connectionType, calculation: '' },
                style: { stroke: color, strokeWidth: 2 }
            };
            setEdges((eds) => addEdge(newEdge, eds));
        },
        [edges, setEdges]
    );

    const onEdgeClick = useCallback((event, edge) => {
        event.stopPropagation();
        setSelectedEdge(edge.id);
        setSelectedEdgeDetails(edge);
        // Highlight the selected edge
        setEdges((eds) =>
            eds.map((e) => {
                const isSelected = e.id === edge.id;
                const connectionType = e.data?.connectionType || 'ref';
                const baseColor = connectionType === 'calculation' ? '#8b5cf6' : '#3b82f6';
                return {
                    ...e,
                    style: {
                        ...e.style,
                        stroke: isSelected ? '#ef4444' : baseColor,
                        strokeWidth: isSelected ? 3 : 2,
                    },
                    animated: isSelected,
                };
            })
        );
    }, [setEdges]);

    const onPaneClick = useCallback(() => {
        setSelectedEdge(null);
        setSelectedEdgeDetails(null);
        // Reset all edges to default style based on connection type
        setEdges((eds) =>
            eds.map((e) => {
                const connectionType = e.data?.connectionType || 'ref';
                const color = connectionType === 'calculation' ? '#8b5cf6' : '#3b82f6';
                return {
                    ...e,
                    style: { stroke: color, strokeWidth: 2 },
                    animated: true,
                };
            })
        );
    }, [setEdges]);

    const deleteSelectedEdge = useCallback(() => {
        if (selectedEdge) {
            setEdges((eds) => eds.filter((e) => e.id !== selectedEdge));
            setSelectedEdge(null);
            setSelectedEdgeDetails(null);
        }
    }, [selectedEdge, setEdges]);

    const handleChangeConnectionType = useCallback((newType) => {
        if (selectedEdge) {
            setEdges((eds) =>
                eds.map((e) => {
                    if (e.id === selectedEdge) {
                        const color = newType === 'calculation' ? '#8b5cf6' : '#3b82f6';
                        return {
                            ...e,
                            data: { ...e.data, connectionType: newType, calculation: e.data?.calculation || '' },
                            style: { ...e.style, stroke: '#ef4444', strokeWidth: 3 },
                        };
                    }
                    return e;
                })
            );
            setSelectedEdgeDetails(prev => prev ? { ...prev, data: { ...prev.data, connectionType: newType } } : null);
        }
        setShowConnectionTypeDialog(false);
        
        // Open calculation dialog if calculation type is selected
        if (newType === 'calculation') {
            const edge = selectedEdgeDetails;
            setCalculationExpression(edge?.data?.calculation || '');
            setShowCalculationDialog(true);
        }
    }, [selectedEdge, selectedEdgeDetails, setEdges]);

    const handleSaveCalculation = useCallback(() => {
        if (selectedEdge) {
            setEdges((eds) =>
                eds.map((e) => {
                    if (e.id === selectedEdge) {
                        return {
                            ...e,
                            data: { ...e.data, calculation: calculationExpression },
                        };
                    }
                    return e;
                })
            );
            setSelectedEdgeDetails(prev => prev ? { ...prev, data: { ...prev.data, calculation: calculationExpression } } : null);
        }
        setShowCalculationDialog(false);
        setCalculationExpression('');
    }, [selectedEdge, calculationExpression, setEdges]);

    const handleEditCalculation = useCallback(() => {
        if (selectedEdgeDetails?.data?.connectionType === 'calculation') {
            setCalculationExpression(selectedEdgeDetails.data?.calculation || '');
            setShowCalculationDialog(true);
        }
    }, [selectedEdgeDetails]);

    // Keyboard shortcut for delete
    useEffect(() => {
        const handleKeyDown = (event) => {
            if ((event.key === 'Delete') && selectedEdge) {
                event.preventDefault();
                deleteSelectedEdge();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedEdge, deleteSelectedEdge]);

    const handleAddField = useCallback((nodeId) => {
        setAddFieldNodeId(nodeId);
        setShowAddFieldDialog(true);
    }, []);

    const handleConfirmAddField = useCallback(() => {
        if (!newFieldName.trim()) return;

        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === addFieldNodeId) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            fields: [...node.data.fields, { name: newFieldName, type: newFieldType }]
                        }
                    };
                }
                return node;
            })
        );

        setShowAddFieldDialog(false);
        setNewFieldName("");
        setNewFieldType("VARCHAR");
        setAddFieldNodeId(null);
    }, [newFieldName, newFieldType, addFieldNodeId, setNodes]);

    const handleRemoveField = useCallback((nodeId, fieldName) => {
        setDeleteFieldInfo({ nodeId, fieldName });
        setShowDeleteFieldConfirm(true);
    }, []);

    const handleConfirmRemoveField = useCallback(() => {
        const { nodeId, fieldName } = deleteFieldInfo;

        // Remove edges connected to this field
        setEdges((eds) => 
            eds.filter(edge => 
                !edge.sourceHandle?.includes(fieldName) && 
                !edge.targetHandle?.includes(fieldName)
            )
        );

        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === nodeId) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            fields: node.data.fields.filter(f => f.name !== fieldName)
                        }
                    };
                }
                return node;
            })
        );

        setShowDeleteFieldConfirm(false);
        setDeleteFieldInfo({ nodeId: null, fieldName: null });
    }, [deleteFieldInfo, setNodes, setEdges]);

    const handleDeleteTable = useCallback((nodeId) => {
        if (!window.confirm("Delete this table?")) return;
        
        // Remove edges connected to this node
        setEdges((eds) => eds.filter(edge => edge.source !== nodeId && edge.target !== nodeId));
        setNodes((nds) => nds.filter(node => node.id !== nodeId));
    }, [setNodes, setEdges]);

    const addTableToCanvas = (tableName, tableType = 'BASE', fields = []) => {
        const table = tableMetadata[tableName];
        // Use type from metadata if available, otherwise use passed tableType
        const actualType = table?.type || tableType;
        const finalFields = fields.length > 0 ? fields : (table?.fields || []);

        const newNode = {
            id: `table-${Date.now()}`,
            type: 'tableNode',
            position: { 
                x: Math.random() * 300 + 100, 
                y: Math.random() * 300 + 100 
            },
            data: { 
                tableName: tableName,
                tableType: actualType,
                fields: finalFields,
                onAddField: handleAddField,
                onRemoveField: handleRemoveField,
                onDeleteTable: handleDeleteTable
            }
        };

        setNodes((nds) => [...nds, newNode]);
    };

    const handleCreateNewTable = () => {
        if (!newTableName.trim()) {
            alert("Please enter a table name");
            return;
        }

        addTableToCanvas(newTableName, newTableType, []);
        setCustomTables(prev => ({
            ...prev,
            [newTableType]: [...prev[newTableType], newTableName]
        }));
        
        setNewTableName("");
        setNewTableType("BASE");
        setShowCreateTableDialog(false);
    };

    const handleSave = async () => {
        try {
            let finalFileName;
            
            // If already saved, use existing filename; otherwise prompt for new name
            if (currentDataProductName) {
                finalFileName = currentDataProductName;
            } else {
                const fileName = window.prompt('Enter data product name:', 'data_product.json');
                if (!fileName) return; // User cancelled
                
                // Ensure .json extension
                finalFileName = fileName.endsWith('.json') ? fileName : `${fileName}.json`;
            }
            
            // Build entities object in the same format as input JSON
            const entities = {};
            
            // Process each table node on canvas
            nodes.forEach(node => {
                const tableName = node.data.tableName;
                const tableType = node.data.tableType;
                const entityKey = `${tableType}_${tableName}`;
                
                // Create entity with fields
                entities[entityKey] = {
                    fields: {}
                };
                
                // Add each field (just field name, no type)
                node.data.fields.forEach(field => {
                    entities[entityKey].fields[field.name] = {};
                });
            });
            
            // Add relationships based on connections
            const relationships = [];
            edges.forEach(edge => {
                // Find source and target nodes
                const sourceNode = nodes.find(n => n.id === edge.source);
                const targetNode = nodes.find(n => n.id === edge.target);
                
                if (sourceNode && targetNode) {
                    // Extract field names from handles
                    const sourceField = edge.sourceHandle?.replace('-source', '');
                    const targetField = edge.targetHandle?.replace('-target', '');
                    
                    const relationship = {
                        from: {
                            entity: `${sourceNode.data.tableType}_${sourceNode.data.tableName}`,
                            field: sourceField
                        },
                        to: {
                            entity: `${targetNode.data.tableType}_${targetNode.data.tableName}`,
                            field: targetField
                        },
                        type: edge.data?.connectionType || 'ref'
                    };
                    
                    // Add calculation if it's a calculation type
                    if (edge.data?.connectionType === 'calculation' && edge.data?.calculation) {
                        relationship.calculation = edge.data.calculation;
                    }
                    
                    relationships.push(relationship);
                }
            });
            
            // Clean tableMetadata to remove type field from fields
            const cleanedTableMetadata = {};
            for (const tableName in tableMetadata) {
                const table = tableMetadata[tableName];
                cleanedTableMetadata[tableName] = {
                    name: table.name,
                    type: table.type,
                    fields: table.fields.map(field => ({ name: field.name }))
                };
            }
            
            // Create final data product structure
            const dataProduct = {
                entities,
                relationships,
                metadata: {
                    name: finalFileName.replace('.json', ''),
                    created: new Date().toISOString(),
                    tableCount: nodes.length,
                    connectionCount: edges.length
                },
                availableTables: {
                    tableMetadata: cleanedTableMetadata,
                    fileBaseTables,
                    fileViewTables,
                    customTables
                }
            };
            
            // Save to data_products folder using fileStorage utility
            const savedProduct = await saveDataProduct(finalFileName, dataProduct, currentDataProductId);
            
            // Update current data product name and ID after successful save
            setCurrentDataProductName(finalFileName);
            if (!currentDataProductId) {
                setCurrentDataProductId(savedProduct.id);
            }
            
            alert('Data product saved successfully!');
        } catch (error) {
            console.error('Error saving data product:', error);
            alert('Error saving data product: ' + error.message);
        }
    };

    return (
        <div
            style={{
                width: "100vw",
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                overflow: "hidden",
            }}
        >
            {/* Header */}
            <div
                style={{
                    background: "white",
                    borderBottom: "1px solid #e5e7eb",
                    padding: "16px 32px",
                    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "24px",
                    }}
                >
                    <button
                        onClick={() => navigate("/")}
                        style={{
                            background: "transparent",
                            border: "1px solid #e5e7eb",
                            borderRadius: "6px",
                            padding: "8px 12px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "13px",
                            fontWeight: 500,
                            color: "#6b7280",
                            transition: "all 200ms ease",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#f9fafb";
                            e.currentTarget.style.borderColor = "#d1d5db";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.borderColor = "#e5e7eb";
                        }}
                    >
                        <FiArrowLeft size={14} />
                        Back
                    </button>
                    
                    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "12px" }}>
                        <FiPackage size={20} color="#10b981" />
                        <h1
                            style={{
                                fontSize: "18px",
                                fontWeight: 600,
                                color: "#1f2937",
                                margin: 0,
                            }}
                        >
                            {currentDataProductName ? currentDataProductName.replace('.json', '') : 'New Data Product'}
                        </h1>
                        <div style={{ 
                            fontSize: "12px", 
                            color: "#9ca3af",
                            display: "flex",
                            gap: "12px",
                            marginLeft: "auto"
                        }}>
                            <span>{nodes.length} tables</span>
                            <span>•</span>
                            <span>{edges.length} connections</span>
                        </div>
                    </div>
                    
                    <button
                        onClick={handleSave}
                        style={{
                            background: "#10b981",
                            border: "none",
                            borderRadius: "6px",
                            padding: "8px 16px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "white",
                            transition: "all 200ms ease",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#059669";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "#10b981";
                        }}
                    >
                        <FiSave size={14} />
                        Save
                    </button>
                </div>
            </div>

            {/* Content */}
            <div
                style={{
                    flex: 1,
                    overflow: "hidden",
                    display: "flex",
                }}
            >
                {/* Sidebar */}
                <div
                    style={{
                        width: sidebarOpen ? "320px" : "0",
                        background: "white",
                        borderRight: "1px solid #e5e7eb",
                        overflow: "hidden",
                        transition: "width 200ms ease",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <div
                        style={{
                            padding: "20px 20px 16px 20px",
                            borderBottom: "1px solid #e5e7eb",
                            background: "#f9fafb",
                        }}
                    >
                        <h2
                            style={{
                                fontSize: "16px",
                                fontWeight: 600,
                                color: "#1f2937",
                                marginBottom: "12px",
                            }}
                        >
                            Available Tables
                        </h2>
                        <button
                            onClick={() => setShowCreateTableDialog(true)}
                            style={{
                                width: "100%",
                                padding: "8px 12px",
                                background: "#10b981",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "13px",
                                fontWeight: 600,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "6px",
                                transition: "all 200ms ease",
                                marginBottom: "12px",
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = "#059669";
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = "#10b981";
                            }}
                        >
                            <FiPlus size={14} />
                            Create New Table
                        </button>
                        
                        {/* Search Bar */}
                        <div
                            style={{
                                position: "relative",
                                marginBottom: "12px",
                            }}
                        >
                            <input
                                type="text"
                                placeholder="Search tables..."
                                value={sidebarSearchQuery}
                                onChange={(e) => setSidebarSearchQuery(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "8px 12px 8px 36px",
                                    border: "1px solid #d1d5db",
                                    borderRadius: "6px",
                                    fontSize: "13px",
                                    outline: "none",
                                    background: "white",
                                }}
                            />
                            <FiSearch
                                size={16}
                                style={{
                                    position: "absolute",
                                    left: "12px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    color: "#9ca3af",
                                }}
                            />
                        </div>
                    </div>

                    {/* Tabs */}
                    <div
                        style={{
                            display: "flex",
                            borderBottom: "1px solid #e5e7eb",
                            background: "white",
                        }}
                    >
                        {['BASE', 'VIEW', 'CTE'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTableTab(tab)}
                                style={{
                                    flex: 1,
                                    padding: "10px 12px",
                                    background: activeTableTab === tab ? "white" : "transparent",
                                    border: "none",
                                    borderBottom: activeTableTab === tab ? "2px solid #3b82f6" : "2px solid transparent",
                                    cursor: "pointer",
                                    fontSize: "12px",
                                    fontWeight: activeTableTab === tab ? 600 : 500,
                                    color: activeTableTab === tab ? "#3b82f6" : "#6b7280",
                                    transition: "all 200ms ease",
                                }}
                                onMouseEnter={(e) => {
                                    if (activeTableTab !== tab) {
                                        e.target.style.background = "#f9fafb";
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (activeTableTab !== tab) {
                                        e.target.style.background = "transparent";
                                    }
                                }}
                            >
                                {tab} ({tab === 'BASE' 
                                    ? fileBaseTables.length + customTables.BASE.length 
                                    : tab === 'VIEW'
                                    ? fileViewTables.length + customTables.VIEW.length
                                    : customTables.CTE.length})
                            </button>
                        ))}
                    </div>
                    <div
                        style={{
                            flex: 1,
                            overflow: "auto",
                            padding: "12px",
                        }}
                    >
                        {(() => {
                            const getTabTables = () => {
                                if (activeTableTab === 'BASE') {
                                    return [
                                        ...fileBaseTables.map(t => ({ name: t, type: 'BASE', isCustom: false })),
                                        ...customTables.BASE.map(t => ({ name: t, type: 'BASE', isCustom: true }))
                                    ];
                                } else if (activeTableTab === 'VIEW') {
                                    return [
                                        ...fileViewTables.map(t => ({ name: t, type: 'VIEW', isCustom: false })),
                                        ...customTables.VIEW.map(t => ({ name: t, type: 'VIEW', isCustom: true }))
                                    ];
                                } else {
                                    // CTE - only show custom ones, not from files
                                    return customTables.CTE.map(t => ({ 
                                        name: t, 
                                        type: 'CTE', 
                                        isCustom: true 
                                    }));
                                }
                            };

                            const tables = getTabTables().filter(table => 
                                table.name.toLowerCase().includes(sidebarSearchQuery.toLowerCase())
                            );

                            const getTypeColor = (type) => {
                                switch (type) {
                                    case 'BASE': return { bg: '#f9fafb', bgHover: '#eff6ff', border: '#e5e7eb', borderHover: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', icon: '#3b82f6', text: '#6b7280' };
                                    case 'VIEW': return { bg: '#f0fdf4', bgHover: '#dcfce7', border: '#bbf7d0', borderHover: '#10b981', gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', icon: '#10b981', text: '#059669' };
                                    case 'CTE': return { bg: '#faf5ff', bgHover: '#f3e8ff', border: '#e9d5ff', borderHover: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', icon: '#8b5cf6', text: '#7c3aed' };
                                    default: return { bg: '#f9fafb', bgHover: '#eff6ff', border: '#e5e7eb', borderHover: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', icon: '#3b82f6', text: '#6b7280' };
                                }
                            };

                            if (tables.length === 0) {
                                return (
                                    <div style={{
                                        padding: "60px 20px",
                                        textAlign: "center",
                                        color: "#9ca3af",
                                    }}>
                                        <FiDatabase size={48} style={{ marginBottom: "12px", opacity: 0.5 }} />
                                        <div style={{ fontSize: "14px", fontWeight: 500 }}>
                                            {sidebarSearchQuery ? "No tables found" : `No ${activeTableTab.toLowerCase()} tables`}
                                        </div>
                                        {sidebarSearchQuery && (
                                            <div style={{ fontSize: "12px", marginTop: "4px" }}>
                                                Try a different search term
                                            </div>
                                        )}
                                    </div>
                                );
                            }

                            return (
                                <div style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "8px",
                                }}>
                                    {tables.map((table, index) => {
                                        const colors = getTypeColor(table.type);
                                        return (
                                            <div
                                                key={`${table.type}-${index}`}
                                                onClick={() => addTableToCanvas(table.name, table.type)}
                                                style={{
                                                    padding: "12px 16px",
                                                    background: colors.bg,
                                                    border: `2px solid ${colors.border}`,
                                                    borderRadius: "8px",
                                                    transition: "all 200ms ease",
                                                    cursor: "pointer",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "10px",
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = colors.bgHover;
                                                    e.currentTarget.style.borderColor = colors.borderHover;
                                                    e.currentTarget.style.transform = "translateX(4px)";
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = colors.bg;
                                                    e.currentTarget.style.borderColor = colors.border;
                                                    e.currentTarget.style.transform = "translateX(0)";
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: "32px",
                                                        height: "32px",
                                                        background: colors.gradient,
                                                        borderRadius: "6px",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    <FiDatabase size={16} color="white" />
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div
                                                        style={{
                                                            fontSize: "14px",
                                                            fontWeight: 600,
                                                            color: "#1f2937",
                                                            overflow: "hidden",
                                                            textOverflow: "ellipsis",
                                                            whiteSpace: "nowrap",
                                                        }}
                                                    >
                                                        {table.name}
                                                    </div>
                                                    <div
                                                        style={{
                                                            fontSize: "11px",
                                                            color: colors.text,
                                                            marginTop: "2px",
                                                        }}
                                                    >
                                                        {table.isCustom 
                                                            ? 'Custom' 
                                                            : `${tableMetadata[table.name]?.fields?.length || 0} field(s)`}
                                                    </div>
                                                </div>
                                                <FiPlus size={16} color={colors.icon} />
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })()}
                    </div>
                </div>

                {/* Canvas */}
                <div
                    style={{
                        flex: 1,
                        position: "relative",
                        background: "#f8fafc",
                    }}
                >
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        style={{
                            position: "absolute",
                            top: "16px",
                            left: "16px",
                            zIndex: 10,
                            background: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                            padding: "10px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#1f2937",
                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                            transition: "all 200ms ease",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#f3f4f6";
                            e.currentTarget.style.borderColor = "#3b82f6";
                            e.currentTarget.style.color = "#3b82f6";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "white";
                            e.currentTarget.style.borderColor = "#e5e7eb";
                            e.currentTarget.style.color = "#1f2937";
                        }}
                        title={sidebarOpen ? "Hide Tables" : "Show Tables"}
                    >
                        {sidebarOpen ? <FiChevronsLeft size={20} /> : <FiChevronsRight size={20} />}
                    </button>
                    
                    {nodes.length === 0 ? (
                        <div
                            style={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                textAlign: "center",
                                color: "#9ca3af",
                                pointerEvents: "none",
                            }}
                        >
                            <FiPackage size={64} style={{ marginBottom: "16px", opacity: 0.3 }} />
                            <div style={{ fontSize: "18px", fontWeight: 500 }}>
                                Start Building Your Data Product
                            </div>
                            <div style={{ fontSize: "14px", marginTop: "8px" }}>
                                Click on tables from the sidebar to add them to the canvas
                            </div>
                        </div>
                    ) : null}
                    
                    {selectedEdge && (
                        <div
                            style={{
                                position: "absolute",
                                top: "16px",
                                right: "16px",
                                zIndex: 10,
                                display: "flex",
                                gap: "8px",
                            }}
                        >
                            <button
                                onClick={() => setShowConnectionTypeDialog(true)}
                                style={{
                                    background: "white",
                                    border: selectedEdgeDetails?.data?.connectionType === 'calculation' ? "2px solid #8b5cf6" : "2px solid #3b82f6",
                                    borderRadius: "8px",
                                    padding: "10px 16px",
                                    cursor: "pointer",
                                    fontSize: "13px",
                                    fontWeight: 600,
                                    color: selectedEdgeDetails?.data?.connectionType === 'calculation' ? "#8b5cf6" : "#3b82f6",
                                    boxShadow: selectedEdgeDetails?.data?.connectionType === 'calculation' ? "0 4px 8px rgba(139, 92, 246, 0.3)" : "0 4px 8px rgba(59, 130, 246, 0.3)",
                                    transition: "all 200ms ease",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = selectedEdgeDetails?.data?.connectionType === 'calculation' ? "#f3e8ff" : "#eff6ff";
                                    e.target.style.transform = "scale(1.05)";
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = "white";
                                    e.target.style.transform = "scale(1)";
                                }}
                            >
                                <FiEdit2 size={16} />
                                Change Type
                            </button>
                            {selectedEdgeDetails?.data?.connectionType === 'calculation' && (
                                <button
                                    onClick={handleEditCalculation}
                                    style={{
                                        background: "#8b5cf6",
                                        border: "none",
                                        borderRadius: "8px",
                                        padding: "10px 16px",
                                        cursor: "pointer",
                                        fontSize: "13px",
                                        fontWeight: 600,
                                        color: "white",
                                        boxShadow: "0 4px 8px rgba(139, 92, 246, 0.3)",
                                        transition: "all 200ms ease",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = "#7c3aed";
                                        e.target.style.transform = "scale(1.05)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = "#8b5cf6";
                                        e.target.style.transform = "scale(1)";
                                    }}
                                >
                                    <FiEdit2 size={16} />
                                    Edit Calculation
                                </button>
                            )}
                            <button
                                onClick={deleteSelectedEdge}
                                style={{
                                    background: "#ef4444",
                                    border: "none",
                                    borderRadius: "8px",
                                    padding: "10px 16px",
                                    cursor: "pointer",
                                    fontSize: "13px",
                                    fontWeight: 600,
                                    color: "white",
                                    boxShadow: "0 4px 8px rgba(239, 68, 68, 0.3)",
                                    transition: "all 200ms ease",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = "#dc2626";
                                    e.target.style.transform = "scale(1.05)";
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = "#ef4444";
                                    e.target.style.transform = "scale(1)";
                                }}
                            >
                                <FiTrash2 size={16} />
                                Delete
                            </button>
                        </div>
                    )}
                    
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onEdgeClick={onEdgeClick}
                        onPaneClick={onPaneClick}
                        nodeTypes={nodeTypes}
                        defaultEdgeOptions={{
                            type: 'smoothstep',
                            animated: true,
                            style: { strokeWidth: 2 }
                        }}
                        minZoom={0.1}
                        maxZoom={4}
                        translateExtent={[[-Infinity, -Infinity], [Infinity, Infinity]]}
                        nodeExtent={[[-Infinity, -Infinity], [Infinity, Infinity]]}
                    >
                        <Controls />
                        <MiniMap 
                            nodeColor="#3b82f6"
                            maskColor="rgba(0, 0, 0, 0.1)"
                        />
                        <Background variant="dots" gap={12} size={1} />
                    </ReactFlow>
                </div>
            </div>

            {/* Create Table Dialog */}
            {showCreateTableDialog && (
                <>
                    <div
                        onClick={() => setShowCreateTableDialog(false)}
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: "rgba(0, 0, 0, 0.5)",
                            zIndex: 999,
                        }}
                    />
                    <div
                        style={{
                            position: "fixed",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            background: "white",
                            borderRadius: "12px",
                            padding: "32px",
                            zIndex: 1000,
                            minWidth: "400px",
                            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                        }}
                    >
                        <h3
                            style={{
                                fontSize: "20px",
                                fontWeight: 600,
                                color: "#1f2937",
                                marginBottom: "20px",
                            }}
                        >
                            Create New Table
                        </h3>
                        <div style={{ marginBottom: "20px" }}>
                            <label
                                style={{
                                    display: "block",
                                    fontSize: "14px",
                                    fontWeight: 500,
                                    color: "#374151",
                                    marginBottom: "8px",
                                }}
                            >
                                Table Name
                            </label>
                            <input
                                type="text"
                                value={newTableName}
                                onChange={(e) => setNewTableName(e.target.value)}
                                placeholder="Enter table name..."
                                style={{
                                    width: "100%",
                                    padding: "10px 12px",
                                    border: "1px solid #d1d5db",
                                    borderRadius: "8px",
                                    fontSize: "14px",
                                    outline: "none",
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleCreateNewTable();
                                    }
                                }}
                                autoFocus
                            />
                        </div>
                        <div style={{ marginBottom: "24px" }}>
                            <label
                                style={{
                                    display: "block",
                                    fontSize: "14px",
                                    fontWeight: 500,
                                    color: "#374151",
                                    marginBottom: "8px",
                                }}
                            >
                                Table Type
                            </label>
                            <div style={{ display: "flex", gap: "12px" }}>
                                {['BASE', 'CTE', 'VIEW'].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setNewTableType(type)}
                                        style={{
                                            flex: 1,
                                            padding: "10px",
                                            border: `2px solid ${newTableType === type 
                                                ? (type === 'BASE' ? '#3b82f6' : type === 'CTE' ? '#8b5cf6' : '#10b981')
                                                : '#e5e7eb'}`,
                                            borderRadius: "8px",
                                            background: newTableType === type 
                                                ? (type === 'BASE' ? '#eff6ff' : type === 'CTE' ? '#f3e8ff' : '#d1fae5')
                                                : 'white',
                                            color: newTableType === type 
                                                ? (type === 'BASE' ? '#1e40af' : type === 'CTE' ? '#6b21a8' : '#065f46')
                                                : '#6b7280',
                                            cursor: "pointer",
                                            fontSize: "13px",
                                            fontWeight: 600,
                                            transition: "all 200ms ease",
                                        }}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                            <button
                                onClick={() => {
                                    setShowCreateTableDialog(false);
                                    setNewTableName("");
                                    setNewTableType("BASE");
                                }}
                                style={{
                                    padding: "10px 20px",
                                    background: "transparent",
                                    border: "1px solid #d1d5db",
                                    borderRadius: "8px",
                                    color: "#6b7280",
                                    cursor: "pointer",
                                    fontSize: "14px",
                                    fontWeight: 500,
                                    transition: "all 200ms ease",
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = "#f3f4f6";
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = "transparent";
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateNewTable}
                                style={{
                                    padding: "10px 20px",
                                    background: "#10b981",
                                    border: "none",
                                    borderRadius: "8px",
                                    color: "white",
                                    cursor: "pointer",
                                    fontSize: "14px",
                                    fontWeight: 600,
                                    transition: "all 200ms ease",
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = "#059669";
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = "#10b981";
                                }}
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Add Field Dialog */}
            {showAddFieldDialog && (
                <>
                    <div
                        onClick={() => {
                            setShowAddFieldDialog(false);
                            setNewFieldName("");
                            setNewFieldType("VARCHAR");
                            setAddFieldNodeId(null);
                        }}
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: "rgba(0, 0, 0, 0.5)",
                            zIndex: 999,
                        }}
                    />
                    <div
                        style={{
                            position: "fixed",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            background: "white",
                            borderRadius: "12px",
                            padding: "32px",
                            zIndex: 1000,
                            minWidth: "400px",
                            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                        }}
                    >
                        <h3
                            style={{
                                fontSize: "20px",
                                fontWeight: 600,
                                color: "#1f2937",
                                marginBottom: "20px",
                            }}
                        >
                            Add Field
                        </h3>
                        <div style={{ marginBottom: "20px" }}>
                            <label
                                style={{
                                    display: "block",
                                    fontSize: "14px",
                                    fontWeight: 500,
                                    color: "#374151",
                                    marginBottom: "8px",
                                }}
                            >
                                Field Name
                            </label>
                            <input
                                type="text"
                                value={newFieldName}
                                onChange={(e) => setNewFieldName(e.target.value)}
                                placeholder="e.g., customer_id, order_date..."
                                style={{
                                    width: "100%",
                                    padding: "10px 12px",
                                    border: "1px solid #d1d5db",
                                    borderRadius: "8px",
                                    fontSize: "14px",
                                    outline: "none",
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleConfirmAddField();
                                    }
                                }}
                                autoFocus
                            />
                        </div>
                        <div style={{ marginBottom: "24px" }}>
                            <label
                                style={{
                                    display: "block",
                                    fontSize: "14px",
                                    fontWeight: 500,
                                    color: "#374151",
                                    marginBottom: "8px",
                                }}
                            >
                                Field Type
                            </label>
                            <input
                                type="text"
                                value={newFieldType}
                                onChange={(e) => setNewFieldType(e.target.value)}
                                placeholder="e.g., VARCHAR, INT, DATE..."
                                style={{
                                    width: "100%",
                                    padding: "10px 12px",
                                    border: "1px solid #d1d5db",
                                    borderRadius: "8px",
                                    fontSize: "14px",
                                    outline: "none",
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleConfirmAddField();
                                    }
                                }}
                            />
                        </div>
                        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                            <button
                                onClick={() => {
                                    setShowAddFieldDialog(false);
                                    setNewFieldName("");
                                    setNewFieldType("VARCHAR");
                                    setAddFieldNodeId(null);
                                }}
                                style={{
                                    padding: "10px 20px",
                                    background: "transparent",
                                    border: "1px solid #d1d5db",
                                    borderRadius: "8px",
                                    color: "#6b7280",
                                    cursor: "pointer",
                                    fontSize: "14px",
                                    fontWeight: 500,
                                    transition: "all 200ms ease",
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = "#f3f4f6";
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = "transparent";
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmAddField}
                                disabled={!newFieldName.trim()}
                                style={{
                                    padding: "10px 20px",
                                    background: newFieldName.trim() ? "#3b82f6" : "#d1d5db",
                                    border: "none",
                                    borderRadius: "8px",
                                    color: "white",
                                    cursor: newFieldName.trim() ? "pointer" : "not-allowed",
                                    fontSize: "14px",
                                    fontWeight: 600,
                                    transition: "all 200ms ease",
                                }}
                                onMouseEnter={(e) => {
                                    if (newFieldName.trim()) {
                                        e.target.style.background = "#2563eb";
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (newFieldName.trim()) {
                                        e.target.style.background = "#3b82f6";
                                    }
                                }}
                            >
                                Add Field
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Delete Field Confirmation Dialog */}
            {showDeleteFieldConfirm && (
                <>
                    <div
                        onClick={() => {
                            setShowDeleteFieldConfirm(false);
                            setDeleteFieldInfo({ nodeId: null, fieldName: null });
                        }}
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: "rgba(0, 0, 0, 0.5)",
                            zIndex: 999,
                        }}
                    />
                    <div
                        style={{
                            position: "fixed",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            background: "white",
                            borderRadius: "12px",
                            padding: "32px",
                            zIndex: 1000,
                            minWidth: "400px",
                            maxWidth: "500px",
                            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                            <div
                                style={{
                                    width: "48px",
                                    height: "48px",
                                    borderRadius: "50%",
                                    background: "rgba(239, 68, 68, 0.1)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                }}
                            >
                                <FiTrash2 size={24} color="#ef4444" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3
                                    style={{
                                        fontSize: "18px",
                                        fontWeight: 600,
                                        color: "#1f2937",
                                        marginBottom: "8px",
                                    }}
                                >
                                    Remove Field
                                </h3>
                                <p
                                    style={{
                                        fontSize: "14px",
                                        color: "#6b7280",
                                        lineHeight: "1.5",
                                    }}
                                >
                                    Are you sure you want to remove <strong>"{deleteFieldInfo.fieldName}"</strong>? 
                                    This will also delete all connections to this field. This action cannot be undone.
                                </p>
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "24px" }}>
                            <button
                                onClick={() => {
                                    setShowDeleteFieldConfirm(false);
                                    setDeleteFieldInfo({ nodeId: null, fieldName: null });
                                }}
                                style={{
                                    padding: "10px 20px",
                                    background: "transparent",
                                    border: "1px solid #d1d5db",
                                    borderRadius: "8px",
                                    color: "#6b7280",
                                    cursor: "pointer",
                                    fontSize: "14px",
                                    fontWeight: 500,
                                    transition: "all 200ms ease",
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = "#f3f4f6";
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = "transparent";
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmRemoveField}
                                style={{
                                    padding: "10px 20px",
                                    background: "#ef4444",
                                    border: "none",
                                    borderRadius: "8px",
                                    color: "white",
                                    cursor: "pointer",
                                    fontSize: "14px",
                                    fontWeight: 600,
                                    transition: "all 200ms ease",
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = "#dc2626";
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = "#ef4444";
                                }}
                            >
                                Remove Field
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Connection Type Dialog */}
            {showConnectionTypeDialog && (
                <>
                    <div
                        onClick={() => setShowConnectionTypeDialog(false)}
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: "rgba(0, 0, 0, 0.5)",
                            zIndex: 999,
                        }}
                    />
                    <div
                        style={{
                            position: "fixed",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            background: "white",
                            borderRadius: "12px",
                            padding: "32px",
                            zIndex: 1000,
                            minWidth: "400px",
                            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                        }}
                    >
                        <h3
                            style={{
                                fontSize: "20px",
                                fontWeight: 600,
                                color: "#1f2937",
                                marginBottom: "8px",
                            }}
                        >
                            Connection Type
                        </h3>
                        <p
                            style={{
                                fontSize: "14px",
                                color: "#6b7280",
                                marginBottom: "24px",
                            }}
                        >
                            Select the type of relationship. Colors indicate: <span style={{ color: "#3b82f6", fontWeight: 600 }}>Blue</span> for Reference, <span style={{ color: "#8b5cf6", fontWeight: 600 }}>Purple</span> for Calculation.
                        </p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
                            <button
                                onClick={() => handleChangeConnectionType('ref')}
                                style={{
                                    padding: "16px",
                                    border: `2px solid ${selectedEdgeDetails?.data?.connectionType === 'ref' ? '#3b82f6' : '#e5e7eb'}`,
                                    borderRadius: "8px",
                                    background: selectedEdgeDetails?.data?.connectionType === 'ref' ? '#eff6ff' : 'white',
                                    cursor: "pointer",
                                    textAlign: "left",
                                    transition: "all 200ms ease",
                                }}
                                onMouseEnter={(e) => {
                                    if (selectedEdgeDetails?.data?.connectionType !== 'ref') {
                                        e.target.style.background = "#f9fafb";
                                        e.target.style.borderColor = "#3b82f6";
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (selectedEdgeDetails?.data?.connectionType !== 'ref') {
                                        e.target.style.background = "white";
                                        e.target.style.borderColor = "#e5e7eb";
                                    }
                                }}
                            >
                                <div style={{ fontSize: "16px", fontWeight: 600, color: "#1f2937", marginBottom: "4px" }}>
                                    Reference (PK → FK)
                                </div>
                                <div style={{ fontSize: "13px", color: "#6b7280" }}>
                                    Standard foreign key relationship between tables
                                </div>
                            </button>
                            <button
                                onClick={() => handleChangeConnectionType('calculation')}
                                style={{
                                    padding: "16px",
                                    border: `2px solid ${selectedEdgeDetails?.data?.connectionType === 'calculation' ? '#8b5cf6' : '#e5e7eb'}`,
                                    borderRadius: "8px",
                                    background: selectedEdgeDetails?.data?.connectionType === 'calculation' ? '#f3e8ff' : 'white',
                                    cursor: "pointer",
                                    textAlign: "left",
                                    transition: "all 200ms ease",
                                }}
                                onMouseEnter={(e) => {
                                    if (selectedEdgeDetails?.data?.connectionType !== 'calculation') {
                                        e.target.style.background = "#f9fafb";
                                        e.target.style.borderColor = "#8b5cf6";
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (selectedEdgeDetails?.data?.connectionType !== 'calculation') {
                                        e.target.style.background = "white";
                                        e.target.style.borderColor = "#e5e7eb";
                                    }
                                }}
                            >
                                <div style={{ fontSize: "16px", fontWeight: 600, color: "#1f2937", marginBottom: "4px" }}>
                                    Calculation
                                </div>
                                <div style={{ fontSize: "13px", color: "#6b7280" }}>
                                    Calculated or derived relationship using expressions
                                </div>
                            </button>
                        </div>
                        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                            <button
                                onClick={() => setShowConnectionTypeDialog(false)}
                                style={{
                                    padding: "10px 20px",
                                    background: "transparent",
                                    border: "1px solid #d1d5db",
                                    borderRadius: "8px",
                                    color: "#6b7280",
                                    cursor: "pointer",
                                    fontSize: "14px",
                                    fontWeight: 500,
                                    transition: "all 200ms ease",
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = "#f3f4f6";
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = "transparent";
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Calculation Expression Dialog */}
            {showCalculationDialog && (
                <>
                    <div
                        onClick={() => {
                            setShowCalculationDialog(false);
                            setCalculationExpression("");
                        }}
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: "rgba(0, 0, 0, 0.5)",
                            zIndex: 999,
                        }}
                    />
                    <div
                        style={{
                            position: "fixed",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            background: "white",
                            borderRadius: "12px",
                            padding: "32px",
                            zIndex: 1000,
                            minWidth: "500px",
                            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                        }}
                    >
                        <h3
                            style={{
                                fontSize: "20px",
                                fontWeight: 600,
                                color: "#1f2937",
                                marginBottom: "8px",
                            }}
                        >
                            Define Calculation
                        </h3>
                        <p
                            style={{
                                fontSize: "14px",
                                color: "#6b7280",
                                marginBottom: "20px",
                            }}
                        >
                            Enter the calculation expression or formula for this relationship
                        </p>
                        <div style={{ marginBottom: "24px" }}>
                            <label
                                style={{
                                    display: "block",
                                    fontSize: "14px",
                                    fontWeight: 500,
                                    color: "#374151",
                                    marginBottom: "8px",
                                }}
                            >
                                Calculation Expression
                            </label>
                            <textarea
                                value={calculationExpression}
                                onChange={(e) => setCalculationExpression(e.target.value)}
                                placeholder="e.g., SUM(order_amount) / COUNT(order_id)"
                                style={{
                                    width: "100%",
                                    minHeight: "120px",
                                    padding: "12px",
                                    border: "1px solid #d1d5db",
                                    borderRadius: "8px",
                                    fontSize: "14px",
                                    fontFamily: "monospace",
                                    outline: "none",
                                    resize: "vertical",
                                }}
                                autoFocus
                            />
                            <div
                                style={{
                                    fontSize: "12px",
                                    color: "#9ca3af",
                                    marginTop: "6px",
                                }}
                            >
                                Define how this attribute is calculated from the source attribute
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                            <button
                                onClick={() => {
                                    setShowCalculationDialog(false);
                                    setCalculationExpression("");
                                }}
                                style={{
                                    padding: "10px 20px",
                                    background: "transparent",
                                    border: "1px solid #d1d5db",
                                    borderRadius: "8px",
                                    color: "#6b7280",
                                    cursor: "pointer",
                                    fontSize: "14px",
                                    fontWeight: 500,
                                    transition: "all 200ms ease",
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = "#f3f4f6";
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = "transparent";
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveCalculation}
                                style={{
                                    padding: "10px 20px",
                                    background: "#8b5cf6",
                                    border: "none",
                                    borderRadius: "8px",
                                    color: "white",
                                    cursor: "pointer",
                                    fontSize: "14px",
                                    fontWeight: 600,
                                    transition: "all 200ms ease",
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = "#7c3aed";
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = "#8b5cf6";
                                }}
                            >
                                Save Calculation
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default DataProductPage;
