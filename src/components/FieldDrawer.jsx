import { FiX, FiBarChart2, FiDatabase, FiHash } from "react-icons/fi";

/**
 * Drawer component for displaying field calculation details
 */
const FieldDrawer = ({ selectedField, onClose }) => {
    if (!selectedField) return null;

    return (
        <div
            style={{
                width: "400px",
                background: "linear-gradient(180deg, #ffffff 0%, #f9fafb 100%)",
                borderLeft: "2px solid #e5e7eb",
                boxShadow: "-4px 0 20px rgba(0, 0, 0, 0.15)",
                padding: "24px",
                overflowY: "auto",
                transition: "transform 300ms ease",
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "24px",
                    paddingBottom: "18px",
                    borderBottom: "2px solid #e5e7eb",
                }}
            >
                <h3 style={{ 
                    margin: 0, 
                    color: "#111827",
                    fontSize: "20px",
                    fontWeight: 600,
                    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                }}>
                    <FiBarChart2 size={20} />
                    Field Calculation
                </h3>
                <div style={{ position: "relative" }}>
                    <button
                        onClick={onClose}
                        style={{ 
                            cursor: "pointer",
                            background: "#ef4444",
                            color: "#fff",
                            border: "none",
                            borderRadius: "50%",
                            width: "28px",
                            height: "28px",
                            fontSize: "16px",
                            fontWeight: "bold",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 150ms ease",
                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = "#dc2626";
                            e.target.style.transform = "scale(1.1) rotate(90deg)";
                            const tooltip = e.target.parentElement?.querySelector('.tooltip');
                            if (tooltip) tooltip.style.opacity = "1";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = "#ef4444";
                            e.target.style.transform = "scale(1) rotate(0deg)";
                            const tooltip = e.target.parentElement?.querySelector('.tooltip');
                            if (tooltip) tooltip.style.opacity = "0";
                        }}
                    >
                        <FiX size={16} />
                    </button>
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
                        Close
                    </div>
                </div>
            </div>

            <div style={{ 
                marginBottom: "24px",
                padding: "16px",
                background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
                borderRadius: 10,
                border: "1px solid #bae6fd",
            }}>
                <div style={{ fontSize: 14, marginBottom: "10px", display: "flex", alignItems: "center", gap: 8 }}>
                    <FiDatabase size={16} color="#0369a1" />
                    <strong style={{ color: "#0369a1" }}>Node:</strong> 
                    <span style={{ color: "#0c4a6e", marginLeft: "4px" }}>{selectedField.nodeId}</span>
                </div>
                <div style={{ fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
                    <FiHash size={16} color="#0369a1" />
                    <strong style={{ color: "#0369a1" }}>Field:</strong> 
                    <span style={{ color: "#0c4a6e", marginLeft: "4px" }}>{selectedField.fieldName}</span>
                </div>
            </div>

            {/* Scrollable, pre-formatted calculation box */}
            <div
                style={{
                    padding: "16px",
                    background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                    borderRadius: 12,
                    border: "2px solid #3b82f6",
                    maxHeight: "calc(100vh - 300px)",
                    overflow: "auto",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    fontFamily: "'Fira Code', 'Courier New', monospace",
                    fontSize: 13,
                    color: "#92400e",
                    lineHeight: "1.6",
                    boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.06)",
                }}
            >
                {selectedField.calculation}
            </div>
        </div>
    );
};

export default FieldDrawer;

