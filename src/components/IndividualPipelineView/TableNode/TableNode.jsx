import { memo, useState } from "react";
import TableNodeHeader from "./TableNodeHeader";
import TableNodeField from "./TableNodeField";
import TableNodeAddField from "./TableNodeAddField";

const TableNode = ({ data }) => {
    const tableType = data.tableType || "SOURCE";

    let bg, border;
    switch (tableType) {
        case "TARGET":
            bg = "#ecfdf5";
            border = "2px solid #10b981";
            break;
        case "SOURCE":
        default:
            bg = "#eff6ff";
            border = "2px solid #3b82f6";
            break;
    }

    const [editingField, setEditingField] = useState(null);

    const getFieldEdges = (fieldName) => {
        const nodeId = data.nodeId || data.label;
        const handleId = `${nodeId}-${fieldName}`;
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
                borderRadius: 12,
                fontFamily: "inherit",
                boxShadow:
                    "0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)",
                transition: "all 200ms ease",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                    "0 8px 20px rgba(0, 0, 0, 0.2), 0 4px 8px rgba(0, 0, 0, 0.15)";
                e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)";
                e.currentTarget.style.transform = "translateY(0)";
            }}
        >
            <TableNodeHeader 
                data={data} 
                onEditClick={data.onEditClick}
                onDeleteClick={data.onDeleteTable}
            />

            <div style={{ padding: "8px 12px" }}>
                {data.fields.map((field, idx) => {
                    const isSelected =
                        data.selectedField?.nodeId === (data.nodeId || data.label) &&
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
                            onUpdateFieldCalculation={
                                data.onUpdateFieldCalculation
                            }
                            onDeleteFieldRef={data.onDeleteFieldRef}
                        />
                    );
                })}

                {data.isEditing && (
                    <TableNodeAddField onAddField={data.onAddField} />
                )}
            </div>
        </div>
    );
};

export default memo(TableNode);
