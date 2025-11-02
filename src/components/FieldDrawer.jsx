/**
 * Drawer component for displaying field calculation details
 */
const FieldDrawer = ({ selectedField, onClose }) => {
    if (!selectedField) return null;

    return (
        <div
            style={{
                width: "320px",
                background: "#fff",
                borderLeft: "1px solid #ccc",
                boxShadow: "-4px 0 10px rgba(0,0,0,0.1)",
                padding: "16px",
                overflowY: "auto",
                transition: "transform 0.3s ease",
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <h3 style={{ margin: 0, color: "#333" }}>Field Calculation</h3>
                <button
                    onClick={onClose}
                    style={{ cursor: "pointer" }}
                >
                    X
                </button>
            </div>

            <div style={{ marginTop: "12px", fontSize: 14 }}>
                <strong>Node:</strong> {selectedField.nodeId}
                <br />
                <strong>Field:</strong> {selectedField.fieldName}
            </div>

            {/* Scrollable, pre-formatted calculation box */}
            <div
                style={{
                    marginTop: "16px",
                    padding: "12px",
                    background: "#f9f9f9",
                    borderRadius: 8,
                    border: "1px solid #ddd",
                    maxHeight: "calc(100vh - 260px)",
                    overflow: "auto",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    fontFamily: "monospace",
                    fontSize: 13,
                    color: "#007bff",
                }}
            >
                {selectedField.calculation}
            </div>
        </div>
    );
};

export default FieldDrawer;

