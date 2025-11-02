import { useState } from "react";

/**
 * Field name editor component
 */
const TableNodeFieldEditor = ({ field, onSave, onCancel }) => {
    const [value, setValue] = useState(field.name);

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleSave();
        } else if (e.key === "Escape") {
            onCancel();
        }
    };

    const handleSave = () => {
        if (value.trim() && value.trim() !== field.name) {
            onSave(value.trim());
        } else {
            onCancel();
        }
    };

    return (
        <input
            type="text"
            value={value}
            onChange={(e) => {
                e.stopPropagation();
                setValue(e.target.value);
            }}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            autoFocus
            onClick={(e) => e.stopPropagation()}
            style={{
                flex: 1,
                padding: "2px 4px",
                border: "1px solid #007bff",
                borderRadius: 3,
                fontSize: 12,
            }}
        />
    );
};

export default TableNodeFieldEditor;

