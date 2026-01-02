import { useState } from "react";
import { FiX, FiBarChart2, FiDatabase, FiHash, FiEdit2, FiCheck, FiRotateCcw } from "react-icons/fi";

/**
 * Drawer component for displaying and editing field calculation details
 */
const FieldDrawer = ({ selectedField, onClose, onUpdateCalculation }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState("");

    if (!selectedField) return null;

    const handleEditStart = () => {
        setEditValue(selectedField.calculation || "");
        setIsEditing(true);
    };

    const handleSave = () => {
        if (onUpdateCalculation) {
            onUpdateCalculation(selectedField.nodeId, selectedField.fieldName, editValue);
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditValue("");
    };

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
                {isEditing ? (
                    <textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        style={{
                            width: "100%",
                            height: "100%",
                            minHeight: "200px",
                            padding: "12px",
                            border: "2px solid #3b82f6",
                            borderRadius: 8,
                            fontFamily: "'Fira Code', 'Courier New', monospace",
                            fontSize: 13,
                            resize: "vertical",
                            background: "#fff",
                            color: "#1f2937",
                            lineHeight: "1.6",
                        }}
                    />
                ) : (
                    selectedField.calculation
                )}
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
                {isEditing ? (
                    <>
                        <button
                            onClick={handleSave}
                            style={{
                                flex: 1,
                                padding: "10px 16px",
                                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                color: "#fff",
                                border: "none",
                                borderRadius: 8,
                                cursor: "pointer",
                                fontWeight: 600,
                                fontSize: 14,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 8,
                                transition: "all 150ms ease",
                                boxShadow: "0 4px 6px rgba(16, 185, 129, 0.3)",
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = "linear-gradient(135deg, #059669 0%, #047857 100%)";
                                e.target.style.boxShadow = "0 6px 12px rgba(16, 185, 129, 0.4)";
                                e.target.style.transform = "translateY(-1px)";
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = "linear-gradient(135deg, #10b981 0%, #059669 100%)";
                                e.target.style.boxShadow = "0 4px 6px rgba(16, 185, 129, 0.3)";
                                e.target.style.transform = "translateY(0)";
                            }}
                        >
                            <FiCheck size={16} />
                            Save
                        </button>
                        <button
                            onClick={handleCancel}
                            style={{
                                flex: 1,
                                padding: "10px 16px",
                                background: "#f3f4f6",
                                color: "#374151",
                                border: "1px solid #d1d5db",
                                borderRadius: 8,
                                cursor: "pointer",
                                fontWeight: 600,
                                fontSize: 14,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 8,
                                transition: "all 150ms ease",
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = "#e5e7eb";
                                e.target.style.transform = "translateY(-1px)";
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = "#f3f4f6";
                                e.target.style.transform = "translateY(0)";
                            }}
                        >
                            <FiRotateCcw size={16} />
                            Cancel
                        </button>
                    </>
                ) : (
                    <button
                        onClick={handleEditStart}
                        style={{
                            flex: 1,
                            padding: "10px 16px",
                            background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                            color: "#fff",
                            border: "none",
                            borderRadius: 8,
                            cursor: "pointer",
                            fontWeight: 600,
                            fontSize: 14,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                            transition: "all 150ms ease",
                            boxShadow: "0 4px 6px rgba(59, 130, 246, 0.3)",
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)";
                            e.target.style.boxShadow = "0 6px 12px rgba(59, 130, 246, 0.4)";
                            e.target.style.transform = "translateY(-1px)";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)";
                            e.target.style.boxShadow = "0 4px 6px rgba(59, 130, 246, 0.3)";
                            e.target.style.transform = "translateY(0)";
                        }}
                    >
                        <FiEdit2 size={16} />
                        Edit
                    </button>
                )}
            </div>
        </div>
    );
};

export default FieldDrawer;

