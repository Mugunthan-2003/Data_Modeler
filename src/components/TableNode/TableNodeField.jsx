import { Handle, Position } from "reactflow";
import TableNodeFieldEditor from "./TableNodeFieldEditor";
import TableNodeCalculationEditor from "./TableNodeCalculationEditor";

/**
 * Individual field component within TableNode
 */
const TableNodeField = ({
    field,
    data,
    isSelected,
    editingField,
    setEditingField,
    onFieldClick,
    onUpdateFieldName,
    onDeleteField,
    onUpdateFieldCalculation,
    onDeleteFieldRef,
}) => {
    const isEditing = editingField === field.name;
    const handleId = `${data.label}-${field.name}`;

    return (
        <div
            style={{
                fontSize: 12,
                marginBottom: 3,
                position: "relative",
                padding: "4px 12px",
                background: isSelected ? "#f3f3f3" : "transparent",
                borderRadius: 4,
                border: data.isEditing ? "1px solid #e0e0e0" : "none",
            }}
        >
            {/* Left Handle */}
            <Handle
                type="target"
                position={Position.Left}
                id={handleId}
                style={{
                    background: "#555",
                    width: 8,
                    height: 8,
                    position: "absolute",
                    left: -6,
                    top: "50%",
                    transform: "translateY(-50%)",
                }}
            />

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "4px",
                }}
                onClick={(e) => {
                    if (!data.isEditing && !isEditing) {
                        onFieldClick?.(field.name, field);
                    }
                }}
            >
                {isEditing ? (
                    <TableNodeFieldEditor
                        field={field}
                        onSave={(newName) => {
                            onUpdateFieldName?.(field.name, newName);
                            setEditingField(null);
                        }}
                        onCancel={() => setEditingField(null)}
                    />
                ) : (
                    <span
                        style={{
                            color: field.calculation ? "#333" : "inherit",
                            fontWeight: isSelected
                                ? "bold"
                                : field.calculation
                                ? "500"
                                : "normal",
                            flex: 1,
                            cursor: data.isEditing ? "default" : "pointer",
                        }}
                    >
                        {field.name}
                    </span>
                )}

                {data.isEditing && !isEditing && (
                    <div style={{ display: "flex", gap: "4px" }}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setEditingField(field.name);
                            }}
                            style={{
                                padding: "2px 6px",
                                background: "#007bff",
                                color: "#fff",
                                border: "none",
                                borderRadius: 3,
                                fontSize: 10,
                                cursor: "pointer",
                            }}
                            title="Edit field name"
                        >
                            ✏️
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (
                                    window.confirm(
                                        `Delete field "${field.name}"?`
                                    )
                                ) {
                                    onDeleteField?.(field.name);
                                }
                            }}
                            style={{
                                padding: "2px 6px",
                                background: "#dc3545",
                                color: "#fff",
                                border: "none",
                                borderRadius: 3,
                                fontSize: 10,
                                cursor: "pointer",
                            }}
                            title="Delete field"
                        >
                            🗑️
                        </button>
                    </div>
                )}
            </div>

            {/* Calculation (shown when editing) */}
            {data.isEditing && !isEditing && field.calculation && (
                <div
                    style={{
                        marginTop: "4px",
                        padding: "4px",
                        background: "#f9f9f9",
                        borderRadius: 3,
                        fontSize: 10,
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div>
                        <strong>Calculation:</strong>
                        <TableNodeCalculationEditor
                            field={field}
                            onSave={(expression) => {
                                onUpdateFieldCalculation?.(field.name, expression);
                            }}
                            onCancel={() => {}}
                            onDelete={(fieldName, ref) => {
                                onDeleteFieldRef?.(fieldName, ref, true);
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Right Handle */}
            <Handle
                type="source"
                position={Position.Right}
                id={handleId}
                style={{
                    background: "#555",
                    width: 8,
                    height: 8,
                    position: "absolute",
                    right: -6,
                    top: "50%",
                    transform: "translateY(-50%)",
                }}
            />
        </div>
    );
};

export default TableNodeField;

