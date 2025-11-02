import { memo, useState } from "react";
import TableNodeHeader from "./TableNodeHeader";
import TableNodeField from "./TableNodeField";
import TableNodeAddField from "./TableNodeAddField";

/**
 * Main TableNode component
 */
const TableNode = ({ data }) => {
    const bg = data.isViewOrCTE ? "#f0e6ff" : "#fff";
    const border = data.isViewOrCTE ? "2px solid #a855f7" : "1px solid #fff";
    const [editingField, setEditingField] = useState(null);

    // Get edges for a specific field
    const getFieldEdges = (fieldName) => {
        const handleId = `${data.label}-${fieldName}`;
        return (
            data.edges?.filter(
                (e) => e.sourceHandle === handleId || e.targetHandle === handleId
            ) || []
        );
    };

    return (
        <div
            style={{
                background: bg,
                border,
                borderRadius: 6,
                minWidth: 300,
                fontFamily: "Arial, sans-serif",
                boxShadow: "0 2px 6px rgba(0,0,0,.1)",
            }}
        >
            {/* Header */}
            <TableNodeHeader data={data} onEditClick={data.onEditClick} />

            {/* Field List */}
            <div style={{ padding: "4px 8px" }}>
                {data.fields.map((field, idx) => {
                    const isSelected =
                        data.selectedField?.nodeId === data.label &&
                        data.selectedField?.fieldName === field.name;

                    return (
                        <TableNodeField
                            key={idx}
                            field={field}
                            data={data}
                            isSelected={isSelected}
                            editingField={editingField}
                            setEditingField={setEditingField}
                            onFieldClick={data.onFieldClick}
                            onUpdateFieldName={data.onUpdateFieldName}
                            onDeleteField={data.onDeleteField}
                            onUpdateFieldCalculation={data.onUpdateFieldCalculation}
                            onDeleteFieldRef={data.onDeleteFieldRef}
                        />
                    );
                })}

                {/* Add New Field Section (shown only when editing) */}
                {data.isEditing && (
                    <TableNodeAddField onAddField={data.onAddField} />
                )}
            </div>
        </div>
    );
};

export default memo(TableNode);

