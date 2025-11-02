/**
 * Header component for the flow editor
 */
const FlowHeader = ({
    onLayout,
    onAddNewTable,
    showNormalRefs,
    showCalcRefs,
    showOnlyHighlighted,
    onToggleNormalRefs,
    onToggleCalcRefs,
    onToggleOnlyHighlighted,
}) => {
    return (
        <div
            style={{
                padding: "8px",
                background: "#f5f5f5",
                borderBottom: "1px solid #ddd",
                display: "flex",
                gap: 8,
                alignItems: "center",
            }}
        >
            <button onClick={onLayout} style={{ padding: "4px 12px" }}>
                Auto-Arrange
            </button>

            <button
                onClick={onAddNewTable}
                style={{
                    padding: "4px 12px",
                    background: "#28a745",
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer",
                    fontWeight: "bold",
                }}
            >
                + New Table
            </button>

            {/* Ref Filter Buttons */}
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                <button
                    onClick={onToggleNormalRefs}
                    style={{
                        padding: "4px 8px",
                        background: showNormalRefs ? "#d1fae5" : "#fee2e2",
                    }}
                >
                    {showNormalRefs ? "Hide" : "Show"} Normal Refs
                </button>

                <button
                    onClick={onToggleCalcRefs}
                    style={{
                        padding: "4px 8px",
                        background: showCalcRefs ? "#dbeafe" : "#fee2e2",
                    }}
                >
                    {showCalcRefs ? "Hide" : "Show"} Calc Refs
                </button>

                <button
                    onClick={onToggleOnlyHighlighted}
                    style={{
                        padding: "4px 8px",
                        background: showOnlyHighlighted
                            ? "#fef9c3"
                            : "#f5f5f5",
                    }}
                >
                    {showOnlyHighlighted
                        ? "Show All Refs"
                        : "Only Highlighted"}
                </button>
            </div>
        </div>
    );
};

export default FlowHeader;

