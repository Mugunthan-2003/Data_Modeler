import { useState } from "react";

/**
 * Dialog component for configuring edge connections
 */
const EdgeConfigDialog = ({
    source,
    target,
    sourceHandle,
    targetHandle,
    onConfirm,
    onCancel,
    initialEdgeType,
    initialCalculationExpression,
}) => {
    const [edgeType, setEdgeType] = useState(initialEdgeType || "normal");
    const [calculationExpression, setCalculationExpression] = useState(
        initialCalculationExpression || ""
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (edgeType === "calculation" && !calculationExpression.trim()) {
            alert("Please enter a calculation expression for calculation references.");
            return;
        }

        onConfirm(edgeType, calculationExpression.trim());
    };

    const handleCancel = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onCancel();
    };

    return (
        <div
            onClick={(e) => e.stopPropagation()}
            style={{
                background: "#fff",
                borderRadius: 8,
                padding: "20px",
                minWidth: "400px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            }}
        >
            <h3 style={{ margin: "0 0 16px 0", color: "#333" }}>
                {initialEdgeType ? "Edit Edge Connection" : "Configure Edge Connection"}
            </h3>

            <div style={{ marginBottom: "16px", fontSize: 14 }}>
                <div>
                    <strong>From:</strong> {source} ({sourceHandle?.replace(`${source}-`, "")})
                </div>
                <div>
                    <strong>To:</strong> {target} ({targetHandle?.replace(`${target}-`, "")})
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: "16px" }}>
                    <label
                        style={{
                            display: "block",
                            marginBottom: "8px",
                            fontWeight: "bold",
                            fontSize: 14,
                        }}
                    >
                        Edge Type:
                    </label>
                    <div style={{ display: "flex", gap: "12px" }}>
                        <label
                            style={{
                                display: "flex",
                                alignItems: "center",
                                cursor: "pointer",
                            }}
                        >
                            <input
                                type="radio"
                                value="normal"
                                checked={edgeType === "normal"}
                                onChange={(e) => setEdgeType(e.target.value)}
                                style={{ marginRight: "6px" }}
                            />
                            Normal Reference
                        </label>
                        <label
                            style={{
                                display: "flex",
                                alignItems: "center",
                                cursor: "pointer",
                            }}
                        >
                            <input
                                type="radio"
                                value="calculation"
                                checked={edgeType === "calculation"}
                                onChange={(e) => setEdgeType(e.target.value)}
                                style={{ marginRight: "6px" }}
                            />
                            Calculation Reference
                        </label>
                    </div>
                </div>

                {edgeType === "calculation" && (
                    <div style={{ marginBottom: "16px" }}>
                        <label
                            style={{
                                display: "block",
                                marginBottom: "8px",
                                fontWeight: "bold",
                                fontSize: 14,
                            }}
                        >
                            Calculation Expression:
                        </label>
                        <textarea
                            value={calculationExpression}
                            onChange={(e) =>
                                setCalculationExpression(e.target.value)
                            }
                            placeholder="Enter calculation expression..."
                            style={{
                                width: "100%",
                                minHeight: "100px",
                                padding: "8px",
                                border: "1px solid #ddd",
                                borderRadius: 4,
                                fontFamily: "monospace",
                                fontSize: 13,
                                resize: "vertical",
                            }}
                            required
                        />
                    </div>
                )}

                <div
                    style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "8px",
                        marginTop: "20px",
                    }}
                >
                    <button
                        type="button"
                        onClick={handleCancel}
                        style={{
                            padding: "8px 16px",
                            background: "#f5f5f5",
                            border: "1px solid #ddd",
                            borderRadius: 4,
                            cursor: "pointer",
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        style={{
                            padding: "8px 16px",
                            background: "#007bff",
                            color: "#fff",
                            border: "none",
                            borderRadius: 4,
                            cursor: "pointer",
                        }}
                    >
                        Confirm
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EdgeConfigDialog;

