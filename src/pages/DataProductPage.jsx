import { useState, useCallback, useEffect, memo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiPackage, FiDatabase, FiPlus, FiSave, FiTrash2, FiSearch, FiEdit2, FiZap, FiChevronsLeft, FiChevronsRight, FiKey, FiDownload, FiX, FiSettings, FiLayout } from "react-icons/fi";
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
    useReactFlow,
    ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";
import { getFile, saveDataProduct } from "../utils/fileStorage";
import { getLayoutedElements, applyLayout } from "../utils/layout";
import SuggestionDialog from "../components/DataProduct/SuggestionDialog";
import ReverseDepsDialog from "../components/DataProduct/ReverseDepsDialog";
import DataProductSidebar from "../components/DataProduct/DataProductSidebar";
import { useSuggestions } from "../hooks/useSuggestions";

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
                    {(data.tableType === 'BASE' || data.tableType === 'CTE' || data.tableType === 'VIEW') && (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    data.onShowReverseDeps(id, data.tableName, data.tableType);
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
                                title="Show downstream dependencies (entities this depends on)"
                            >
                                ⬆ Deps
                            </button>
                        </>
                    )}
                    {data.fields.length > 0 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (data.onOpenSettings) {
                                    data.onOpenSettings(id);
                                } else {
                                    alert('Error: Handler not available. Please try refreshing the page.');
                                }
                            }}
                            style={{
                                background: 'rgba(99, 102, 241, 0.9)',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                borderRadius: '4px',
                                color: 'white',
                                cursor: 'pointer',
                                padding: '4px 8px',
                                fontSize: '11px',
                                fontWeight: 600
                            }}
                            title="Entity settings"
                        >
                            <FiSettings size={12} />
                        </button>
                    )}
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
                                borderLeft: field.isPK ? '3px solid #f59e0b' : '3px solid transparent',
                                transition: 'all 150ms ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#eff6ff';
                                if (!field.isPK) {
                                    e.currentTarget.style.borderLeftColor = colors.border;
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = idx % 2 === 0 ? '#f9fafb' : 'white';
                                if (!field.isPK) {
                                    e.currentTarget.style.borderLeftColor = 'transparent';
                                }
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
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
                                <label style={{
                                    position: 'relative',
                                    display: 'inline-block',
                                    width: '28px',
                                    height: '16px',
                                    flexShrink: 0,
                                    cursor: 'pointer',
                                }}
                                title={(() => {
                                    const toggleKey = `${id}_${field.name}`;
                                    const isToggled = data.attributeToggles?.[toggleKey] || false;
                                    const effectiveMode = isToggled 
                                        ? (data.globalAttributeMode === 'runtime' ? 'loadtime' : 'runtime')
                                        : data.globalAttributeMode;
                                    return `Current mode: ${effectiveMode}. Click to toggle.`;
                                })()}
                                >
                                    <input
                                        type="checkbox"
                                        checked={(() => {
                                            const toggleKey = `${id}_${field.name}`;
                                            return data.attributeToggles?.[toggleKey] || false;
                                        })()}
                                        onChange={(e) => {
                                            e.stopPropagation();
                                            data.onToggleFieldSelection(id, field.name);
                                        }}
                                        style={{ display: 'none' }}
                                    />
                                    <span style={{
                                        position: 'absolute',
                                        cursor: 'pointer',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        backgroundColor: (() => {
                                            const toggleKey = `${id}_${field.name}`;
                                            const isToggled = data.attributeToggles?.[toggleKey] || false;
                                            return isToggled ? '#6366f1' : '#cbd5e1';
                                        })(),
                                        transition: '0.3s',
                                        borderRadius: '16px',
                                    }}>
                                        <span style={{
                                            position: 'absolute',
                                            content: '',
                                            height: '12px',
                                            width: '12px',
                                            left: (() => {
                                                const toggleKey = `${id}_${field.name}`;
                                                const isToggled = data.attributeToggles?.[toggleKey] || false;
                                                return isToggled ? '14px' : '2px';
                                            })(),
                                            bottom: '2px',
                                            backgroundColor: 'white',
                                            transition: '0.3s',
                                            borderRadius: '50%',
                                        }}></span>
                                    </span>
                                </label>
                                <span 
                                    style={{ 
                                        fontWeight: field.isPK ? 600 : 500, 
                                        flex: 1,
                                        cursor: 'pointer',
                                        userSelect: 'none'
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        data.onTogglePK(id, field.name);
                                    }}
                                    title="Click to toggle Primary Key"
                                >
                                    {field.name} 
                                    {field.isPK && (
                                    <FiKey 
                                        size={14} 
                                        style={{ color: '#f59e0b', flexShrink: 0 }} 
                                        title="Primary Key"
                                    />
                                )}
                                </span>
                            </div>
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
    const reactFlowInstance = useReactFlow();
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
    const [showReverseDepsDialog, setShowReverseDepsDialog] = useState(false);
    const [reverseDeps, setReverseDeps] = useState([]);
    const [selectedEntityForReverseDeps, setSelectedEntityForReverseDeps] = useState(null);
    const [showExportDialog, setShowExportDialog] = useState(false);
    const [exportJson, setExportJson] = useState('');
    const [selectedFields, setSelectedFields] = useState({});
    const [showSettingsDialog, setShowSettingsDialog] = useState(false);
    const [settingsData, setSettingsData] = useState({ nodeId: null, fields: [] });
    const [settingsActiveTab, setSettingsActiveTab] = useState('entity'); // 'entity' or 'table'
    const [globalAttributeMode, setGlobalAttributeMode] = useState('runtime'); // 'runtime' or 'loadtime' - kept for backwards compatibility
    const [entityAttributeModes, setEntityAttributeModes] = useState({}); // Track default mode per entity: { nodeId: 'runtime' | 'loadtime' }
    const entityAttributeModesRef = useRef({}); // Ref to always access current value
    const [tab1FilterMode, setTab1FilterMode] = useState('runtime'); // Filter for Tab 1
    const [attributeToggles, setAttributeToggles] = useState({}); // Track toggle state per attribute (for canvas runtime/loadtime)
    const [attributeSelections, setAttributeSelections] = useState({}); // Track selection state for Selected Attributes tab
    const [attributeSearchQuery, setAttributeSearchQuery] = useState(''); // Search query for filtering attributes
    const [newEntityName, setNewEntityName] = useState('');
    const [newEntityType, setNewEntityType] = useState('CTE');
    const [searchQuery, setSearchQuery] = useState('');
    const [sourceDataProduct, setSourceDataProduct] = useState(dataProductData || null);
    
    // Keep ref in sync with state
    useEffect(() => {
        entityAttributeModesRef.current = entityAttributeModes;
    }, [entityAttributeModes]);
    
    // Use suggestion hook
    const {
        showSuggestDialog,
        suggestions,
        suggestionsLevel2,
        generateSuggestions,
        setShowSuggestDialog
    } = useSuggestions();

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

    // Update all nodes with current attributeToggles and entityAttributeModes
    useEffect(() => {
        setNodes((currentNodes) => 
            currentNodes.map(node => {
                const entityMode = entityAttributeModes[node.id] || 'runtime';
                return {
                    ...node,
                    data: {
                        ...node.data,
                        attributeToggles,
                        globalAttributeMode: entityMode // Pass entity-specific mode as globalAttributeMode for backwards compatibility
                    }
                };
            })
        );
    }, [attributeToggles, entityAttributeModes]);

    // Auto-arrange layout function
    const onLayout = useCallback(() => {
        const { nodes: layoutedNodes, edges: layoutedEdges } = applyLayout(
            nodes,
            edges,
            "dagre",
            "LR"
        );
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
    }, [nodes, edges, setNodes, setEdges]);

    // Auto-arrange on initial load when nodes are available
    useEffect(() => {
        if (nodes.length > 0 && edges.length >= 0) {
            // Small delay to ensure nodes are fully rendered
            const timer = setTimeout(() => {
                onLayout();
            }, 300);
            return () => clearTimeout(timer);
        }
    }, []); // Empty deps - only run once on mount

    const loadTableMetadata = async () => {
        const metadata = {};
        const baseTables = new Set();
        const viewTables = new Set();
        const combinedEntities = {};
        
        for (const fileId of selectedFileIds) {
            try {
                const fileData = await getFile(fileId);
                if (fileData && fileData.data && fileData.data.entities) {
                    // Merge entities for suggestions/source data
                    Object.assign(combinedEntities, fileData.data.entities);

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

        // Expose merged entities for suggestion/reverse-deps when creating a new data product
        if (Object.keys(combinedEntities).length > 0) {
            setSourceDataProduct({
                entities: combinedEntities,
                metadata: { name: 'Selected Files' }
            });
        }
    };

    const loadDataProduct = (dataProduct) => {
        try {
            setSourceDataProduct(dataProduct || null);

            const loadedNodes = [];
            const loadedEdges = [];
            const nodeMap = new Map(); // To track entity to node ID mapping
            
            // Load saved modes and toggles
            const savedEntityModes = dataProduct.entityAttributeModes || {};
            const savedToggles = dataProduct.attributeToggles || {};
            const defaultMode = dataProduct.globalAttributeMode || 'runtime';
            
            // Build mapping from entity keys to their saved node IDs
            const entityToOldNodeId = new Map();
            if (dataProduct.entities) {
                // Extract field names for each entity
                const entityFieldSets = new Map();
                for (const entityKey in dataProduct.entities) {
                    const entity = dataProduct.entities[entityKey];
                    if (entity.fields) {
                        entityFieldSets.set(entityKey, new Set(Object.keys(entity.fields)));
                    }
                }
                
                // Group toggle keys by node ID
                const nodeIdToFields = new Map();
                for (const toggleKey in savedToggles) {
                    const parts = toggleKey.split('_');
                    if (parts.length >= 2) {
                        const oldNodeId = parts[0];
                        const fieldName = parts.slice(1).join('_');
                        
                        if (!nodeIdToFields.has(oldNodeId)) {
                            nodeIdToFields.set(oldNodeId, new Set());
                        }
                        nodeIdToFields.get(oldNodeId).add(fieldName);
                    }
                }
                
                // Match entities to old node IDs by comparing ALL fields
                for (const [entityKey, entityFields] of entityFieldSets) {
                    let bestMatch = null;
                    let bestMatchCount = 0;
                    
                    for (const [oldNodeId, nodeFields] of nodeIdToFields) {
                        // Count how many fields match
                        let matchCount = 0;
                        for (const field of entityFields) {
                            if (nodeFields.has(field)) {
                                matchCount++;
                            }
                        }
                        
                        // If all entity fields are in this node, and it's a better match
                        if (matchCount === entityFields.size && matchCount > bestMatchCount) {
                            bestMatch = oldNodeId;
                            bestMatchCount = matchCount;
                        }
                    }
                    
                    if (bestMatch) {
                        entityToOldNodeId.set(entityKey, bestMatch);
                        // Remove this node from future matching to ensure 1-to-1 mapping
                        nodeIdToFields.delete(bestMatch);
                    }
                }
            }
            
            // Build reverse mapping and remap modes/toggles BEFORE creating nodes
            const oldToNewNodeId = new Map();
            const newAttributeToggles = {};
            const newEntityAttributeModes = {};
            
            // First, build the old->new node ID mapping
            let nodeIndex = 0;
            if (dataProduct.entities) {
                for (const entityKey in dataProduct.entities) {
                    const newNodeId = `node-${nodeIndex++}`;
                    const oldNodeId = entityToOldNodeId.get(entityKey);
                    if (oldNodeId) {
                        oldToNewNodeId.set(oldNodeId, newNodeId);
                    }
                }
            }
            
            // Remap entity attribute modes
            for (const oldNodeId in savedEntityModes) {
                const newNodeId = oldToNewNodeId.get(oldNodeId);
                if (newNodeId) {
                    newEntityAttributeModes[newNodeId] = savedEntityModes[oldNodeId];
                }
            }
            
            // Remap attribute toggles
            for (const oldToggleKey in savedToggles) {
                const parts = oldToggleKey.split('_');
                if (parts.length >= 2) {
                    const oldNodeId = parts[0];
                    const fieldName = parts.slice(1).join('_');
                    const newNodeId = oldToNewNodeId.get(oldNodeId);
                    if (newNodeId) {
                        const newToggleKey = `${newNodeId}_${fieldName}`;
                        newAttributeToggles[newToggleKey] = savedToggles[oldToggleKey];
                    }
                }
            }
            
            // First pass: Create nodes from entities
            if (dataProduct.entities) {
                nodeIndex = 0; // Reset counter
                for (const entityKey in dataProduct.entities) {
                    const entity = dataProduct.entities[entityKey];
                    
                    // Parse entity key (e.g., "BASE_users" -> type="BASE", name="users")
                    const parts = entityKey.split('_');
                    const tableType = parts[0];
                    const tableName = parts.slice(1).join('_');
                    
                    // Create node
                    const nodeId = `node-${nodeIndex++}`;
                    nodeMap.set(entityKey, nodeId);
                    
                    // Get entity-specific default mode from the already-remapped modes
                    const entityMode = newEntityAttributeModes[nodeId] || defaultMode;
                    
                    // Extract fields and apply attributeMode
                    const fields = [];
                    if (entity.fields) {
                        for (const fieldName in entity.fields) {
                            // Use new node ID to look up toggles from already-remapped toggles
                            const toggleKey = `${nodeId}_${fieldName}`;
                            const isToggled = newAttributeToggles[toggleKey] || false;
                            const attributeMode = isToggled 
                                ? (entityMode === 'runtime' ? 'loadtime' : 'runtime') // Opposite of entity default
                                : entityMode; // Entity default
                            
                            fields.push({
                                name: fieldName,
                                type: entity.fields[fieldName].type || 'unknown',
                                attributeMode,
                                isPK: entity.fields[fieldName].isPK || false
                            });
                        }
                    }
                    
                    loadedNodes.push({
                        id: nodeId,
                        type: 'tableNode',
                        position: { x: 100 + (nodeIndex * 320), y: 100 + ((nodeIndex % 3) * 250) },
                        data: {
                            tableName,
                            tableType,
                            fields,
                            attributeToggles: newAttributeToggles, // Include toggles in initial data
                            globalAttributeMode: entityMode, // Include entity-specific mode
                            onAddField: handleAddField,
                            onRemoveField: handleRemoveField,
                            onDeleteTable: handleDeleteTable,
                            onTogglePK: handleTogglePK,
                            onShowReverseDeps: handleShowReverseDeps,
                            onToggleFieldSelection: handleToggleFieldSelection,
                            onOpenSettings: handleOpenSettings,
                            selectedFields: []
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
            
            // Set the remapped states (already computed above before node creation)
            setAttributeToggles(newAttributeToggles);
            setEntityAttributeModes(newEntityAttributeModes);
            if (dataProduct.globalAttributeMode) {
                setGlobalAttributeMode(dataProduct.globalAttributeMode);
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

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback((event) => {
        event.preventDefault();

        const tableData = event.dataTransfer.getData('application/reactflow');
        
        if (!tableData) {
            return;
        }

        const { tableName, tableType } = JSON.parse(tableData);
        
        // Get the position where the table was dropped
        const position = reactFlowInstance.screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
        });

        // Add the table at the drop position
        addTableToCanvas(tableName, tableType, position);
    }, [reactFlowInstance]);

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

    const handleTogglePK = useCallback((nodeId, fieldName) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === nodeId) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            fields: node.data.fields.map((field) =>
                                field.name === fieldName
                                    ? { ...field, isPK: !field.isPK }
                                    : field
                            )
                        }
                    };
                }
                return node;
            })
        );
    }, [setNodes]);

    const handleToggleFieldSelection = useCallback((nodeId, fieldName) => {
        // Update attribute toggles (for runtime/loadtime mode) using entity-specific keys
        setAttributeToggles((prev) => {
            const toggleKey = `${nodeId}_${fieldName}`;
            const currentToggle = prev[toggleKey] || false;
            return {
                ...prev,
                [toggleKey]: !currentToggle
            };
        });

        // Also update selectedFields for visual feedback in canvas
        setSelectedFields((prev) => {
            const nodeSelections = prev[nodeId] || [];
            const isSelected = nodeSelections.includes(fieldName);
            
            const newSelections = {
                ...prev,
                [nodeId]: isSelected
                    ? nodeSelections.filter(f => f !== fieldName)
                    : [...nodeSelections, fieldName]
            };
            
            // Update node data to reflect selection
            setNodes((nds) =>
                nds.map((node) => {
                    if (node.id === nodeId) {
                        return {
                            ...node,
                            data: {
                                ...node.data,
                                selectedFields: newSelections[nodeId]
                            }
                        };
                    }
                    return node;
                })
            );
            
            return newSelections;
        });
    }, [setNodes]);

    const handleCreateFromSelection = useCallback((nodeId, selectedFieldNames) => {
        // Use setNodes to access current nodes
        setNodes((currentNodes) => {
            const node = currentNodes.find(n => n.id === nodeId);
            
            if (!node) {
                return currentNodes; // Return unchanged
            }
            
            const selectedFieldsData = node.data.fields.filter(f => selectedFieldNames.includes(f.name));
            
            // Initialize attributeToggles based on current selectedFields from the node
            // Use entity-specific keys: nodeId_fieldName
            const initialToggles = {};
            node.data.fields.forEach(field => {
                // If field is in selectedFields, it means toggle is ON
                initialToggles[`${nodeId}_${field.name}`] = (node.data.selectedFields || []).includes(field.name);
            });
            setAttributeToggles(prev => ({ ...prev, ...initialToggles }));
            
            setSettingsData({
                nodeId,
                sourceEntityName: node.data.tableName,
                fields: selectedFieldsData,
                allFields: node.data.fields
            });
            setNewEntityName('');
            setNewEntityType('CTE');
            setSearchQuery('');
            setSettingsActiveTab('byMode');
            // Keep globalAttributeMode and tab1FilterMode as-is (don't reset)
            setShowSettingsDialog(true);
            
            return currentNodes; // Return unchanged nodes
        });
    }, []);

    const handleConfirmCreateByMode = useCallback(() => {
        if (!newEntityName.trim()) {
            alert('Please enter an entity name');
            return;
        }
        
        // Check if entity already exists
        const entityExists = nodes.some(n => 
            n.data.tableName === newEntityName && n.data.tableType === newEntityType
        );
        
        if (entityExists) {
            alert(`Entity "${newEntityName}" (${newEntityType}) already exists on canvas!`);
            return;
        }
        
        // Get source node to copy PK and connection details
        const sourceNode = nodes.find(n => n.id === settingsData.nodeId);
        
        // Get entity-specific mode (from dialog)
        const entityMode = globalAttributeMode; // This is set when dialog opens to entity's mode
        
        // Filter and map fields based on tab1FilterMode dropdown
        const fieldsToUse = settingsData.allFields
            .filter(f => {
                // Calculate the field's effective attribute mode
                const toggleKey = `${settingsData.nodeId}_${f.name}`;
                const isToggled = attributeToggles[toggleKey] || false;
                const fieldAttributeMode = isToggled 
                    ? (entityMode === 'runtime' ? 'loadtime' : 'runtime') // Opposite of default
                    : entityMode; // Use default
                
                // Apply filter based on tab1FilterMode
                if (tab1FilterMode === 'both') {
                    return true; // Include all fields
                } else {
                    return fieldAttributeMode === tab1FilterMode; // Only include matching mode
                }
            })
            .map(f => {
                const toggleKey = `${settingsData.nodeId}_${f.name}`;
                const isToggled = attributeToggles[toggleKey] || false;
                const attributeMode = isToggled 
                    ? (entityMode === 'runtime' ? 'loadtime' : 'runtime') // Opposite of default
                    : entityMode; // Use default
                
                // Copy PK status from source entity
                const sourceField = sourceNode?.data.fields.find(sf => sf.name === f.name);
                const isPK = sourceField?.isPK || false;
                
                return { ...f, attributeMode, isPK };
            });
        
        // Create new node with selected fields
        const newNodeId = `table-${Date.now()}`;
        const newNode = {
            id: newNodeId,
            type: 'tableNode',
            position: { 
                x: Math.random() * 300 + 100, 
                y: Math.random() * 300 + 100 
            },
            data: { 
                tableName: newEntityName,
                tableType: newEntityType,
                fields: fieldsToUse,
                selectedFields: [],
                onAddField: handleAddField,
                onRemoveField: handleRemoveField,
                onTogglePK: handleTogglePK,
                onToggleFieldSelection: handleToggleFieldSelection
            }
        };
        
        setNodes((nds) => {
            // Add the new node first
            const updatedNodes = [...nds, newNode];
            
            // Then update it with the missing handlers
            return updatedNodes.map(node => {
                if (node.id === newNodeId) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            onShowReverseDeps: (nodeId, tableName, tableType) => handleShowReverseDeps(nodeId, tableName, tableType),
                            onDeleteTable: (nodeId) => handleDeleteTable(nodeId),
                            onOpenSettings: (nodeId) => handleOpenSettings(nodeId)
                        }
                    };
                }
                return node;
            });
        });
        
        // Save entity-specific default mode for new entity
        setEntityAttributeModes(prev => ({
            ...prev,
            [newNodeId]: entityMode
        }));
        
        // Copy toggle states from source entity to new entity
        setAttributeToggles(prev => {
            const newToggles = { ...prev };
            fieldsToUse.forEach(field => {
                const sourceToggleKey = `${settingsData.nodeId}_${field.name}`;
                const newToggleKey = `${newNodeId}_${field.name}`;
                // Copy the toggle state from source to new entity
                if (prev[sourceToggleKey] !== undefined) {
                    newToggles[newToggleKey] = prev[sourceToggleKey];
                }
            });
            return newToggles;
        });
        
        // Collect edge information before setTimeout
        const edgesToCopy = [];
        const sourceNodeId = settingsData.nodeId;
        
        fieldsToUse.forEach((field, idx) => {
            // Check if source field has any outgoing connections - use filter to get ALL matches
            const outgoingEdges = edges.filter(e => 
                e.source === sourceNodeId && 
                e.sourceHandle === `${field.name}-source`
            );
            
            outgoingEdges.forEach((sourceEdge, edgeIdx) => {
                edgesToCopy.push({
                    field: field.name,
                    idx: `${idx}-${edgeIdx}`,
                    target: sourceEdge.target,
                    targetHandle: sourceEdge.targetHandle,
                    connectionType: sourceEdge.data?.connectionType || 'ref',
                    calculation: sourceEdge.data?.calculation || '',
                    type: 'outgoing'
                });
            });
            
            // Also check for incoming connections to this field - use filter to get ALL matches
            const incomingEdges = edges.filter(e => 
                e.target === sourceNodeId && 
                e.targetHandle === `${field.name}-target`
            );
            
            incomingEdges.forEach((incomingEdge, edgeIdx) => {
                edgesToCopy.push({
                    field: field.name,
                    idx: `${idx}-${edgeIdx}`,
                    source: incomingEdge.source,
                    sourceHandle: incomingEdge.sourceHandle,
                    connectionType: incomingEdge.data?.connectionType || 'ref',
                    calculation: incomingEdge.data?.calculation || '',
                    type: 'incoming'
                });
            });
        });
        
        // Create edges from source entity to new entity for all fields
        // Use setTimeout to ensure node is created first
        setTimeout(() => {
            if (edgesToCopy.length > 0) {
                const newEdges = edgesToCopy.map(edgeInfo => {
                    if (edgeInfo.type === 'outgoing') {
                        // Outgoing edge: new node is the source
                        return {
                            id: `edge-${newNodeId}-${edgeInfo.field}-${edgeInfo.idx}-out`,
                            source: newNodeId,
                            target: edgeInfo.target,
                            sourceHandle: `${edgeInfo.field}-source`,
                            targetHandle: edgeInfo.targetHandle,
                            type: 'smoothstep',
                            animated: true,
                            markerEnd: { type: MarkerType.ArrowClosed },
                            data: { 
                                connectionType: edgeInfo.connectionType,
                                calculation: edgeInfo.calculation
                            },
                            style: { 
                                stroke: edgeInfo.connectionType === 'calculation' ? '#8b5cf6' : '#3b82f6', 
                                strokeWidth: 2 
                            }
                        };
                    } else {
                        // Incoming edge: new node is the target
                        return {
                            id: `edge-${newNodeId}-${edgeInfo.field}-${edgeInfo.idx}-in`,
                            source: edgeInfo.source,
                            target: newNodeId,
                            sourceHandle: edgeInfo.sourceHandle,
                            targetHandle: `${edgeInfo.field}-target`,
                            type: 'smoothstep',
                            animated: true,
                            markerEnd: { type: MarkerType.ArrowClosed },
                            data: { 
                                connectionType: edgeInfo.connectionType,
                                calculation: edgeInfo.calculation
                            },
                            style: { 
                                stroke: edgeInfo.connectionType === 'calculation' ? '#8b5cf6' : '#3b82f6', 
                                strokeWidth: 2 
                            }
                        };
                    }
                });
                
                setEdges((eds) => {
                    const updated = [...eds, ...newEdges];
                    return updated;
                });
            }
        }, 100);
        
        // Clear selection from source node
        setSelectedFields((prev) => ({
            ...prev,
            [settingsData.nodeId]: []
        }));
        
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === settingsData.nodeId) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            selectedFields: []
                        }
                    };
                }
                return node;
            })
        );
        
        // Update appropriate list based on type
        if (newEntityType === 'BASE') {
            if (!fileBaseTables.includes(newEntityName)) {
                setFileBaseTables(prev => [...prev, newEntityName]);
            }
        } else if (newEntityType === 'VIEW') {
            if (!fileViewTables.includes(newEntityName)) {
                setFileViewTables(prev => [...prev, newEntityName]);
            }
        } else if (newEntityType === 'CTE') {
            setCustomTables(prev => ({
                ...prev,
                CTE: [...prev.CTE, newEntityName]
            }));
        }
        
        setShowSettingsDialog(false);
    }, [newEntityName, newEntityType, nodes, settingsData, globalAttributeMode, attributeToggles, edges, handleAddField, handleRemoveField, handleTogglePK, handleToggleFieldSelection, fileBaseTables, fileViewTables, setNodes, setEdges, setCustomTables, setFileBaseTables, setFileViewTables]);

    const handleConfirmCreateFromSelected = useCallback(() => {
        if (!newEntityName.trim()) {
            alert('Please enter an entity name');
            return;
        }
        
        // Check if entity already exists
        const entityExists = nodes.some(n => 
            n.data.tableName === newEntityName && n.data.tableType === newEntityType
        );
        
        if (entityExists) {
            alert(`Entity "${newEntityName}" (${newEntityType}) already exists on canvas!`);
            return;
        }
        
        // Get source node to copy PK and connection details
        const sourceNode = nodes.find(n => n.id === settingsData.nodeId);
        
        // Get entity-specific mode (from dialog)
        const entityMode = globalAttributeMode; // This is set when dialog opens to entity's mode
        
        // Get selected fields from attributeSelections and apply attribute mode based on canvas toggles
        const selectedFields = settingsData.allFields ? settingsData.allFields.filter(f => attributeSelections[f.name]) : [];
        
        if (selectedFields.length === 0) {
            alert('Please select at least one attribute');
            return;
        }
        
        const fieldsToUse = selectedFields.map(f => {
            const toggleKey = `${settingsData.nodeId}_${f.name}`;
            const isToggled = attributeToggles[toggleKey] || false;
            const attributeMode = isToggled 
                ? (entityMode === 'runtime' ? 'loadtime' : 'runtime') // Opposite of default
                : entityMode; // Use default
            
            // Copy PK status from source entity
            const sourceField = sourceNode?.data.fields.find(sf => sf.name === f.name);
            const isPK = sourceField?.isPK || false;
            
            return { ...f, attributeMode, isPK };
        });
        
        // Create new node with all fields
        const newNodeId = `table-${Date.now()}`;
        
        const newNode = {
            id: newNodeId,
            type: 'tableNode',
            position: { 
                x: Math.random() * 300 + 100, 
                y: Math.random() * 300 + 100 
            },
            data: { 
                tableName: newEntityName,
                tableType: newEntityType,
                fields: fieldsToUse,
                selectedFields: [],
                onAddField: handleAddField,
                onRemoveField: handleRemoveField,
                onTogglePK: handleTogglePK,
                onToggleFieldSelection: handleToggleFieldSelection
            }
        };
        
        setNodes((nds) => {
            // Add the new node first
            const updatedNodes = [...nds, newNode];
            
            // Then update it with the missing handlers
            return updatedNodes.map(node => {
                if (node.id === newNodeId) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            onShowReverseDeps: (nodeId, tableName, tableType) => handleShowReverseDeps(nodeId, tableName, tableType),
                            onDeleteTable: (nodeId) => handleDeleteTable(nodeId),
                            onOpenSettings: (nodeId) => handleOpenSettings(nodeId)
                        }
                    };
                }
                return node;
            });
        });
        
        // Save entity-specific default mode for new entity
        setEntityAttributeModes(prev => ({
            ...prev,
            [newNodeId]: entityMode
        }));
        
        // Copy toggle states from source entity to new entity
        setAttributeToggles(prev => {
            const newToggles = { ...prev };
            fieldsToUse.forEach(field => {
                const sourceToggleKey = `${settingsData.nodeId}_${field.name}`;
                const newToggleKey = `${newNodeId}_${field.name}`;
                // Copy the toggle state from source to new entity
                if (prev[sourceToggleKey] !== undefined) {
                    newToggles[newToggleKey] = prev[sourceToggleKey];
                }
            });
            return newToggles;
        });
        
        // Collect edge information before setTimeout
        const edgesToCopy = [];
        const sourceNodeId = settingsData.nodeId;
        
        fieldsToUse.forEach((field, idx) => {
            // Check if source field has any outgoing connections
            const outgoingEdges = edges.filter(e => 
                e.source === sourceNodeId && 
                e.sourceHandle === `${field.name}-source`
            );
            
            outgoingEdges.forEach((sourceEdge, edgeIdx) => {
                edgesToCopy.push({
                    field: field.name,
                    idx: `${idx}-${edgeIdx}`,
                    target: sourceEdge.target,
                    targetHandle: sourceEdge.targetHandle,
                    connectionType: sourceEdge.data?.connectionType || 'ref',
                    calculation: sourceEdge.data?.calculation || '',
                    type: 'outgoing'
                });
            });
            
            // Also check for incoming connections to this field
            const incomingEdges = edges.filter(e => 
                e.target === sourceNodeId && 
                e.targetHandle === `${field.name}-target`
            );
            
            incomingEdges.forEach((incomingEdge, edgeIdx) => {
                edgesToCopy.push({
                    field: field.name,
                    idx: `${idx}-${edgeIdx}`,
                    source: incomingEdge.source,
                    sourceHandle: incomingEdge.sourceHandle,
                    connectionType: incomingEdge.data?.connectionType || 'ref',
                    calculation: incomingEdge.data?.calculation || '',
                    type: 'incoming'
                });
            });
        });
        
        // Create edges from source entity to new entity for selected fields
        // Use setTimeout to ensure node is created first
        setTimeout(() => {
            if (edgesToCopy.length > 0) {
                const newEdges = edgesToCopy.map(edgeInfo => {
                    if (edgeInfo.type === 'outgoing') {
                        // Outgoing edge: new node is the source
                        return {
                            id: `edge-${newNodeId}-${edgeInfo.field}-${edgeInfo.idx}-out`,
                            source: newNodeId,
                            target: edgeInfo.target,
                            sourceHandle: `${edgeInfo.field}-source`,
                            targetHandle: edgeInfo.targetHandle,
                            type: 'smoothstep',
                            animated: true,
                            markerEnd: { type: MarkerType.ArrowClosed },
                            data: { 
                                connectionType: edgeInfo.connectionType,
                                calculation: edgeInfo.calculation
                            },
                            style: { 
                                stroke: edgeInfo.connectionType === 'calculation' ? '#8b5cf6' : '#3b82f6', 
                                strokeWidth: 2 
                            }
                        };
                    } else {
                        // Incoming edge: new node is the target
                        return {
                            id: `edge-${newNodeId}-${edgeInfo.field}-${edgeInfo.idx}-in`,
                            source: edgeInfo.source,
                            target: newNodeId,
                            sourceHandle: edgeInfo.sourceHandle,
                            targetHandle: `${edgeInfo.field}-target`,
                            type: 'smoothstep',
                            animated: true,
                            markerEnd: { type: MarkerType.ArrowClosed },
                            data: { 
                                connectionType: edgeInfo.connectionType,
                                calculation: edgeInfo.calculation
                            },
                            style: { 
                                stroke: edgeInfo.connectionType === 'calculation' ? '#8b5cf6' : '#3b82f6', 
                                strokeWidth: 2 
                            }
                        };
                    }
                });
                
                setEdges((eds) => [...eds, ...newEdges]);
            }
        }, 100);
        
        // Update appropriate list based on type
        if (newEntityType === 'BASE') {
            if (!fileBaseTables.includes(newEntityName)) {
                setFileBaseTables(prev => [...prev, newEntityName]);
            }
        } else if (newEntityType === 'VIEW') {
            if (!fileViewTables.includes(newEntityName)) {
                setFileViewTables(prev => [...prev, newEntityName]);
            }
        } else if (newEntityType === 'CTE') {
            setCustomTables(prev => ({
                ...prev,
                CTE: [...prev.CTE, newEntityName]
            }));
        }
        
        setShowSettingsDialog(false);
    }, [newEntityName, newEntityType, nodes, settingsData, globalAttributeMode, attributeToggles, attributeSelections, edges, handleAddField, handleRemoveField, handleTogglePK, handleToggleFieldSelection, fileBaseTables, fileViewTables, setNodes, setEdges, setCustomTables, setFileBaseTables, setFileViewTables]);

    const handleOpenSettings = useCallback((nodeId) => {
        setNodes((currentNodes) => {
            const node = currentNodes.find(n => n.id === nodeId);
            
            if (!node) {
                return currentNodes;
            }
            
            // Get selected fields for this node
            const selectedFieldsForNode = node.data.selectedFields || [];
            const selectedFieldsData = node.data.fields.filter(f => selectedFieldsForNode.includes(f.name));
            
            // Get or initialize entity-specific default mode using ref to access current state
            const entityMode = entityAttributeModesRef.current[nodeId] || 'runtime';
            setGlobalAttributeMode(entityMode); // Set to dialog for editing
            
            // Initialize entity-specific toggles if they don't exist yet
            setAttributeToggles(prev => {
                const initialToggles = {};
                node.data.fields.forEach(field => {
                    const toggleKey = `${nodeId}_${field.name}`;
                    // Only initialize if not already set
                    if (prev[toggleKey] === undefined) {
                        // Read from field.attributeMode if it exists
                        // If attributeMode matches entityMode, toggle is OFF
                        // If attributeMode is opposite of entityMode, toggle is ON
                        const fieldMode = field.attributeMode || entityMode;
                        const shouldToggle = fieldMode !== entityMode;
                        initialToggles[toggleKey] = shouldToggle;
                    }
                });
                return Object.keys(initialToggles).length > 0 ? { ...prev, ...initialToggles } : prev;
            });
            
            setSettingsData({
                nodeId,
                sourceEntityName: node.data.tableName,
                fields: selectedFieldsData,
                allFields: node.data.fields
            });
            setNewEntityName('');
            setNewEntityType('CTE');
            setSearchQuery('');
            setAttributeSearchQuery(''); // Reset attribute search query
            setSettingsActiveTab('byMode');
            setAttributeSelections({}); // Reset selection state for new dialog
            // Keep globalAttributeMode, tab1FilterMode, and attributeToggles as-is (don't reset)
            setShowSettingsDialog(true);
            
            return currentNodes;
        });
    }, []); // Empty deps - using ref for entityAttributeModes

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
        
        // Refresh open dialogs after deletion to show newly available entities
        setTimeout(() => {
            if (showReverseDepsDialog && selectedEntityForReverseDeps) {
                handleShowReverseDeps(
                    selectedEntityForReverseDeps.nodeId,
                    selectedEntityForReverseDeps.tableName,
                    selectedEntityForReverseDeps.tableType
                );
            }
            if (showSuggestDialog) {
                generateSuggestions(nodes.filter(n => n.id !== nodeId), sourceDataProduct);
            }
        }, 100);
    }, [setNodes, setEdges, showReverseDepsDialog, selectedEntityForReverseDeps, showSuggestDialog, nodes]);

    const addTableToCanvas = (tableName, tableType = 'BASE', fields = [], customPosition = null) => {
        // Check if entity already exists on canvas (by name AND type)
        const entityExists = nodes.some(n => 
            n.data.tableName === tableName && n.data.tableType === tableType
        );
        
        if (entityExists) {
            alert(`Entity "${tableName}" (${tableType}) already exists on canvas!`);
            return false;
        }
        
        const table = tableMetadata[tableName];
        // Use type from metadata if available, otherwise use passed tableType
        const actualType = table?.type || tableType;
        const finalFields = fields.length > 0 ? fields : (table?.fields || []);

        const newNode = {
            id: `table-${Date.now()}`,
            type: 'tableNode',
            position: customPosition || { 
                x: Math.random() * 300 + 100, 
                y: Math.random() * 300 + 100 
            },
            data: { 
                tableName: tableName,
                tableType: actualType,
                fields: finalFields,
                onAddField: handleAddField,
                onRemoveField: handleRemoveField,
                onDeleteTable: handleDeleteTable,
                onTogglePK: handleTogglePK,
                onShowReverseDeps: handleShowReverseDeps,
                onToggleFieldSelection: handleToggleFieldSelection,
                onOpenSettings: handleOpenSettings,
                selectedFields: []
            }
        };

        setNodes((nds) => [...nds, newNode]);
        return true;
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
                },
                attributeToggles,
                entityAttributeModes,
                globalAttributeMode
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

    const handleShowReverseDeps = async (nodeId, tableName, tableType) => {
        try {
            const entityKey = `${tableType}_${tableName}`;
            setSelectedEntityForReverseDeps({ nodeId, tableName, tableType, entityKey });
            
            const entities = sourceDataProduct?.entities || {};
            const selectedEntityData = entities[entityKey];

            if (!selectedEntityData || !selectedEntityData.fields) {
                setReverseDeps([]);
                setShowReverseDepsDialog(true);
                return;
            }

            // Now find what entities the selected entity depends on (downstream dependencies)
            const requiredEntities = new Map(); // Map of entityKey -> {connections: [], entityType}
            const canvasEntityKeys = new Set(nodes.map(n => `${n.data.tableType}_${n.data.tableName}`));

            // Analyze all fields of the selected entity to find its dependencies
            const entityFields = Object.keys(selectedEntityData.fields || {});
            
            entityFields.forEach(fieldName => {
                const fieldData = selectedEntityData.fields[fieldName];
                
                const processRefs = (refs, isCalculation = false) => {
                    if (refs && Array.isArray(refs)) {
                        refs.forEach(refPath => {
                            const [refEntity, refField] = refPath.split('.');
                            if (refEntity && refField && refEntity !== entityKey) {
                                // Skip if already on canvas
                                if (canvasEntityKeys.has(refEntity)) return;
                                
                                if (!requiredEntities.has(refEntity)) {
                                    requiredEntities.set(refEntity, {
                                        connections: [],
                                        entityType: refEntity.startsWith('BASE_') ? 'BASE' : 
                                                   refEntity.startsWith('CTE_') ? 'CTE' : 'VIEW'
                                    });
                                }
                                
                                requiredEntities.get(refEntity).connections.push({
                                    sourceField: refField,
                                    targetField: fieldName,
                                    isCalculation: isCalculation,
                                    connectionType: isCalculation ? 'calculation' : 'ref',
                                    calculation: isCalculation ? (fieldData.calculation?.expression || '') : null
                                });
                            }
                        });
                    }
                };

                processRefs(fieldData.ref, false);
                if (fieldData.calculation) {
                    processRefs(fieldData.calculation.ref, true);
                }
            });

            // Build reverse dependencies list from the current data product source
            const foundReverseDeps = [];
            
            for (const [requiredEntityKey, info] of requiredEntities.entries()) {
                const reqEntity = entities[requiredEntityKey];
                if (!reqEntity) {
                    continue;
                }
                
                const entityFieldsData = Object.keys(reqEntity.fields || {}).map(fieldName => ({
                    name: fieldName,
                    type: reqEntity.fields[fieldName]?.type || 'VARCHAR'
                }));
                
                // Build dependency map
                const dependencyMap = {};
                dependencyMap[requiredEntityKey] = info.connections.map(conn => ({
                    targetField: conn.targetField,
                    sourceField: conn.sourceField,
                    connectionType: conn.connectionType,
                    calculation: conn.calculation
                }));

                const entityType = info.entityType || (requiredEntityKey.match(/^(BASE|CTE|VIEW)_/)?.[1] || 'BASE');
                const sourceName = sourceDataProduct?.metadata?.name || 'Data Product';
                
                foundReverseDeps.push({
                    entityName: requiredEntityKey,
                    alias: reqEntity.alias || requiredEntityKey,
                    entityType,
                    sourceFile: sourceName,
                    dependencyMap: dependencyMap,
                    entityData: reqEntity,
                    fields: entityFieldsData,
                    connectionCount: info.connections.length
                });
            }

            setReverseDeps(foundReverseDeps);
            setShowReverseDepsDialog(true);
        } catch (error) {
            console.error('Error finding downstream dependencies:', error);
            alert('Error finding downstream dependencies: ' + error.message);
        }
    };

    const handleSuggest = async () => {
        await generateSuggestions(nodes, sourceDataProduct);
    };

    const handleAddSuggestedEntity = async (suggestion) => {
        try {
            // Check if entity already exists on canvas (by name AND type)
            const checkEntityName = suggestion.entityName.replace(/^(BASE_|CTE_|VIEW_)/, '');
            const checkEntityType = suggestion.entityType || (suggestion.entityName.startsWith('CTE_') ? 'CTE' : 'VIEW');
            const entityExists = nodes.some(n => 
                n.data.tableName === checkEntityName && n.data.tableType === checkEntityType
            );
            
            if (entityExists) {
                alert(`Entity "${checkEntityName}" (${checkEntityType}) already exists on canvas!`);
                return;
            }
            
            const sourceEntities = sourceDataProduct?.entities || {};
            const entity = suggestion.entityData || sourceEntities[suggestion.entityName];
            
            if (!entity) {
                alert('Entity not found in data product source');
                return;
            }

            // Collect missing entities to add (BASE, CTE, VIEW)
            let addedNodes = [];
            if (suggestion.coveragePercent < 100 && suggestion.missingEntities && suggestion.missingEntities.length > 0) {
                // Add missing entities from the same source file
                for (const missingEntity of suggestion.missingEntities) {
                    // Check if entity exists in the data
                    const missingEntityData = sourceEntities[missingEntity.fullKey];
                    
                    if (missingEntityData) {
                        const missingFields = Object.keys(missingEntityData.fields || {}).map(fieldName => ({
                            name: fieldName,
                            type: 'VARCHAR'
                        }));
                        
                        // Create node for missing entity (BASE, CTE, or VIEW)
                        const missingNodeId = `table-${Date.now()}-${Math.random()}`;
                        const missingNode = {
                            id: missingNodeId,
                            type: 'tableNode',
                            position: { 
                                x: Math.random() * 300 + 100, 
                                y: Math.random() * 300 + 100 
                            },
                            data: { 
                                tableName: missingEntity.name,
                                tableType: missingEntity.type,
                                fields: missingFields,
                                entityKey: missingEntity.fullKey, // Store full entity key for mapping
                                onAddField: handleAddField,
                                onRemoveField: handleRemoveField,
                                onDeleteTable: handleDeleteTable,
                                onTogglePK: handleTogglePK,
                                onShowReverseDeps: handleShowReverseDeps,
                                onToggleFieldSelection: handleToggleFieldSelection,
                                onOpenSettings: handleOpenSettings,
                                selectedFields: []
                            }
                        };
                        
                        addedNodes.push(missingNode);
                        
                        // Update appropriate list based on type
                        if (missingEntity.type === 'BASE') {
                            if (!fileBaseTables.includes(missingEntity.name)) {
                                setFileBaseTables(prev => [...prev, missingEntity.name]);
                            }
                        } else if (missingEntity.type === 'VIEW') {
                            if (!fileViewTables.includes(missingEntity.name)) {
                                setFileViewTables(prev => [...prev, missingEntity.name]);
                            }
                        } else if (missingEntity.type === 'CTE') {
                            setCustomTables(prev => ({
                                ...prev,
                                CTE: [...prev.CTE, missingEntity.name]
                            }));
                        }
                    }
                }
            }

            // Extract fields from entity
            const entityFields = Object.keys(entity.fields || {}).map(fieldName => ({
                name: fieldName,
                type: 'VARCHAR'
            }));

            // Add the suggested entity to canvas (use checkEntityType and checkEntityName from duplicate check above)
            
            // Create the new node for suggested entity
            const newNodeId = `table-${Date.now()}`;
            const newNode = {
                id: newNodeId,
                type: 'tableNode',
                position: { 
                    x: Math.random() * 300 + 100, 
                    y: Math.random() * 300 + 100 
                },
                data: { 
                    tableName: checkEntityName,
                    tableType: checkEntityType,
                    fields: entityFields,
                    entityKey: suggestion.entityName, // Store full entity key
                    onAddField: handleAddField,
                    onRemoveField: handleRemoveField,
                    onDeleteTable: handleDeleteTable,
                    onTogglePK: handleTogglePK,
                    onShowReverseDeps: handleShowReverseDeps,
                    onToggleFieldSelection: handleToggleFieldSelection,
                    onOpenSettings: handleOpenSettings,
                    selectedFields: []
                }
            };

            // Get current nodes and add all new nodes
            setNodes((currentNodes) => {
                const allNodesForMapping = [...currentNodes, ...addedNodes, newNode];
                const updatedNodes = [...currentNodes, ...addedNodes, newNode];
                
                // Create connections using the dependency map
                const newEdges = [];
                
                if (suggestion.dependencyMap) {
                    // Iterate through each dependency in the map
                    Object.keys(suggestion.dependencyMap).forEach(dependentEntityKey => {
                        const connections = suggestion.dependencyMap[dependentEntityKey];
                        
                        // Find the source node (dependent entity)
                        const sourceNode = allNodesForMapping.find(n => {
                            const nodeEntityKey = `${n.data.tableType}_${n.data.tableName}`;
                            return nodeEntityKey === dependentEntityKey || 
                                   n.data.entityKey === dependentEntityKey ||
                                   n.data.tableName === dependentEntityKey.replace(/^(BASE_|CTE_|VIEW_)/, '');
                        });
                        
                        if (sourceNode) {
                            // Create edges for each connection detail
                            connections.forEach(conn => {
                                // Verify source node has the required field
                                const hasSourceField = sourceNode.data.fields.some(f => f.name === conn.sourceField);
                                
                                if (hasSourceField) {
                                    const edgeColor = conn.connectionType === 'calculation' ? '#8b5cf6' : '#3b82f6';
                                    
                                    newEdges.push({
                                        id: `e-${sourceNode.id}-${newNodeId}-${conn.targetField}-${conn.sourceField}-${Date.now()}-${Math.random()}`,
                                        source: sourceNode.id,
                                        target: newNodeId,
                                        sourceHandle: `${conn.sourceField}-source`,
                                        targetHandle: `${conn.targetField}-target`,
                                        type: 'smoothstep',
                                        animated: true,
                                        style: { strokeWidth: 2, stroke: edgeColor },
                                        markerEnd: {
                                            type: MarkerType.ArrowClosed,
                                            width: 20,
                                            height: 20,
                                            color: edgeColor
                                        },
                                        data: {
                                            connectionType: conn.connectionType,
                                            calculation: conn.calculation || '',
                                            sourceField: conn.sourceField,
                                            targetField: conn.targetField
                                        }
                                    });
                                } else {
                                    console.warn(`Field ${conn.sourceField} not found in source node ${sourceNode.data.tableName}`);
                                }
                            });
                        } else {
                            console.warn(`Source node not found for dependency ${dependentEntityKey}`);
                        }
                    });
                }

                // Add edges to state
                if (newEdges.length > 0) {
                    setEdges((currentEdges) => [...currentEdges, ...newEdges]);
                }

                return updatedNodes;
            });

            // Auto-arrange layout after adding entity
            setTimeout(() => {
                setNodes((currentNodes) => {
                    setEdges((currentEdges) => {
                        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
                            currentNodes,
                            currentEdges,
                            'LR'
                        );
                        setNodes(layoutedNodes);
                        setEdges(layoutedEdges);
                        return currentEdges;
                    });
                    return currentNodes;
                });
            }, 100);

            setShowSuggestDialog(false);
        } catch (error) {
            console.error('Error adding suggested entity:', error);
            alert('Error adding suggested entity: ' + error.message);
        }
    };

    const handleAddReverseDep = async (suggestion) => {
        try {
            // Check if entity already exists on canvas (by name AND type)
            const checkEntityName = suggestion.entityName.replace(/^(BASE_|CTE_|VIEW_)/, '');
            const checkEntityType = suggestion.entityType || (suggestion.entityName.startsWith('CTE_') ? 'CTE' : 'VIEW');
            const entityExists = nodes.some(n => 
                n.data.tableName === checkEntityName && n.data.tableType === checkEntityType
            );
            
            if (entityExists) {
                alert(`Entity "${checkEntityName}" (${checkEntityType}) already exists on canvas!`);
                return;
            }
            
            const sourceEntities = sourceDataProduct?.entities || {};
            const entity = suggestion.entityData || sourceEntities[suggestion.entityName];
            
            if (!entity) {
                alert('Entity not found in data product source');
                return;
            }

            // Extract fields from entity
            const entityFields = Object.keys(entity.fields || {}).map(fieldName => ({
                name: fieldName,
                type: 'VARCHAR'
            }));

            // Create the new node for downstream dependency
            const newNodeId = `table-${Date.now()}`;
            const newNode = {
                id: newNodeId,
                type: 'tableNode',
                position: { 
                    x: Math.random() * 300 + 100, 
                    y: Math.random() * 300 + 100 
                },
                data: { 
                    tableName: checkEntityName,
                    tableType: checkEntityType,
                    fields: entityFields,
                    entityKey: suggestion.entityName,
                    onAddField: handleAddField,
                    onRemoveField: handleRemoveField,
                    onDeleteTable: handleDeleteTable,
                    onTogglePK: handleTogglePK,
                    onShowReverseDeps: handleShowReverseDeps,
                    onToggleFieldSelection: handleToggleFieldSelection,
                    onOpenSettings: handleOpenSettings,
                    selectedFields: []
                }
            };

            // Find the entity that depends on this (the selected entity)
            const targetNode = nodes.find(n => n.id === selectedEntityForReverseDeps.nodeId);
            
            setNodes((currentNodes) => [...currentNodes, newNode]);
            
            // Create connections FROM the new dependency TO the entity that needs it
            const newEdges = [];
            
            if (suggestion.dependencyMap && selectedEntityForReverseDeps && targetNode) {
                // Iterate through connections in the dependency map
                Object.keys(suggestion.dependencyMap).forEach(dependentEntityKey => {
                    const connections = suggestion.dependencyMap[dependentEntityKey];
                    
                    // Create edges for each connection detail
                    connections.forEach(conn => {
                        const hasSourceField = newNode.data.fields.some(f => f.name === conn.sourceField);
                        const hasTargetField = targetNode.data.fields.some(f => f.name === conn.targetField);
                        
                        if (hasSourceField && hasTargetField) {
                            const edgeColor = conn.connectionType === 'calculation' ? '#8b5cf6' : '#3b82f6';
                            
                            newEdges.push({
                                id: `e-${newNodeId}-${targetNode.id}-${conn.sourceField}-${conn.targetField}-${Date.now()}-${Math.random()}`,
                                source: newNodeId,
                                target: targetNode.id,
                                sourceHandle: `${conn.sourceField}-source`,
                                targetHandle: `${conn.targetField}-target`,
                                type: 'smoothstep',
                                animated: true,
                                style: { strokeWidth: 2, stroke: edgeColor },
                                markerEnd: {
                                    type: MarkerType.ArrowClosed,
                                    width: 20,
                                    height: 20,
                                    color: edgeColor
                                },
                                label: conn.connectionType === 'calculation' ? 'calc' : 'ref'
                            });
                        }
                    });
                });
            }
            
            // Add edges to state
            if (newEdges.length > 0) {
                setEdges((currentEdges) => [...currentEdges, ...newEdges]);
            }

            // Update appropriate list based on type
            if (checkEntityType === 'BASE') {
                if (!fileBaseTables.includes(checkEntityName)) {
                    setFileBaseTables(prev => [...prev, checkEntityName]);
                }
            } else if (checkEntityType === 'VIEW') {
                if (!fileViewTables.includes(checkEntityName)) {
                    setFileViewTables(prev => [...prev, checkEntityName]);
                }
            } else if (checkEntityType === 'CTE') {
                setCustomTables(prev => ({
                    ...prev,
                    CTE: [...prev.CTE, checkEntityName]
                }));
            }

            // Auto-arrange layout after adding entity
            setTimeout(() => {
                setNodes((currentNodes) => {
                    setEdges((currentEdges) => {
                        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
                            currentNodes,
                            currentEdges,
                            'LR'
                        );
                        setNodes(layoutedNodes);
                        setEdges(layoutedEdges);
                        return currentEdges;
                    });
                    return currentNodes;
                });
            }, 100);

            // Refresh the reverse deps list to remove the added entity
            setTimeout(() => {
                if (selectedEntityForReverseDeps) {
                    handleShowReverseDeps(
                        selectedEntityForReverseDeps.nodeId,
                        selectedEntityForReverseDeps.tableName,
                        selectedEntityForReverseDeps.tableType
                    );
                }
            }, 300);
        } catch (error) {
            console.error('Error adding downstream dependency:', error);
            alert('Error adding downstream dependency: ' + error.message);
        }
    };

    const checkIfEntityCanBeFormed = (entityKey, entityFields, entity, canvasTables) => {
        const matchingTables = new Set();
        const foundFields = new Set();
        const fieldSources = {};
        const missingEntitiesMap = new Map(); // Track missing entities with their types
        const requiredFieldsList = [];

        // For each field in the entity, check if it exists in canvas tables or can be calculated
        entityFields.forEach(fieldName => {
            const fieldData = entity.fields[fieldName];

            // Check if field has a reference to a base table
            if (fieldData.ref && Array.isArray(fieldData.ref)) {
                let fieldFound = false;
                fieldData.ref.forEach(refPath => {
                    // Parse ref like "BASE_CompaniesMD.Client_MANDT"
                    const [refEntity, refField] = refPath.split('.');
                    const refTableName = refEntity.replace(/^(BASE_|CTE_|VIEW_)/, '');
                    const refType = refEntity.match(/^(BASE|CTE|VIEW)_/) ? refEntity.match(/^(BASE|CTE|VIEW)_/)[1] : 'BASE';

                    // Check if this table exists in canvas (match by name or full key)
                    const canvasTable = canvasTables.find(t => 
                        t.name === refTableName || 
                        t.name === refEntity ||
                        t.fullKey === refEntity
                    );

                    if (canvasTable) {
                        matchingTables.add(canvasTable.name);
                        fieldFound = true;
                        if (!fieldSources[fieldName]) fieldSources[fieldName] = [];
                        fieldSources[fieldName].push(`${canvasTable.name}.${refField}`);
                    } else {
                        // Track missing source entities with their full key and type
                        missingEntitiesMap.set(refEntity, {
                            fullKey: refEntity,
                            name: refTableName,
                            type: refType
                        });
                        requiredFieldsList.push({
                            field: fieldName,
                            needsTable: refEntity,
                            needsField: refField
                        });
                    }
                });
                if (fieldFound) {
                    foundFields.add(fieldName);
                }
            }
            // Check if field has calculation
            else if (fieldData.calculation) {
                // Check if calculation references are in canvas
                if (fieldData.calculation.ref && Array.isArray(fieldData.calculation.ref)) {
                    let allRefsFound = true;
                    const calcRefs = [];
                    
                    fieldData.calculation.ref.forEach(refPath => {
                        const [refEntity, refField] = refPath.split('.');
                        const refTableName = refEntity.replace(/^(BASE_|CTE_|VIEW_)/, '');
                        const refType = refEntity.match(/^(BASE|CTE|VIEW)_/) ? refEntity.match(/^(BASE|CTE|VIEW)_/)[1] : 'BASE';
                        
                        const canvasTable = canvasTables.find(t => 
                            t.name === refTableName || 
                            t.name === refEntity ||
                            t.fullKey === refEntity
                        );
                        
                        if (canvasTable) {
                            matchingTables.add(canvasTable.name);
                            calcRefs.push(`${canvasTable.name}.${refField}`);
                        } else {
                            allRefsFound = false;
                            missingEntitiesMap.set(refEntity, {
                                fullKey: refEntity,
                                name: refTableName,
                                type: refType
                            });
                            requiredFieldsList.push({
                                field: fieldName,
                                needsTable: refEntity,
                                needsField: refField,
                                isCalculation: true
                            });
                        }
                    });
                    
                    if (allRefsFound) {
                        foundFields.add(fieldName);
                        if (!fieldSources[fieldName]) fieldSources[fieldName] = [];
                        fieldSources[fieldName].push(`Calc: ${fieldData.calculation.expression}`);
                    }
                }
            }
            // Direct field check
            else {
                // Check if field exists directly in any canvas table
                let directFound = false;
                canvasTables.forEach(table => {
                    if (table.fields.includes(fieldName)) {
                        matchingTables.add(table.name);
                        foundFields.add(fieldName);
                        directFound = true;
                        if (!fieldSources[fieldName]) fieldSources[fieldName] = [];
                        fieldSources[fieldName].push(`${table.name}.${fieldName}`);
                    }
                });
                
                if (!directFound) {
                    requiredFieldsList.push({
                        field: fieldName,
                        needsTable: 'Unknown',
                        needsField: fieldName
                    });
                }
            }
        });

        const coveragePercent = Math.round((foundFields.size / entityFields.length) * 100);
        const missingFields = entityFields.filter(f => !foundFields.has(f));

        return {
            possible: foundFields.size > 0, // At least one field can be formed
            matchingTables: Array.from(matchingTables),
            missingEntities: Array.from(missingEntitiesMap.values()),
            coveragePercent,
            missingFields,
            fieldSources,
            requiredFields: requiredFieldsList
        };
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
                    
                    <button
                        onClick={onLayout}
                        style={{
                            background: "rgba(59, 130, 246, 0.15)",
                            border: "1px solid rgba(59, 130, 246, 0.3)",
                            borderRadius: "6px",
                            padding: "8px 12px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "13px",
                            fontWeight: 500,
                            color: "#3b82f6",
                            transition: "all 200ms ease",
                            boxShadow: "0 2px 8px rgba(59, 130, 246, 0.2)",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(59, 130, 246, 0.25)";
                            e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.5)";
                            e.currentTarget.style.transform = "translateY(-1px)";
                            e.currentTarget.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.3)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "rgba(59, 130, 246, 0.15)";
                            e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.3)";
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "0 2px 8px rgba(59, 130, 246, 0.2)";
                        }}
                        title="Auto-arrange nodes in a layout"
                    >
                        <FiLayout size={14} />
                        Auto-Arrange
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
                        onClick={handleSuggest}
                        style={{
                            background: "#f59e0b",
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
                            e.currentTarget.style.background = "#d97706";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "#f59e0b";
                        }}
                    >
                        <FiZap size={14} />
                        Suggest Entities
                    </button>
                    
                    <button
                        onClick={() => {
                            const dataProduct = {
                                name: currentDataProductName,
                                tables: nodes.map(node => {
                                    const primaryKeys = node.data.fields
                                        .filter(field => field.isPK)
                                        .map(field => field.name);
                                    
                                    const table = {
                                        name: node.data.tableName,
                                        type: node.data.tableType,
                                        fields: node.data.fields.map(field => {
                                            const fieldObj = { name: field.name };
                                            if (field.calculation) {
                                                fieldObj.calculation = field.calculation;
                                            }
                                            return fieldObj;
                                        })
                                    };
                                    
                                    if (primaryKeys.length > 0) {
                                        table.primaryKeys = primaryKeys;
                                    }
                                    
                                    return table;
                                }),
                                relationships: edges.map(edge => {
                                    const rel = {
                                        from: {
                                            entity: nodes.find(n => n.id === edge.source)?.data.tableName,
                                            field: edge.sourceHandle?.replace('-source', '')
                                        },
                                        to: {
                                            entity: nodes.find(n => n.id === edge.target)?.data.tableName,
                                            field: edge.targetHandle?.replace('-target', '')
                                        }
                                    };
                                    if (edge.data?.connectionType === 'calculation' && edge.data?.calculation) {
                                        rel.calculation = edge.data.calculation;
                                    }
                                    return rel;
                                })
                            };
                            setExportJson(JSON.stringify(dataProduct, null, 2));
                            setShowExportDialog(true);
                        }}
                        style={{
                            background: "#6366f1",
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
                            e.currentTarget.style.background = "#4f46e5";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "#6366f1";
                        }}
                    >
                        <FiDownload size={14} />
                        Export
                    </button>
                    
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
                <DataProductSidebar
                    isOpen={sidebarOpen}
                    onToggle={() => setSidebarOpen(!sidebarOpen)}
                    activeTab={activeTableTab}
                    onTabChange={setActiveTableTab}
                    searchQuery={sidebarSearchQuery}
                    onSearchChange={setSidebarSearchQuery}
                    fileBaseTables={fileBaseTables}
                    fileViewTables={fileViewTables}
                    customTables={customTables}
                    onAddTable={addTableToCanvas}
                    tableMetadata={tableMetadata}
                    canvasEntities={nodes.map(n => ({ tableName: n.data.tableName, tableType: n.data.tableType }))}
                />

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
                                Click or drag tables from the sidebar to add them to the canvas
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
                        onDrop={onDrop}
                        onDragOver={onDragOver}
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

            {/* Suggest Dialog */}
            {showSuggestDialog && (
                <SuggestionDialog
                    suggestions={suggestions}
                    suggestionsLevel2={suggestionsLevel2}
                    onAddSuggestion={handleAddSuggestedEntity}
                    onClose={() => setShowSuggestDialog(false)}
                    nodesCount={nodes.length}
                />
            )}

            {/* Reverse Dependencies Dialog */}
            {showReverseDepsDialog && selectedEntityForReverseDeps && (
                <ReverseDepsDialog
                    reverseDeps={reverseDeps}
                    selectedEntity={selectedEntityForReverseDeps}
                    onAddEntity={handleAddReverseDep}
                    onClose={() => {
                        setShowReverseDepsDialog(false);
                        setReverseDeps([]);
                        setSelectedEntityForReverseDeps(null);
                    }}
                />
            )}

            {/* Export JSON Dialog */}
            {showExportDialog && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        maxWidth: '900px',
                        width: '90%',
                        maxHeight: '80vh',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    }}>
                        {/* Header */}
                        <div style={{
                            padding: '24px',
                            borderBottom: '1px solid #e5e7eb',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}>
                            <div>
                                <h2 style={{ 
                                    margin: 0, 
                                    fontSize: '24px', 
                                    fontWeight: 'bold',
                                    color: '#1f2937',
                                }}>
                                    Export Data Product
                                </h2>
                                <p style={{ 
                                    marginTop: '8px',
                                    marginBottom: 0,
                                    fontSize: '14px',
                                    color: '#6b7280',
                                }}>
                                    JSON representation of your data product
                                </p>
                            </div>
                            <button
                                onClick={() => setShowExportDialog(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '8px',
                                    borderRadius: '6px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#6b7280',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                                    e.currentTarget.style.color = '#1f2937';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = '#6b7280';
                                }}
                            >
                                <FiX size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <div style={{
                            padding: '24px',
                            overflowY: 'auto',
                            flex: 1,
                        }}>
                            <pre style={{
                                backgroundColor: '#f9fafb',
                                padding: '16px',
                                borderRadius: '8px',
                                overflow: 'auto',
                                fontSize: '12px',
                                fontFamily: 'monospace',
                                margin: 0,
                                border: '1px solid #e5e7eb',
                                color: '#1f2937',
                                lineHeight: '1.5',
                            }}>
                                {exportJson}
                            </pre>
                        </div>

                        {/* Footer */}
                        <div style={{
                            padding: '16px 24px',
                            borderTop: '1px solid #e5e7eb',
                            backgroundColor: '#f9fafb',
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: '12px',
                        }}>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(exportJson);
                                    alert('JSON copied to clipboard!');
                                }}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#6366f1',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    color: 'white',
                                    fontWeight: '500',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#4f46e5';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#6366f1';
                                }}
                            >
                                Copy to Clipboard
                            </button>
                            <button
                                onClick={() => setShowExportDialog(false)}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    color: '#374151',
                                    fontWeight: '500',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'white';
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Entity Settings Dialog */}
            {showSettingsDialog && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        width: '600px',
                        maxHeight: '80vh',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                    }}>
                        <div style={{
                            padding: '24px',
                            borderBottom: '1px solid #e5e7eb',
                        }}>
                            <h2 style={{ 
                                margin: 0, 
                                fontSize: '20px', 
                                fontWeight: 'bold',
                                color: '#1f2937',
                            }}>
                                Entity Settings
                            </h2>
                            <p style={{ 
                                marginTop: '8px',
                                marginBottom: 0,
                                fontSize: '14px',
                                color: '#6b7280',
                            }}>
                                Configure attributes from {settingsData.sourceEntityName}
                            </p>
                        </div>

                        {/* Default Attribute Mode Section */}
                        <div style={{
                            padding: '16px 24px',
                            backgroundColor: '#f0f9ff',
                            borderBottom: '1px solid #e5e7eb',
                        }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#374151',
                            }}>
                                Default Attribute Mode
                            </label>
                            <select
                                value={globalAttributeMode}
                                onChange={(e) => {
                                    const newMode = e.target.value;
                                    setGlobalAttributeMode(newMode);
                                    // Save the mode change immediately for this entity
                                    if (settingsData.nodeId) {
                                        setEntityAttributeModes(prev => ({
                                            ...prev,
                                            [settingsData.nodeId]: newMode
                                        }));
                                    }
                                }}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '2px solid #3b82f6',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    boxSizing: 'border-box',
                                    backgroundColor: 'white',
                                }}
                            >
                                <option value="runtime">Runtime</option>
                                <option value="loadtime">Loadtime</option>
                            </select>
                            <p style={{
                                marginTop: '6px',
                                marginBottom: 0,
                                fontSize: '12px',
                                color: '#6b7280',
                                fontStyle: 'italic',
                            }}>
                                In canvas,<br/>Toggle OFF = <strong>{globalAttributeMode}</strong><br/>Toggle ON = <strong>{globalAttributeMode === 'runtime' ? 'loadtime' : 'runtime'}</strong>
                            </p>
                        </div>

                        {/* Tab Navigation */}
                        <div style={{
                            display: 'flex',
                            borderBottom: '1px solid #e5e7eb',
                            padding: '0 24px',
                        }}>
                            <button
                                onClick={() => setSettingsActiveTab('byMode')}
                                style={{
                                    padding: '12px 16px',
                                    backgroundColor: settingsActiveTab === 'byMode' ? 'white' : 'transparent',
                                    border: 'none',
                                    borderBottom: settingsActiveTab === 'byMode' ? '2px solid #6366f1' : '2px solid transparent',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: settingsActiveTab === 'byMode' ? '600' : '500',
                                    color: settingsActiveTab === 'byMode' ? '#6366f1' : '#6b7280',
                                }}
                            >
                                Based on Type
                            </button>
                            <button
                                onClick={() => setSettingsActiveTab('selected')}
                                style={{
                                    padding: '12px 16px',
                                    backgroundColor: settingsActiveTab === 'selected' ? 'white' : 'transparent',
                                    border: 'none',
                                    borderBottom: settingsActiveTab === 'selected' ? '2px solid #6366f1' : '2px solid transparent',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: settingsActiveTab === 'selected' ? '600' : '500',
                                    color: settingsActiveTab === 'selected' ? '#6366f1' : '#6b7280',
                                }}
                            >
                                Selected Attributes
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div style={{
                            padding: '24px',
                            overflowY: 'auto',
                            flex: 1,
                        }}>
                            {settingsActiveTab === 'byMode' ? (
                                // Tab 1: Create Entity with All Runtime or Loadtime Attributes
                                <>
                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '8px',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            color: '#374151',
                                        }}>
                                            Entity Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={newEntityName}
                                            onChange={(e) => setNewEntityName(e.target.value)}
                                            placeholder="Enter entity name"
                                            style={{
                                                width: '100%',
                                                padding: '8px 12px',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '6px',
                                                fontSize: '14px',
                                                boxSizing: 'border-box',
                                            }}
                                        />
                                    </div>

                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '8px',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            color: '#374151',
                                        }}>
                                            Entity Type *
                                        </label>
                                        <select
                                            value={newEntityType}
                                            onChange={(e) => setNewEntityType(e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '8px 12px',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '6px',
                                                fontSize: '14px',
                                                boxSizing: 'border-box',
                                            }}
                                        >
                                            <option value="CTE">CTE</option>
                                            <option value="VIEW">VIEW</option>
                                            <option value="BASE">BASE</option>
                                        </select>
                                    </div>

                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '8px',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            color: '#374151',
                                        }}>
                                            Filter by Attribute Mode *
                                        </label>
                                        <select
                                            value={tab1FilterMode}
                                            onChange={(e) => setTab1FilterMode(e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '8px 12px',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '6px',
                                                fontSize: '14px',
                                                boxSizing: 'border-box',
                                            }}
                                        >
                                            <option value="runtime">Runtime</option>
                                            <option value="loadtime">Loadtime</option>
                                            <option value="both">Both</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '8px',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            color: '#374151',
                                        }}>
                                            {tab1FilterMode.charAt(0).toUpperCase() + tab1FilterMode.slice(1)} Mode Attributes ({
                                                settingsData.allFields ? 
                                                (tab1FilterMode === 'both' ? settingsData.allFields.length : settingsData.allFields.filter(field => {
                                                    const toggleKey = `${settingsData.nodeId}_${field.name}`;
                                                    const isToggled = attributeToggles[toggleKey] || false;
                                                    const effectiveMode = isToggled 
                                                        ? (globalAttributeMode === 'runtime' ? 'loadtime' : 'runtime')
                                                        : globalAttributeMode;
                                                    return effectiveMode === tab1FilterMode;
                                                }).length) 
                                                : 0
                                            })
                                        </label>
                                        <div style={{
                                            backgroundColor: '#f9fafb',
                                            padding: '12px',
                                            borderRadius: '6px',
                                            border: '1px solid #e5e7eb',
                                            maxHeight: '250px',
                                            overflowY: 'auto',
                                        }}>
                                            {settingsData.allFields && settingsData.allFields.length > 0 ? (
                                                settingsData.allFields
                                                    .filter(field => {
                                                        if (tab1FilterMode === 'both') return true;
                                                        const toggleKey = `${settingsData.nodeId}_${field.name}`;
                                                        const isToggled = attributeToggles[toggleKey] || false;
                                                        const effectiveMode = isToggled 
                                                            ? (globalAttributeMode === 'runtime' ? 'loadtime' : 'runtime')
                                                            : globalAttributeMode;
                                                        return effectiveMode === tab1FilterMode;
                                                    })
                                                    .map((field, idx, filteredArray) => {
                                                        const toggleKey = `${settingsData.nodeId}_${field.name}`;
                                                        const isToggled = attributeToggles[toggleKey] || false;
                                                        const effectiveMode = isToggled 
                                                            ? (globalAttributeMode === 'runtime' ? 'loadtime' : 'runtime')
                                                            : globalAttributeMode;
                                                        
                                                        // Check if this field is marked as PK in any entity on canvas
                                                        const isPKInAnyEntity = nodes.some(node => 
                                                            node.data.fields.some(f => f.name === field.name && f.isPK)
                                                        );
                                                        
                                                        return (
                                                            <div key={field.name} style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'space-between',
                                                                padding: '8px 4px',
                                                                fontSize: '13px',
                                                                color: '#1f2937',
                                                                borderBottom: idx < filteredArray.length - 1 ? '1px solid #e5e7eb' : 'none',
                                                            }}>
                                                                <span style={{ fontFamily: 'monospace', flex: 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                    • {field.name} <span style={{ color: '#6b7280' }}>({field.type})</span> {isPKInAnyEntity && (
                                                                        <FiKey size={14} style={{ color: '#f59e0b', flexShrink: 0 }} title="Primary Key" />
                                                                    )}
                                                                </span>
                                                                <span style={{ 
                                                                    fontSize: '11px', 
                                                                    fontWeight: '600',
                                                                    color: effectiveMode === 'runtime' ? '#10b981' : '#f59e0b',
                                                                    textTransform: 'uppercase'
                                                                }}>
                                                                    {effectiveMode}
                                                                </span>
                                                            </div>
                                                        );
                                                    })
                                            ) : (
                                                <p style={{
                                                    margin: 0,
                                                    fontSize: '13px',
                                                    color: '#9ca3af',
                                                    fontStyle: 'italic',
                                                }}>
                                                    No attributes available
                                                </p>
                                            )}
                                            {settingsData.allFields && settingsData.allFields.length > 0 && 
                                             tab1FilterMode !== 'both' &&
                                             settingsData.allFields.filter(field => {
                                                const toggleKey = `${settingsData.nodeId}_${field.name}`;
                                                const isToggled = attributeToggles[toggleKey] || false;
                                                const effectiveMode = isToggled 
                                                    ? (globalAttributeMode === 'runtime' ? 'loadtime' : 'runtime')
                                                    : globalAttributeMode;
                                                return effectiveMode === tab1FilterMode;
                                             }).length === 0 && (
                                                <p style={{
                                                    margin: 0,
                                                    fontSize: '13px',
                                                    color: '#9ca3af',
                                                    fontStyle: 'italic',
                                                }}>
                                                    No {tab1FilterMode} attributes. Toggle attributes to change their mode.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                // Tab 2: Create Entity from Selected Attributes
                                <>
                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '8px',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            color: '#374151',
                                        }}>
                                            Entity Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={newEntityName}
                                            onChange={(e) => setNewEntityName(e.target.value)}
                                            placeholder="Enter entity name"
                                            style={{
                                                width: '100%',
                                                padding: '8px 12px',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '6px',
                                                fontSize: '14px',
                                                boxSizing: 'border-box',
                                            }}
                                        />
                                    </div>

                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '8px',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            color: '#374151',
                                        }}>
                                            Entity Type *
                                        </label>
                                        <select
                                            value={newEntityType}
                                            onChange={(e) => setNewEntityType(e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '8px 12px',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '6px',
                                                fontSize: '14px',
                                                boxSizing: 'border-box',
                                            }}
                                        >
                                            <option value="CTE">CTE</option>
                                            <option value="VIEW">VIEW</option>
                                            <option value="BASE">BASE</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '8px',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            color: '#374151',
                                        }}>
                                            Selected Attributes ({settingsData.allFields ? settingsData.allFields.filter(f => attributeSelections[f.name]).length : 0})
                                        </label>
                                        {(!settingsData.allFields || settingsData.allFields.filter(f => attributeSelections[f.name]).length === 0) ? (
                                            <div style={{
                                                backgroundColor: '#f9fafb',
                                                padding: '12px',
                                                borderRadius: '6px',
                                                border: '1px solid #e5e7eb',
                                            }}>
                                                <p style={{
                                                    margin: 0,
                                                    fontSize: '13px',
                                                    color: '#9ca3af',
                                                    fontStyle: 'italic',
                                                }}>
                                                    No fields selected.
                                                </p>
                                            </div>
                                        ) : (
                                            <div style={{
                                                backgroundColor: '#f0f9ff',
                                                padding: '8px',
                                                borderRadius: '6px',
                                                border: '1px solid #bfdbfe',
                                                marginBottom: '12px',
                                            }}>
                                                {settingsData.allFields.filter(f => attributeSelections[f.name]).map((field, idx) => (
                                                    <span key={idx} style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        padding: '4px 8px',
                                                        margin: '2px',
                                                        fontSize: '12px',
                                                        backgroundColor: '#dbeafe',
                                                        borderRadius: '4px',
                                                        color: '#1e40af',
                                                        fontFamily: 'monospace',
                                                    }}>
                                                        {nodes.some(node => node.data.fields.some(f => f.name === field.name && f.isPK)) && (
                                                            <FiKey size={12} style={{ color: '#f59e0b', marginRight: '4px' }} title="Primary Key" />
                                                        )}
                                                        {field.name}
                                                        <button
                                                            onClick={() => {
                                                                setAttributeSelections(prev => ({
                                                                    ...prev,
                                                                    [field.name]: false
                                                                }));
                                                            }}
                                                            style={{
                                                                background: 'none',
                                                                border: 'none',
                                                                cursor: 'pointer',
                                                                padding: '0',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                color: '#1e40af',
                                                                fontSize: '14px',
                                                                fontWeight: 'bold',
                                                            }}
                                                            title="Remove"
                                                        >
                                                            ×
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '8px',
                                            marginTop: '16px',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            color: '#374151',
                                        }}>
                                            All Attributes ({settingsData.allFields ? settingsData.allFields.length : 0})
                                        </label>

                                        <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <input
                                                type="text"
                                                placeholder="Search attributes..."
                                                value={attributeSearchQuery}
                                                onChange={(e) => setAttributeSearchQuery(e.target.value)}
                                                style={{
                                                    width: '80%',
                                                    padding: '8px 12px',
                                                    border: '1px solid #d1d5db',
                                                    borderRadius: '6px',
                                                    fontSize: '13px',
                                                    boxSizing: 'border-box',
                                                }}
                                            />
                                            <label style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                fontSize: '13px',
                                                fontWeight: '500',
                                                color: '#374151',
                                                cursor: 'pointer',
                                                whiteSpace: 'nowrap',
                                            }}>
                                                <input
                                                    type="checkbox"
                                                    checked={settingsData.allFields && settingsData.allFields.every(f => attributeSelections[f.name])}
                                                    onChange={(e) => {
                                                        const newSelections = {};
                                                        if (e.target.checked) {
                                                            // Select all attributes
                                                            settingsData.allFields.forEach(field => {
                                                                newSelections[field.name] = true;
                                                            });
                                                        } else {
                                                            // Deselect all attributes
                                                            settingsData.allFields.forEach(field => {
                                                                newSelections[field.name] = false;
                                                            });
                                                        }
                                                        setAttributeSelections(newSelections);
                                                    }}
                                                    style={{
                                                        cursor: 'pointer',
                                                        width: '16px',
                                                        height: '16px',
                                                    }}
                                                />
                                                Select All
                                            </label>
                                        </div>
                                        <div style={{
                                            backgroundColor: '#f9fafb',
                                            padding: '12px',
                                            borderRadius: '6px',
                                            border: '1px solid #e5e7eb',
                                            maxHeight: '250px',
                                            overflowY: 'auto',
                                        }}>
                                            {settingsData.allFields && settingsData.allFields.length > 0 ? (
                                                settingsData.allFields
                                                    .filter(field => field.name.toLowerCase().includes(attributeSearchQuery.toLowerCase()))
                                                    .map((field, idx) => {
                                                    const isSelected = attributeSelections[field.name] || false;
                                                    // Determine runtime/loadtime status from canvas toggles
                                                    const toggleKey = `${settingsData.nodeId}_${field.name}`;
                                                    const isToggled = attributeToggles[toggleKey] || false;
                                                    const attributeMode = isToggled 
                                                        ? (globalAttributeMode === 'runtime' ? 'loadtime' : 'runtime')
                                                        : globalAttributeMode;
                                                    
                                                    // Check if this field is marked as PK in any entity on canvas
                                                    const isPKInAnyEntity = nodes.some(node => 
                                                        node.data.fields.some(f => f.name === field.name && f.isPK)
                                                    );
                                                    
                                                    return (
                                                        <div key={idx} style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                            padding: '8px 4px',
                                                            fontSize: '13px',
                                                            color: '#1f2937',
                                                            borderBottom: idx < settingsData.allFields.length - 1 ? '1px solid #e5e7eb' : 'none',
                                                            backgroundColor: isSelected ? '#f0fdf4' : 'transparent',
                                                            borderRadius: '4px',
                                                        }}>
                                                            <span style={{ fontFamily: 'monospace', flex: 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                
                                                                • {field.name} <span style={{ color: '#6b7280' }}>({field.type})</span> {isPKInAnyEntity && (
                                                                    <FiKey size={14} style={{ color: '#f59e0b', flexShrink: 0 }} title="Primary Key" />
                                                                )}
                                                            </span>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <span style={{ 
                                                                    fontSize: '11px', 
                                                                    fontWeight: '600',
                                                                    color: attributeMode === 'runtime' ? '#10b981' : '#f59e0b',
                                                                    textTransform: 'uppercase'
                                                                }}>
                                                                    {attributeMode}
                                                                </span>
                                                                <label style={{
                                                                    position: 'relative',
                                                                    display: 'inline-block',
                                                                    width: '36px',
                                                                    height: '20px',
                                                                    cursor: 'pointer',
                                                                }}>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={isSelected}
                                                                        onChange={() => {
                                                                            setAttributeSelections(prev => ({
                                                                                ...prev,
                                                                                [field.name]: !prev[field.name]
                                                                            }));
                                                                        }}
                                                                        style={{ display: 'none' }}
                                                                    />
                                                                    <span style={{
                                                                        position: 'absolute',
                                                                        cursor: 'pointer',
                                                                        top: 0,
                                                                        left: 0,
                                                                        right: 0,
                                                                        bottom: 0,
                                                                        backgroundColor: isSelected ? '#10b981' : '#cbd5e1',
                                                                        transition: '0.3s',
                                                                        borderRadius: '20px',
                                                                    }}>
                                                                        <span style={{
                                                                            position: 'absolute',
                                                                            content: '',
                                                                            height: '14px',
                                                                            width: '14px',
                                                                            left: isSelected ? '19px' : '3px',
                                                                            bottom: '3px',
                                                                            backgroundColor: 'white',
                                                                            transition: '0.3s',
                                                                            borderRadius: '50%',
                                                                        }}></span>
                                                                    </span>
                                                                </label>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <p style={{
                                                    margin: 0,
                                                    fontSize: '13px',
                                                    color: '#9ca3af',
                                                    fontStyle: 'italic',
                                                }}>
                                                    No attributes available
                                                </p>
                                            )}
                                        </div>
                                        <p style={{
                                            marginTop: '8px',
                                            fontSize: '12px',
                                            color: '#6b7280',
                                        }}>
                                            Toggle to include .
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div style={{
                            padding: '16px 24px',
                            borderTop: '1px solid #e5e7eb',
                            backgroundColor: '#f9fafb',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '12px',
                        }}>
                            <button
                                onClick={() => setShowSettingsDialog(false)}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    color: '#374151',
                                    fontWeight: '500',
                                }}
                            >
                                Cancel
                            </button>
                            {settingsActiveTab === 'byMode' ? (
                                <button
                                    onClick={handleConfirmCreateByMode}
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: '#6366f1',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        color: 'white',
                                        fontWeight: '500',
                                    }}
                                >
                                    Create Entity
                                </button>
                            ) : (
                                <button
                                    onClick={handleConfirmCreateFromSelected}
                                    disabled={!settingsData.allFields || settingsData.allFields.filter(f => attributeSelections[f.name]).length === 0}
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: (!settingsData.allFields || settingsData.allFields.filter(f => attributeSelections[f.name]).length === 0) ? '#d1d5db' : '#6366f1',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: (!settingsData.allFields || settingsData.allFields.filter(f => attributeSelections[f.name]).length === 0) ? 'not-allowed' : 'pointer',
                                        fontSize: '14px',
                                        color: 'white',
                                        fontWeight: '500',
                                    }}
                                >
                                    Create Entity
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

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

const DataProductPageWrapper = () => (
    <ReactFlowProvider>
        <DataProductPage />
    </ReactFlowProvider>
);

export default DataProductPageWrapper;
