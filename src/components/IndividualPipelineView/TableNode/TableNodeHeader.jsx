import { FiEdit3, FiCheck, FiTrash2 } from "react-icons/fi";

const TableNodeHeader = ({ data, onEditClick, onDeleteClick }) => {
    const tableType = data.tableType || "SOURCE";
   
    const getHeaderStyle = () => {
        switch (tableType) {
            case "TARGET":
                return {
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    typeLabel: "TARGET",
                };
            case "SOURCE":
            default:
                return {
                    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                    typeLabel: "SOURCE",
                };
        }
    };

    const headerStyle = getHeaderStyle();
   
    return (
        <div
            style={{
                background: headerStyle.background,
                color: "#fff",
                padding: "12px 14px",
                fontWeight: 600,
                fontSize: 14,
                display: "flex",
                borderRadius: "12px 12px 0 0",
                justifyContent: "space-between",
                alignItems: "center",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            }}
        >
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px" }}>
                {data.isEditing ? (
                    <input
                        type="text"
                        value={data.editingLabel || data.label}
                        onChange={(e) => {
                            data.onLabelChange?.(e.target.value);
                        }}
                        onBlur={(e) => {
                            if (e.target.value.trim()) {
                                data.onUpdateLabel?.(e.target.value.trim());
                            }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: "#fff",
                            color: "#333",
                            border: "none",
                            padding: "2px 4px",
                            borderRadius: 3,
                            fontSize: 13,
                            fontWeight: "bold",
                            width: "100%",
                        }}
                    />
                ) : (
                    <span>{data.label}</span>
                )}
                {data.isEditing ? (
                    <>
                        <input
                            type="text"
                            value={data.editingAlias || data.alias || ""}
                            onChange={(e) => {
                                data.onAliasChange?.(e.target.value);
                            }}
                            onBlur={(e) => {
                                data.onUpdateAlias?.(e.target.value.trim());
                            }}
                            placeholder="Alias (optional)"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: "#fff",
                                color: "#888",
                                border: "none",
                                padding: "2px 4px",
                                borderRadius: 3,
                                fontSize: 11,
                                width: "100%",
                            }}
                        />
                        <input
                            type="text"
                            value={data.editingSourcePath ?? data.source_path ?? ""}
                            onChange={(e) => {
                                data.onSourcePathChange?.(e.target.value);
                            }}
                            onBlur={(e) => {
                                data.onUpdateSourcePath?.(e.target.value.trim());
                            }}
                            placeholder="Source Path (optional)"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: "#fff",
                                color: "#888",
                                border: "none",
                                padding: "2px 4px",
                                borderRadius: 3,
                                fontSize: 11,
                                width: "100%",
                                marginTop: "2px",
                            }}
                        />
                    </>
                ) : (
                    <>
                        {data.alias && (
                            <small style={{ opacity: 0.7, fontSize: 11 }}>
                                ({data.alias})
                            </small>
                        )}
                        {data.source_path && (
                            <small style={{ opacity: 0.6, fontSize: 10 }}>
                                {data.source_path}
                            </small>
                        )}
                    </>
                )}
            </div>
            <div style={{ display: "flex", gap: "8px", marginLeft: "8px" }}>
                <div style={{ position: "relative" }}>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEditClick?.();
                        }}
                        style={{
                        background: data.isEditing
                            ? "rgba(50, 109, 226, 0.8)"
                            : "rgba(255, 255, 255, 0.2)",
                        color: "#fff",
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                        borderRadius: 6,
                        padding: "6px",
                        fontSize: "16px",
                        cursor: "pointer",
                        fontWeight: 500,
                        width: "28px",
                        height: "28px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 200ms ease",
                        backdropFilter: "blur(10px)",
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = data.isEditing
                            ? "rgba(50, 109, 226, 1)"
                            : "rgba(255, 255, 255, 0.3)";
                        const tooltip = e.target.nextSibling;
                        if (tooltip) tooltip.style.opacity = "1";
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = data.isEditing
                            ? "rgba(50, 109, 226, 0.8)"
                            : "rgba(255, 255, 255, 0.2)";
                        const tooltip = e.target.nextSibling;
                        if (tooltip) tooltip.style.opacity = "0";
                    }}
                >
                    {data.isEditing ? <FiCheck size={16} /> : <FiEdit3 size={16} />}
                    </button>
                    <div
                        style={{
                            position: "absolute",
                            bottom: "100%",
                            left: "50%",
                            transform: "translateX(-50%)",
                            marginBottom: "4px",
                            background: "rgba(0, 0, 0, 0.8)",
                            color: "#fff",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "11px",
                            whiteSpace: "nowrap",
                            pointerEvents: "none",
                            opacity: 0,
                            transition: "opacity 150ms ease",
                            zIndex: 9999,
                        }}
                    >
                        {data.isEditing ? "Done" : "Edit"}
                    </div>
                </div>
                <div style={{ position: "relative" }}>
                    <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDeleteClick?.();
                    }}
                    style={{
                        background: "rgba(239, 68, 68, 0.8)",
                        color: "#fff",
                        border: "1px solid rgba(239, 68, 68, 0.4)",
                        borderRadius: 6,
                        padding: "6px",
                        fontSize: "16px",
                        cursor: "pointer",
                        fontWeight: 500,
                        width: "28px",
                        height: "28px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 200ms ease",
                        marginLeft: "8px",
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = "rgba(239, 68, 68, 1)";
                        const tooltip = e.target.nextSibling;
                        if (tooltip) tooltip.style.opacity = "1";
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = "rgba(239, 68, 68, 0.8)";
                        const tooltip = e.target.nextSibling;
                        if (tooltip) tooltip.style.opacity = "0";
                    }}
                >
                    <FiTrash2 size={16} />
                    </button>
                    <div
                        style={{
                            position: "absolute",
                            bottom: "100%",
                            left: "50%",
                            transform: "translateX(-50%)",
                            marginBottom: "4px",
                            background: "rgba(0, 0, 0, 0.8)",
                            color: "#fff",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "11px",
                            whiteSpace: "nowrap",
                            pointerEvents: "none",
                            opacity: 0,
                            transition: "opacity 150ms ease",
                            zIndex: 9999,
                        }}
                    >
                        Delete
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TableNodeHeader;
