/**
 * Context menu component for edges
 */
const EdgeContextMenu = ({
    edge,
    position,
    onEdit,
    onDelete,
    onClose,
}) => {
    return (
        <>
            <div
                style={{
                    position: "fixed",
                    top: position.y,
                    left: position.x,
                    background: "#fff",
                    border: "1px solid #ccc",
                    borderRadius: 4,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                    zIndex: 1001,
                    minWidth: "150px",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit();
                    }}
                    style={{
                        display: "block",
                        width: "100%",
                        padding: "8px 12px",
                        background: "transparent",
                        border: "none",
                        textAlign: "left",
                        cursor: "pointer",
                        fontSize: 14,
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = "#f0f0f0";
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = "transparent";
                    }}
                >
                    Edit Edge
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (
                            window.confirm(
                                "Are you sure you want to delete this edge?"
                            )
                        ) {
                            onDelete();
                        }
                    }}
                    style={{
                        display: "block",
                        width: "100%",
                        padding: "8px 12px",
                        background: "transparent",
                        border: "none",
                        borderTop: "1px solid #eee",
                        textAlign: "left",
                        cursor: "pointer",
                        fontSize: 14,
                        color: "#dc3545",
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = "#fee";
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = "transparent";
                    }}
                >
                    Delete Edge
                </button>
            </div>
            {/* Click outside to close */}
            <div
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 1000,
                }}
                onClick={onClose}
            />
        </>
    );
};

export default EdgeContextMenu;

