import { useState } from "react";
import { FiEdit3, FiLink, FiUpload, FiDownload, FiFileText, FiHash, FiCheck, FiX } from "react-icons/fi";

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

    const handleSubmit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onConfirm(edgeType, "");
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
                background: "linear-gradient(180deg, #ffffff 0%, #f9fafb 100%)",
                borderRadius: 16,
                padding: "28px",
                minWidth: "500px",
                maxWidth: "600px",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)",
                border: "1px solid rgba(229, 231, 235, 0.5)",
            }}
        >
            <h3 style={{ 
                margin: "0 0 24px 0", 
                color: "#111827",
                fontSize: "22px",
                fontWeight: 600,
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                display: "flex",
                alignItems: "center",
                gap: 10,
            }}>
                {initialEdgeType ? <FiEdit3 size={22} /> : <FiLink size={22} />}
                {initialEdgeType ? "Edit Edge Connection" : "Configure Edge Connection"}
            </h3>

            <div style={{ 
                marginBottom: "24px", 
                padding: "16px",
                background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
                borderRadius: 10,
                border: "1px solid #bae6fd",
                fontSize: 14,
            }}>
                <div style={{ marginBottom: "10px", display: "flex", alignItems: "center", gap: 8 }}>
                    <FiUpload size={16} color="#0369a1" />
                    <strong style={{ color: "#0369a1" }}>From:</strong> 
                    <span style={{ color: "#0c4a6e", marginLeft: "4px" }}>
                        {source} ({sourceHandle?.replace(`${source}-`, "")})
                    </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <FiDownload size={16} color="#0369a1" />
                    <strong style={{ color: "#0369a1" }}>To:</strong> 
                    <span style={{ color: "#0c4a6e", marginLeft: "4px" }}>
                        {target} ({targetHandle?.replace(`${target}-`, "")})
                    </span>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: "20px" }}>
                    <label
                        style={{
                            display: "block",
                            marginBottom: "12px",
                            fontWeight: 600,
                            fontSize: 14,
                            color: "#374151",
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
                                padding: "10px 16px",
                                background: edgeType === "normal" 
                                    ? "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)"
                                    : "#f3f4f6",
                                border: `2px solid ${edgeType === "normal" ? "#10b981" : "#d1d5db"}`,
                                borderRadius: 8,
                                transition: "all 200ms ease",
                                flex: 1,
                            }}
                            onMouseEnter={(e) => {
                                if (edgeType !== "normal") {
                                    e.currentTarget.style.background = "#e5e7eb";
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (edgeType !== "normal") {
                                    e.currentTarget.style.background = "#f3f4f6";
                                }
                            }}
                        >
                            <input
                                type="radio"
                                value="normal"
                                checked={edgeType === "normal"}
                                onChange={(e) => setEdgeType(e.target.value)}
                                style={{ marginRight: "8px", cursor: "pointer" }}
                            />
                            <span style={{ fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
                                <FiFileText size={14} />
                                Direct
                            </span>
                        </label>
                        <label
                            style={{
                                display: "flex",
                                alignItems: "center",
                                cursor: "pointer",
                                padding: "10px 16px",
                                background: edgeType === "calculation" 
                                    ? "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)"
                                    : "#f3f4f6",
                                border: `2px solid ${edgeType === "calculation" ? "#3b82f6" : "#d1d5db"}`,
                                borderRadius: 8,
                                transition: "all 200ms ease",
                                flex: 1,
                            }}
                            onMouseEnter={(e) => {
                                if (edgeType !== "calculation") {
                                    e.currentTarget.style.background = "#e5e7eb";
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (edgeType !== "calculation") {
                                    e.currentTarget.style.background = "#f3f4f6";
                                }
                            }}
                        >
                            <input
                                type="radio"
                                value="calculation"
                                checked={edgeType === "calculation"}
                                onChange={(e) => setEdgeType(e.target.value)}
                                style={{ marginRight: "8px", cursor: "pointer" }}
                            />
                            <span style={{ fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
                                <FiHash size={14} />
                                Calculation
                            </span>
                        </label>
                    </div>
                </div>



                <div
                    style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "12px",
                        marginTop: "24px",
                        paddingTop: "20px",
                        borderTop: "1px solid #e5e7eb",
                    }}
                >
                    <div style={{ position: "relative" }}>
                        <button
                            type="button"
                            onClick={handleCancel}
                            style={{
                                padding: "8px",
                                background: "#f3f4f6",
                                border: "1px solid #d1d5db",
                                borderRadius: 8,
                                cursor: "pointer",
                                fontWeight: 500,
                                fontSize: "16px",
                                color: "#374151",
                                transition: "all 150ms ease",
                                width: "36px",
                                height: "36px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = "#e5e7eb";
                                e.target.style.transform = "translateY(-1px)";
                                const tooltip = e.target.parentElement?.querySelector('.tooltip');
                                if (tooltip) tooltip.style.opacity = "1";
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = "#f3f4f6";
                                e.target.style.transform = "translateY(0)";
                                const tooltip = e.target.parentElement?.querySelector('.tooltip');
                                if (tooltip) tooltip.style.opacity = "0";
                            }}
                        >
                            <FiX size={18} />
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
                            type="submit"
                            style={{
                                padding: "8px",
                                background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                                color: "#fff",
                                border: "none",
                                borderRadius: 8,
                                cursor: "pointer",
                                fontWeight: 600,
                                fontSize: "16px",
                                boxShadow: "0 4px 6px rgba(59, 130, 246, 0.3)",
                                transition: "all 150ms ease",
                                width: "36px",
                                height: "36px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)";
                                e.target.style.boxShadow = "0 6px 12px rgba(59, 130, 246, 0.4)";
                                e.target.style.transform = "translateY(-1px)";
                                const tooltip = e.target.parentElement?.querySelector('.tooltip');
                                if (tooltip) tooltip.style.opacity = "1";
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)";
                                e.target.style.boxShadow = "0 4px 6px rgba(59, 130, 246, 0.3)";
                                e.target.style.transform = "translateY(0)";
                                const tooltip = e.target.parentElement?.querySelector('.tooltip');
                                if (tooltip) tooltip.style.opacity = "0";
                            }}
                        >
                            <FiCheck size={18} />
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
                            Confirm
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default EdgeConfigDialog;
