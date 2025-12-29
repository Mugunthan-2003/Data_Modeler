import { useState, useRef, useEffect } from "react";
import { FiDatabase, FiPlus, FiChevronLeft, FiChevronRight, FiChevronDown, FiCheck, FiDownload } from "react-icons/fi";

const AvailableEntitiesSidebar = ({
    sourceEntities = {},
    targetEntities = {},
    addedEntityIds = new Set(),
    onAddEntity,
    onCreateEntity,
    onAddAllEntities,
    isCollapsed = false,
    onToggleCollapse,
}) => {
    const [activeTab, setActiveTab] = useState("SOURCE");
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreateDropdownOpen, setIsCreateDropdownOpen] = useState(false);
    const createDropdownRef = useRef(null);

    const sourceEntitiesList = Object.entries(sourceEntities || {}).map(([name, entity]) => ({
        name,
        ...entity,
        type: "SOURCE",
    }));

    const targetEntitiesList = Object.entries(targetEntities || {}).map(([name, entity]) => ({
        name,
        ...entity,
        type: "TARGET",
    }));

    const filteredSourceEntities = sourceEntitiesList.filter((entity) =>
        entity.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredTargetEntities = targetEntitiesList.filter((entity) =>
        entity.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getFieldCount = (entity) => {
        return Object.keys(entity.fields || {}).length;
    };

    const isEntityAdded = (entity) => {
        const type = entity.type || "SOURCE";
        const id = `${type}_${entity.name}`;
        return addedEntityIds.has(id);
    };

    const handleAddEntity = (entity) => {
        if (onAddEntity && !isEntityAdded(entity)) {
            onAddEntity(entity);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (createDropdownRef.current && !createDropdownRef.current.contains(event.target)) {
                setIsCreateDropdownOpen(false);
            }
        };

        if (isCreateDropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isCreateDropdownOpen]);

    if (isCollapsed) {
        return (
            <div
                style={{
                    width: "48px",
                    height: "100%",
                    background: "#ffffff",
                    borderRight: "1px solid #e2e8f0",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    paddingTop: "16px",
                    boxShadow: "2px 0 8px rgba(0, 0, 0, 0.05)",
                }}
            >
                <button
                    onClick={onToggleCollapse}
                    style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        padding: "8px",
                        borderRadius: "6px",
                        color: "#64748b",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#f1f5f9";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                    }}
                >
                    <FiChevronRight size={20} />
                </button>
            </div>
        );
    }

    return (
        <div
            style={{
                width: "320px",
                height: "100%",
                background: "#ffffff",
                borderRight: "1px solid #e2e8f0",
                display: "flex",
                flexDirection: "column",
                boxShadow: "2px 0 8px rgba(0, 0, 0, 0.05)",
            }}
        >
            <div
                style={{
                    padding: "20px 16px 16px 16px",
                    borderBottom: "1px solid #e2e8f0",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "16px",
                    }}
                >
                    <h2
                        style={{
                            fontSize: "18px",
                            fontWeight: 600,
                            color: "#1e293b",
                            margin: 0,
                        }}
                    >
                        Available Tables
                    </h2>
                    <button
                        onClick={onToggleCollapse}
                        style={{
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            padding: "4px",
                            borderRadius: "6px",
                            color: "#64748b",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#f1f5f9";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                        }}
                    >
                        <FiChevronLeft size={20} />
                    </button>
                </div>

                <div ref={createDropdownRef} style={{ position: "relative" }}>
                    <button
                        onClick={() => setIsCreateDropdownOpen(!isCreateDropdownOpen)}
                        style={{
                            width: "100%",
                            padding: "12px 16px",
                            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "14px",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            boxShadow: "0 2px 4px rgba(16, 185, 129, 0.3)",
                            transition: "all 200ms ease",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-1px)";
                            e.currentTarget.style.boxShadow = "0 4px 8px rgba(16, 185, 129, 0.4)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "0 2px 4px rgba(16, 185, 129, 0.3)";
                        }}
                    >
                        <FiPlus size={18} />
                        Create New Entity
                        <FiChevronDown 
                            size={14} 
                            style={{
                                transform: isCreateDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                                transition: "transform 200ms ease",
                                marginLeft: "4px"
                            }}
                        />
                    </button>

                    {isCreateDropdownOpen && (
                        <div
                            style={{
                                position: "absolute",
                                top: "100%",
                                left: 0,
                                right: 0,
                                marginTop: "8px",
                                background: "#ffffff",
                                border: "1px solid #e2e8f0",
                                borderRadius: "8px",
                                padding: "4px",
                                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                                zIndex: 1000,
                            }}
                        >
                            {["SOURCE", "TARGET"].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => {
                                        setIsCreateDropdownOpen(false);
                                        if (onCreateEntity) {
                                            onCreateEntity(type);
                                        }
                                    }}
                                    style={{
                                        width: "100%",
                                        padding: "10px 12px",
                                        background: "transparent",
                                        color: type === "SOURCE" ? "#3b82f6" : "#10b981",
                                        border: "none",
                                        borderRadius: "6px",
                                        cursor: "pointer",
                                        fontSize: "13px",
                                        fontWeight: 600,
                                        transition: "all 200ms ease",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        textAlign: "left",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = type === "SOURCE" ? "rgba(59, 130, 246, 0.1)" : "rgba(16, 185, 129, 0.1)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = "transparent";
                                    }}
                                >
                                    <FiPlus size={14} />
                                    New {type} Table
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <input
                    type="text"
                    placeholder="Search tables..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                        width: "100%",
                        marginTop: "12px",
                        padding: "10px 12px",
                        border: "1px solid #e2e8f0",
                        borderRadius: "6px",
                        fontSize: "14px",
                        color: "#1e293b",
                        background: "#f8fafc",
                    }}
                />
            </div>

            <div
                style={{
                    display: "flex",
                    borderBottom: "1px solid #e2e8f0",
                    background: "#f8fafc",
                }}
            >
                <button
                    onClick={() => setActiveTab("SOURCE")}
                    style={{
                        flex: 1,
                        padding: "12px 16px",
                        background: activeTab === "SOURCE" ? "#ffffff" : "transparent",
                        border: "none",
                        borderBottom: activeTab === "SOURCE" ? "2px solid #3b82f6" : "2px solid transparent",
                        color: activeTab === "SOURCE" ? "#3b82f6" : "#64748b",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 200ms ease",
                    }}
                >
                    SOURCE ({sourceEntitiesList.length})
                </button>
                <button
                    onClick={() => setActiveTab("TARGET")}
                    style={{
                        flex: 1,
                        padding: "12px 16px",
                        background: activeTab === "TARGET" ? "#ffffff" : "transparent",
                        border: "none",
                        borderBottom: activeTab === "TARGET" ? "2px solid #10b981" : "2px solid transparent",
                        color: activeTab === "TARGET" ? "#10b981" : "#64748b",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 200ms ease",
                    }}
                >
                    TARGET ({targetEntitiesList.length})
                </button>
            </div>

            <div
                style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "12px",
                }}
            >
                {(activeTab === "SOURCE" ? filteredSourceEntities : filteredTargetEntities).map(
                    (entity) => {
                        const added = isEntityAdded(entity);

                        return (
                            <div
                                key={entity.name}
                                draggable={!added}
                                onDragStart={(e) => {
                                    if (!added) {
                                        e.dataTransfer.effectAllowed = "move";
                                        e.dataTransfer.setData("application/reactflow", JSON.stringify(entity));
                                    }
                                }}
                                style={{
                                    padding: "12px",
                                    marginBottom: "8px",
                                    background: "#ffffff",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "8px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                    cursor: added ? "not-allowed" : "grab",
                                    transition: "all 200ms ease",
                                    opacity: added ? 0.6 : 1,
                                }}
                                onMouseEnter={(e) => {
                                    if (added) return;
                                    e.currentTarget.style.borderColor = activeTab === "SOURCE" ? "#3b82f6" : "#10b981";
                                    e.currentTarget.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = "#e2e8f0";
                                    e.currentTarget.style.boxShadow = "none";
                                }}
                            >
                                <div
                                    style={{
                                        width: "40px",
                                        height: "40px",
                                        borderRadius: "8px",
                                        background: activeTab === "SOURCE" ? "rgba(59, 130, 246, 0.1)" : "rgba(16, 185, 129, 0.1)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: activeTab === "SOURCE" ? "#3b82f6" : "#10b981",
                                    }}
                                >
                                    <FiDatabase size={20} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div
                                        style={{
                                            fontSize: "14px",
                                            fontWeight: 600,
                                            color: "#1e293b",
                                            marginBottom: "4px",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {entity.name}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: "12px",
                                            color: "#64748b",
                                        }}
                                    >
                                        {getFieldCount(entity)} field(s)
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleAddEntity(entity);
                                    }}
                                    style={{
                                        width: "32px",
                                        height: "32px",
                                        borderRadius: "6px",
                                        background: added
                                            ? "#cbd5e1"
                                            : activeTab === "SOURCE"
                                            ? "#3b82f6"
                                            : "#10b981",
                                        color: added ? "#64748b" : "#ffffff",
                                        border: "none",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        transition: "all 200ms ease",
                                        opacity: added ? 0.7 : 1,
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!added) {
                                            e.currentTarget.style.transform = "scale(1.1)";
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = "scale(1)";
                                    }}
                                    disabled={added}
                                >
                                    {added ? <FiPlus size={16} /> : <FiPlus size={16} />}
                                </button>
                            </div>
                        )
                    }
                )}

                {(activeTab === "SOURCE" ? filteredSourceEntities : filteredTargetEntities).length === 0 && (
                    <div
                        style={{
                            padding: "24px",
                            textAlign: "center",
                            color: "#94a3b8",
                            fontSize: "14px",
                        }}
                    >
                        {searchQuery ? "No entities found" : `No ${activeTab} entities available`}
                    </div>
                )}
            </div>

            <div
                style={{
                    padding: "16px",
                    borderTop: "1px solid #e2e8f0",
                }}
            >
                <button
                    onClick={() => {
                        if (onAddAllEntities) {
                            onAddAllEntities();
                        }
                    }}
                    style={{
                        width: "100%",
                        padding: "14px 16px",
                        background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        boxShadow: "0 2px 4px rgba(139, 92, 246, 0.3)",
                        transition: "all 200ms ease",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-1px)";
                        e.currentTarget.style.boxShadow = "0 4px 8px rgba(139, 92, 246, 0.4)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 2px 4px rgba(139, 92, 246, 0.3)";
                    }}
                >
                    <FiDownload size={18} />
                    Add All Entities
                </button>
            </div>
        </div>
    );
};

export default AvailableEntitiesSidebar;
