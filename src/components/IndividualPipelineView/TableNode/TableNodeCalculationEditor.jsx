import { useState, useEffect } from "react";

const TableNodeCalculationEditor = ({
    field,
    onSave,
    onCancel,
    onDelete,
}) => {
    const [expression, setExpression] = useState(
        field.calculation?.expression || ""
    );
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        setExpression(field.calculation?.expression || "");
    }, [field.calculation?.expression]);

    const handleSave = () => {
        if (expression.trim()) {
            onSave(expression.trim());
        }
        setIsEditing(false);
        setExpression(field.calculation?.expression || "");
    };

    const handleCancel = () => {
        setIsEditing(false);
        setExpression(field.calculation?.expression || "");
        onCancel?.();
    };

    const handleDelete = () => {
        if (window.confirm("Delete calculation?")) {
            const refs = field.calculation?.ref || [];
            refs.forEach((ref) => {
                onDelete?.(field.name, ref);
            });
        }
    };

    if (!isEditing) {
        return (
            <div style={{ marginTop: "4px" }}>
                <div
                    style={{
                        padding: "8px",
                        background: "rgba(255, 255, 255, 0.9)",
                        borderRadius: 6,
                        fontFamily: "'Fira Code', 'Courier New', monospace",
                        fontSize: 10,
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        maxHeight: "100px",
                        overflow: "auto",
                        cursor: "pointer",
                        border: "1px solid #fbbf24",
                        color: "#92400e",
                        transition: "all 150ms ease",
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsEditing(true);
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#fff";
                        e.currentTarget.style.borderColor = "#f59e0b";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.9)";
                        e.currentTarget.style.borderColor = "#fbbf24";
                    }}
                    title="Click to edit"
                >
                    {field.calculation?.expression || "No expression (click to add)"}
                </div>
            </div>
        );
    }

    return (
        <div style={{ marginTop: "6px" }}>
            <textarea
                value={expression}
                onChange={(e) => {
                    e.stopPropagation();
                    setExpression(e.target.value);
                }}
                onKeyDown={(e) => {
                    if (e.key === "Escape") {
                        handleCancel();
                    }
                }}
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: "100%",
                    minHeight: "80px",
                    padding: "8px",
                    border: "2px solid #3b82f6",
                    borderRadius: 6,
                    fontSize: 11,
                    fontFamily: "'Fira Code', 'Courier New', monospace",
                    resize: "vertical",
                    background: "#fff",
                    transition: "all 150ms ease",
                    lineHeight: "1.5",
                }}
                placeholder="Enter calculation expression..."
            />
            <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
                <div style={{ position: "relative" }}>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleSave();
                        }}
                        style={{
                            padding: "4px",
                            background: "#10b981",
                            color: "#fff",
                            border: "none",
                            borderRadius: 6,
                            fontSize: "14px",
                            cursor: "pointer",
                            fontWeight: 500,
                            transition: "all 150ms ease",
                            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                            width: "28px",
                            height: "28px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
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
                        ✓
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
                        Save
                    </div>
                </div>
                <div style={{ position: "relative" }}>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleCancel();
                        }}
                        style={{
                            padding: "4px",
                            background: "#6b7280",
                            color: "#fff",
                            border: "none",
                            borderRadius: 6,
                            fontSize: "14px",
                            cursor: "pointer",
                            fontWeight: 500,
                            transition: "all 150ms ease",
                            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                            width: "28px",
                            height: "28px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = "#4b5563";
                            e.target.style.transform = "scale(1.05)";
                            const tooltip = e.target.parentElement?.querySelector('.tooltip');
                            if (tooltip) tooltip.style.opacity = "1";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = "#6b7280";
                            e.target.style.transform = "scale(1)";
                            const tooltip = e.target.parentElement?.querySelector('.tooltip');
                            if (tooltip) tooltip.style.opacity = "0";
                        }}
                    >
                        ✕
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
                        Cancel
                    </div>
                </div>
                <div style={{ position: "relative" }}>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete();
                        }}
                        style={{
                            padding: "4px",
                            background: "#ef4444",
                            color: "#fff",
                            border: "none",
                            borderRadius: 6,
                            fontSize: "14px",
                            cursor: "pointer",
                            fontWeight: 500,
                            transition: "all 150ms ease",
                            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                            width: "28px",
                            height: "28px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = "#dc2626";
                            e.target.style.transform = "scale(1.05)";
                            const tooltip = e.target.parentElement?.querySelector('.tooltip');
                            if (tooltip) tooltip.style.opacity = "1";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = "#ef4444";
                            e.target.style.transform = "scale(1)";
                            const tooltip = e.target.parentElement?.querySelector('.tooltip');
                            if (tooltip) tooltip.style.opacity = "0";
                        }}
                    >
                        🗑️
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
                        Delete
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TableNodeCalculationEditor;
