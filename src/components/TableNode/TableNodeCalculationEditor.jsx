import { useState, useEffect } from "react";

/**
 * Calculation expression editor component
 */
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

    // Update expression when field changes
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
            <div style={{ marginTop: "2px" }}>
                <div
                    style={{
                        padding: "4px",
                        background: "#fff",
                        borderRadius: 2,
                        fontFamily: "monospace",
                        fontSize: 9,
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        maxHeight: "80px",
                        overflow: "auto",
                        cursor: "pointer",
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsEditing(true);
                    }}
                    title="Click to edit"
                >
                    {field.calculation?.expression || "No expression"}
                </div>
            </div>
        );
    }

    return (
        <div style={{ marginTop: "4px" }}>
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
                    minHeight: "60px",
                    padding: "4px",
                    border: "1px solid #007bff",
                    borderRadius: 3,
                    fontSize: 10,
                    fontFamily: "monospace",
                    resize: "vertical",
                }}
                placeholder="Enter calculation expression..."
            />
            <div style={{ display: "flex", gap: "4px", marginTop: "4px" }}>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleSave();
                    }}
                    style={{
                        padding: "2px 8px",
                        background: "#28a745",
                        color: "#fff",
                        border: "none",
                        borderRadius: 3,
                        fontSize: 10,
                        cursor: "pointer",
                    }}
                >
                    Save
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleCancel();
                    }}
                    style={{
                        padding: "2px 8px",
                        background: "#6c757d",
                        color: "#fff",
                        border: "none",
                        borderRadius: 3,
                        fontSize: 10,
                        cursor: "pointer",
                    }}
                >
                    Cancel
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleDelete();
                    }}
                    style={{
                        padding: "2px 8px",
                        background: "#dc3545",
                        color: "#fff",
                        border: "none",
                        borderRadius: 3,
                        fontSize: 10,
                        cursor: "pointer",
                    }}
                >
                    Delete
                </button>
            </div>
        </div>
    );
};

export default TableNodeCalculationEditor;

