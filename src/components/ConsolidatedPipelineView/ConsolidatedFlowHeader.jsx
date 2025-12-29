import { FiArrowLeft, FiLayout, FiSave } from "react-icons/fi";

const ConsolidatedFlowHeader = ({ onBack, onLayout, onSave, tableCount, connectionCount }) => {
    return (
        <div
            style={{
                padding: "16px 24px",
                background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                borderBottom: "2px solid rgba(148, 163, 184, 0.2)",
                display: "flex",
                gap: 12,
                alignItems: "center",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)",
            }}
        >
            {onBack && (
                <button
                    onClick={onBack}
                    style={{
                        padding: "10px 18px",
                        background: "rgba(148, 163, 184, 0.15)",
                        color: "#cbd5e1",
                        border: "1px solid rgba(148, 163, 184, 0.3)",
                        borderRadius: 10,
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: 14,
                        transition: "all 200ms ease",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = "rgba(148, 163, 184, 0.25)";
                        e.target.style.borderColor = "rgba(148, 163, 184, 0.5)";
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = "rgba(148, 163, 184, 0.15)";
                        e.target.style.borderColor = "rgba(148, 163, 184, 0.3)";
                    }}
                >
                    <FiArrowLeft size={16} />
                    Back
                </button>
            )}

            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#cbd5e1" }}>
                    <span style={{ fontSize: 16, fontWeight: 600 }}>Consolidated Pipeline View</span>
                </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 16, color: "#94a3b8", fontSize: 14 }}>
                <span>{tableCount || 0} tables</span>
                <span>•</span>
                <span>{connectionCount || 0} connections</span>
            </div>

            {onLayout && (
                <button
                    onClick={onLayout}
                    style={{
                        padding: "10px 18px",
                        background: "rgba(59, 130, 246, 0.15)",
                        color: "#e2e8f0",
                        border: "1px solid rgba(59, 130, 246, 0.3)",
                        borderRadius: 10,
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: 14,
                        transition: "all 200ms ease",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = "rgba(59, 130, 246, 0.25)";
                        e.target.style.borderColor = "rgba(59, 130, 246, 0.5)";
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = "rgba(59, 130, 246, 0.15)";
                        e.target.style.borderColor = "rgba(59, 130, 246, 0.3)";
                    }}
                >
                    <FiLayout size={16} />
                    Auto-Arrange
                </button>
            )}

            {onSave && (
                <button
                    onClick={onSave}
                    style={{
                        padding: "10px 20px",
                        background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: 10,
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: 14,
                        transition: "all 200ms ease",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)",
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.transform = "translateY(-1px)";
                        e.target.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.4)";
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow = "0 2px 8px rgba(16, 185, 129, 0.3)";
                    }}
                >
                    <FiSave size={16} />
                    Save
                </button>
            )}
        </div>
    );
};

export default ConsolidatedFlowHeader;
