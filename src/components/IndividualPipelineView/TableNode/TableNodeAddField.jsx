import { useState } from "react";
import { FiPlus } from "react-icons/fi";

const TableNodeAddField = ({ onAddField }) => {
    const [newFieldName, setNewFieldName] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (newFieldName.trim()) {
            onAddField?.(newFieldName);
            setNewFieldName("");
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            style={{
                marginTop: "12px",
                padding: "8px 12px",
                borderTop: "2px dashed #e5e7eb",
                background: "rgba(243, 244, 246, 0.3)",
                borderRadius: "0 0 12px 12px",
            }}
            onClick={(e) => e.stopPropagation()}
        >
            <div
                style={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "center",
                }}
            >
                <input
                    type="text"
                    value={newFieldName}
                    onChange={(e) => {
                        e.stopPropagation();
                        setNewFieldName(e.target.value);
                    }}
                    placeholder="New field name..."
                    style={{
                        flex: 1,
                        padding: "6px 12px",
                        border: "1px solid #d1d5db",
                        borderRadius: 6,
                        fontSize: 13,
                        background: "#fff",
                        transition: "all 150ms ease",
                    }}
                    onClick={(e) => e.stopPropagation()}
                />
                <div style={{ position: "relative" }}>
                    <button
                        type="submit"
                        style={{
                            padding: "6px",
                            background: "#10b981",
                            color: "#fff",
                            border: "none",
                            borderRadius: 6,
                            fontSize: "16px",
                            cursor: "pointer",
                            fontWeight: 500,
                            transition: "all 150ms ease",
                            boxShadow: "0 2px 4px rgba(16, 185, 129, 0.2)",
                            width: "32px",
                            height: "32px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                        onClick={(e) => e.stopPropagation()}
                        onMouseEnter={(e) => {
                            e.target.style.background = "#059669";
                            e.target.style.transform = "scale(1.05)";
                            const tooltip = e.target.parentElement?.querySelector('.tooltip');
                            if (tooltip) tooltip.style.opacity = "1";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = "#10b981";
                            e.target.style.transform = "scale(1)";
                            const tooltip = e.target.parentElement?.querySelector('.tooltip');
                            if (tooltip) tooltip.style.opacity = "0";
                        }}
                    >
                        <FiPlus size={16} />
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
                        Add field
                    </div>
                </div>
            </div>
        </form>
    );
};

export default TableNodeAddField;
