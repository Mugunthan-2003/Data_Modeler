import { FiEdit3, FiTrash2 } from "react-icons/fi";

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
                    background: "linear-gradient(180deg, #ffffff 0%, #f9fafb 100%)",
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2), 0 4px 10px rgba(0, 0, 0, 0.1)",
                    zIndex: 1001,
                    minWidth: "200px",
                    overflow: "hidden",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit();
                    }}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        width: "100%",
                        padding: "12px 16px",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 14,
                        fontWeight: 500,
                        color: "#374151",
                        transition: "all 150ms ease",
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)";
                        e.target.style.color = "#1e40af";
                        const tooltip = e.target.querySelector('.tooltip');
                        if (tooltip) tooltip.style.opacity = "1";
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = "transparent";
                        e.target.style.color = "#374151";
                        const tooltip = e.target.querySelector('.tooltip');
                        if (tooltip) tooltip.style.opacity = "0";
                    }}
                >
                    <FiEdit3 size={16} />
                    Edit Edge
                    <div
                        className="tooltip"
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
                            zIndex: 1000,
                        }}
                    >
                        Edit Edge
                    </div>
                </button>
                <div style={{ 
                    height: "1px", 
                    background: "linear-gradient(90deg, transparent, #e5e7eb, transparent)",
                    margin: "4px 0",
                }} />
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
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        width: "100%",
                        padding: "12px 16px",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 14,
                        fontWeight: 500,
                        color: "#ef4444",
                        transition: "all 150ms ease",
                        position: "relative",
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)";
                        e.target.style.color = "#dc2626";
                        const tooltip = e.target.querySelector('.tooltip');
                        if (tooltip) tooltip.style.opacity = "1";
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = "transparent";
                        e.target.style.color = "#ef4444";
                        const tooltip = e.target.querySelector('.tooltip');
                        if (tooltip) tooltip.style.opacity = "0";
                    }}
                >
                    <FiTrash2 size={16} />
                    Delete Edge
                    <div
                        className="tooltip"
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
                            zIndex: 1000,
                        }}
                    >
                        Delete Edge
                    </div>
                </button>
            </div>
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
