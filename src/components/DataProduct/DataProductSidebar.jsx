import { FiSearch, FiChevronsLeft, FiChevronsRight, FiDatabase, FiPlus, FiCheckCircle } from "react-icons/fi";

const DataProductSidebar = ({
    isOpen,
    onToggle,
    activeTab,
    onTabChange,
    searchQuery,
    onSearchChange,
    fileBaseTables,
    fileViewTables,
    fileCteTables = [],
    customTables,
    onAddTable,
    tableMetadata,
    canvasEntities = []
}) => {
    const isOnCanvas = (tableName, tableType) => {
        return canvasEntities.some(entity => 
            entity.tableName === tableName && entity.tableType === tableType
        );
    };
    
    const filterTables = (tables) => {
        if (!searchQuery) return tables;
        return tables.filter(table => 
            table.toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    return (
        <>
            <div
                style={{
                    width: isOpen ? "320px" : "0",
                    background: "white",
                    borderRight: "1px solid #e5e7eb",
                    overflow: "hidden",
                    transition: "width 300ms ease",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                {isOpen && (
                    <>
                        <div style={{ padding: "16px", borderBottom: "1px solid #e5e7eb" }}>
                            <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1f2937", margin: "0 0 16px 0" }}>
                                Available Tables
                            </h3>
                            
                            <div style={{ position: "relative", marginBottom: "12px" }}>
                                <FiSearch
                                    size={16}
                                    style={{
                                        position: "absolute",
                                        left: "12px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        color: "#9ca3af"
                                    }}
                                />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => onSearchChange(e.target.value)}
                                    placeholder="Search tables..."
                                    style={{
                                        width: "100%",
                                        padding: "8px 12px 8px 36px",
                                        border: "1px solid #d1d5db",
                                        borderRadius: "6px",
                                        fontSize: "13px",
                                        outline: "none",
                                    }}
                                />
                            </div>

                            <div style={{ display: "flex", gap: "8px" }}>
                                {['BASE', 'CTE', 'VIEW'].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => onTabChange(type)}
                                        style={{
                                            flex: 1,
                                            padding: "8px",
                                            border: `2px solid ${activeTab === type 
                                                ? (type === 'BASE' ? '#3b82f6' : type === 'CTE' ? '#8b5cf6' : '#10b981')
                                                : '#e5e7eb'}`,
                                            borderRadius: "6px",
                                            background: activeTab === type 
                                                ? (type === 'BASE' ? '#eff6ff' : type === 'CTE' ? '#f3e8ff' : '#d1fae5')
                                                : 'white',
                                            color: activeTab === type 
                                                ? (type === 'BASE' ? '#1e40af' : type === 'CTE' ? '#6b21a8' : '#065f46')
                                                : '#6b7280',
                                            cursor: "pointer",
                                            fontSize: "12px",
                                            fontWeight: 600,
                                            transition: "all 200ms ease",
                                        }}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ flex: 1, overflow: "auto", padding: "16px" }}>
                            {activeTab === 'BASE' && (
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                    {filterTables(fileBaseTables).map((table) => {
                                        const fieldCount = tableMetadata[`BASE_${table}`]?.fields?.length || 0;
                                        const onCanvas = isOnCanvas(table, 'BASE');
                                        return (
                                            <button
                                                key={table}
                                                onClick={() => onAddTable(table, 'BASE')}
                                                draggable
                                                onDragStart={(e) => {
                                                    e.dataTransfer.setData('application/reactflow', JSON.stringify({ tableName: table, tableType: 'BASE' }));
                                                    e.dataTransfer.effectAllowed = 'move';
                                                    e.currentTarget.style.cursor = 'grabbing';
                                                }}
                                                onDragEnd={(e) => {
                                                    e.currentTarget.style.cursor = 'grab';
                                                }}
                                                style={{
                                                    padding: "10px 12px",
                                                    background: onCanvas ? "#f3f4f6" : "white",
                                                    border: onCanvas ? "1px solid #9ca3af" : "1px solid #e5e7eb",
                                                    borderRadius: "6px",
                                                    textAlign: "left",
                                                    cursor: onCanvas ? "not-allowed" : "grab",
                                                    fontSize: "13px",
                                                    fontWeight: 500,
                                                    color: onCanvas ? "#6b7280" : "#374151",
                                                    transition: "all 200ms ease",
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                    opacity: onCanvas ? 0.6 : 1,
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (!onCanvas) {
                                                        e.currentTarget.style.background = "#eff6ff";
                                                        e.currentTarget.style.borderColor = "#3b82f6";
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (!onCanvas) {
                                                        e.currentTarget.style.background = "white";
                                                        e.currentTarget.style.borderColor = "#e5e7eb";
                                                    }
                                                }}
                                            >
                                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                    <span>{table}</span>
                                                    {onCanvas && (
                                                        <FiCheckCircle size={14} style={{ color: "#10b981" }} title="On Canvas" />
                                                    )}
                                                </div>
                                                <span style={{
                                                    fontSize: "11px",
                                                    background: onCanvas ? "#e5e7eb" : "#eff6ff",
                                                    color: onCanvas ? "#6b7280" : "#3b82f6",
                                                    padding: "2px 8px",
                                                    borderRadius: "12px",
                                                    fontWeight: 600
                                                }}>
                                                    {fieldCount} {fieldCount === 1 ? 'field' : 'fields'}
                                                </span>
                                            </button>
                                        );
                                    })}
                                    {filterTables(fileBaseTables).length === 0 && (
                                        <div style={{ textAlign: "center", color: "#9ca3af", fontSize: "13px", padding: "20px" }}>
                                            No BASE tables found
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'CTE' && (
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                    {filterTables([...fileCteTables, ...customTables.CTE]).map((table) => {
                                        const fieldCount = tableMetadata[`CTE_${table}`]?.fields?.length || 0;
                                        const onCanvas = isOnCanvas(table, 'CTE');
                                        return (
                                            <button
                                                key={table}
                                                onClick={() => onAddTable(table, 'CTE')}
                                                draggable
                                                onDragStart={(e) => {
                                                    e.dataTransfer.setData('application/reactflow', JSON.stringify({ tableName: table, tableType: 'CTE' }));
                                                    e.dataTransfer.effectAllowed = 'move';
                                                    e.currentTarget.style.cursor = 'grabbing';
                                                }}
                                                onDragEnd={(e) => {
                                                    e.currentTarget.style.cursor = 'grab';
                                                }}
                                                style={{
                                                    padding: "10px 12px",
                                                    background: onCanvas ? "#f3f4f6" : "white",
                                                    border: onCanvas ? "1px solid #9ca3af" : "1px solid #e5e7eb",
                                                    borderRadius: "6px",
                                                    textAlign: "left",
                                                    cursor: onCanvas ? "not-allowed" : "grab",
                                                    fontSize: "13px",
                                                    fontWeight: 500,
                                                    color: onCanvas ? "#6b7280" : "#374151",
                                                    transition: "all 200ms ease",
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                    opacity: onCanvas ? 0.6 : 1,
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (!onCanvas) {
                                                        e.currentTarget.style.background = "#f3e8ff";
                                                        e.currentTarget.style.borderColor = "#8b5cf6";
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (!onCanvas) {
                                                        e.currentTarget.style.background = "white";
                                                        e.currentTarget.style.borderColor = "#e5e7eb";
                                                    }
                                                }}
                                            >
                                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                    <span>{table}</span>
                                                    {onCanvas && (
                                                        <FiCheckCircle size={14} style={{ color: "#10b981" }} title="On Canvas" />
                                                    )}
                                                </div>
                                                <span style={{
                                                    fontSize: "11px",
                                                    background: onCanvas ? "#e5e7eb" : "#f3e8ff",
                                                    color: onCanvas ? "#6b7280" : "#8b5cf6",
                                                    padding: "2px 8px",
                                                    borderRadius: "12px",
                                                    fontWeight: 600
                                                }}>
                                                    {fieldCount} {fieldCount === 1 ? 'field' : 'fields'}
                                                </span>
                                            </button>
                                        );
                                    })}
                                    {filterTables([...fileCteTables, ...customTables.CTE]).length === 0 && (
                                        <div style={{ textAlign: "center", color: "#9ca3af", fontSize: "13px", padding: "20px" }}>
                                            No CTE tables found
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'VIEW' && (
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                    {filterTables(fileViewTables).map((table) => {
                                        const fieldCount = tableMetadata[`VIEW_${table}`]?.fields?.length || 0;
                                        const onCanvas = isOnCanvas(table, 'VIEW');
                                        return (
                                            <button
                                                key={table}
                                                onClick={() => onAddTable(table, 'VIEW')}
                                                draggable
                                                onDragStart={(e) => {
                                                    e.dataTransfer.setData('application/reactflow', JSON.stringify({ tableName: table, tableType: 'VIEW' }));
                                                    e.dataTransfer.effectAllowed = 'move';
                                                    e.currentTarget.style.cursor = 'grabbing';
                                                }}
                                                onDragEnd={(e) => {
                                                    e.currentTarget.style.cursor = 'grab';
                                                }}
                                                style={{
                                                    padding: "10px 12px",
                                                    background: onCanvas ? "#f3f4f6" : "white",
                                                    border: onCanvas ? "1px solid #9ca3af" : "1px solid #e5e7eb",
                                                    borderRadius: "6px",
                                                    textAlign: "left",
                                                    cursor: onCanvas ? "not-allowed" : "grab",
                                                    fontSize: "13px",
                                                    fontWeight: 500,
                                                    color: onCanvas ? "#6b7280" : "#374151",
                                                    transition: "all 200ms ease",
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                    opacity: onCanvas ? 0.6 : 1,
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (!onCanvas) {
                                                        e.currentTarget.style.background = "#d1fae5";
                                                        e.currentTarget.style.borderColor = "#10b981";
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (!onCanvas) {
                                                        e.currentTarget.style.background = "white";
                                                        e.currentTarget.style.borderColor = "#e5e7eb";
                                                    }
                                                }}
                                            >
                                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                    <span>{table}</span>
                                                    {onCanvas && (
                                                        <FiCheckCircle size={14} style={{ color: "#10b981" }} title="On Canvas" />
                                                    )}
                                                </div>
                                                <span style={{
                                                    fontSize: "11px",
                                                    background: onCanvas ? "#e5e7eb" : "#d1fae5",
                                                    color: onCanvas ? "#6b7280" : "#10b981",
                                                    padding: "2px 8px",
                                                    borderRadius: "12px",
                                                    fontWeight: 600
                                                }}>
                                                    {fieldCount} {fieldCount === 1 ? 'field' : 'fields'}
                                                </span>
                                            </button>
                                        );
                                    })}
                                    {filterTables(fileViewTables).length === 0 && (
                                        <div style={{ textAlign: "center", color: "#9ca3af", fontSize: "13px", padding: "20px" }}>
                                            No VIEW tables found
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            <button
                onClick={onToggle}
                style={{
                    position: "absolute",
                    left: isOpen ? "320px" : "0",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "0 8px 8px 0",
                    padding: "16px 8px",
                    cursor: "pointer",
                    boxShadow: "2px 0 4px rgba(0, 0, 0, 0.05)",
                    transition: "left 300ms ease",
                    zIndex: 10,
                }}
            >
                {isOpen ? <FiChevronsLeft size={16} /> : <FiChevronsRight size={16} />}
            </button>
        </>
    );
};

export default DataProductSidebar;
