/**
 * Header component for TableNode
 */
const TableNodeHeader = ({ data, onEditClick }) => {
    return (
        <div
            style={{
                background: "#555",
                color: "#fff",
                padding: "4px 8px",
                fontWeight: "bold",
                borderTopLeftRadius: 5,
                borderTopRightRadius: 5,
                fontSize: 13,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
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
                ) : (
                    data.alias && (
                        <small style={{ opacity: 0.7, fontSize: 11 }}>
                            ({data.alias})
                        </small>
                    )
                )}
            </div>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onEditClick?.();
                }}
                style={{
                    background: data.isEditing ? "#f59e0b" : "#6b7280",
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                    padding: "2px 8px",
                    fontSize: 11,
                    cursor: "pointer",
                    fontWeight: "normal",
                    marginLeft: "8px",
                }}
            >
                {data.isEditing ? "Done" : "Edit"}
            </button>
        </div>
    );
};

export default TableNodeHeader;

