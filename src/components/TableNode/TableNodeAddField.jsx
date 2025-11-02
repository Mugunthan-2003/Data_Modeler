import { useState } from "react";

/**
 * Component for adding new fields to a table node
 */
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
                marginTop: "8px",
                padding: "4px 8px",
                borderTop: "1px dashed #ddd",
            }}
            onClick={(e) => e.stopPropagation()}
        >
            <div
                style={{
                    display: "flex",
                    gap: "4px",
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
                        padding: "4px 8px",
                        border: "1px solid #ddd",
                        borderRadius: 4,
                        fontSize: 12,
                    }}
                    onClick={(e) => e.stopPropagation()}
                />
                <button
                    type="submit"
                    style={{
                        padding: "4px 12px",
                        background: "#007bff",
                        color: "#fff",
                        border: "none",
                        borderRadius: 4,
                        fontSize: 11,
                        cursor: "pointer",
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    Add
                </button>
            </div>
        </form>
    );
};

export default TableNodeAddField;

