import {
    FiArrowLeft,
    FiLayout,
    FiSave,
    FiCheck,
    FiX,
    FiHash,
    FiEye,
    FiStar,
    FiArrowUp,
    FiArrowDown,
    FiRepeat,
    FiChevronDown,
} from "react-icons/fi";
import { useEffect, useRef, useState } from "react";

const ConsolidatedFlowHeader = ({
    onBack,
    onLayout,
    onSave,
    tableCount,
    connectionCount,
    showNormalRefs,
    showCalcRefs,
    showOnlyHighlighted,
    onToggleNormalRefs,
    onToggleCalcRefs,
    onToggleOnlyHighlighted,
    linkDirection,
    onLinkDirectionChange,
}) => {
    const [isDirOpen, setIsDirOpen] = useState(false);
    const dirDropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dirDropdownRef.current && !dirDropdownRef.current.contains(e.target)) {
                setIsDirOpen(false);
            }
        };
        if (isDirOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isDirOpen]);

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

            <div
                ref={dirDropdownRef}
                style={{ display: "flex", alignItems: "center", gap: 10, position: "relative" }}
            >
                <button
                    onClick={() => setIsDirOpen((v) => !v)}
                    style={{
                        padding: "9px 16px",
                        background: "rgba(148, 163, 184, 0.15)",
                        color: "#cbd5e1",
                        border: "1px solid rgba(148, 163, 184, 0.3)",
                        borderRadius: 10,
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        minWidth: 150,
                        justifyContent: "space-between",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {linkDirection === "upstream" && <FiArrowUp size={14} />}
                        {linkDirection === "downstream" && <FiArrowDown size={14} />}
                        {linkDirection === "both" && <FiRepeat size={14} />}
                        <span>
                            {linkDirection === "upstream" && "Upstream"}
                            {linkDirection === "downstream" && "Downstream"}
                            {linkDirection === "both" && "Both"}
                        </span>
                    </div>
                    <FiChevronDown
                        size={14}
                        style={{
                            transform: isDirOpen ? "rotate(180deg)" : "rotate(0deg)",
                            transition: "transform 200ms ease",
                        }}
                    />
                </button>

                {isDirOpen && (
                    <div
                        style={{
                            position: "absolute",
                            top: "100%",
                            right: 0,
                            marginTop: 8,
                            background: "rgba(30, 41, 59, 0.95)",
                            border: "1px solid rgba(148, 163, 184, 0.3)",
                            borderRadius: 10,
                            padding: 4,
                            minWidth: 180,
                            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
                            zIndex: 1000,
                        }}
                    >
                        {[
                            { key: "upstream", label: "Upstream", icon: <FiArrowUp size={14} /> },
                            { key: "downstream", label: "Downstream", icon: <FiArrowDown size={14} /> },
                            { key: "both", label: "Both", icon: <FiRepeat size={14} /> },
                        ].map((dir) => (
                            <button
                                key={dir.key}
                                onClick={() => {
                                    onLinkDirectionChange(dir.key);
                                    setIsDirOpen(false);
                                }}
                                style={{
                                    width: "100%",
                                    padding: "10px 12px",
                                    background:
                                        linkDirection === dir.key
                                            ? "rgba(59, 130, 246, 0.2)"
                                            : "transparent",
                                    color:
                                        linkDirection === dir.key ? "#93c5fd" : "#cbd5e1",
                                    border: "none",
                                    borderRadius: 8,
                                    cursor: "pointer",
                                    fontSize: 13,
                                    fontWeight: 600,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    textAlign: "left",
                                }}
                            >
                                {dir.icon}
                                <span>{dir.label}</span>
                                {linkDirection === dir.key && (
                                    <FiCheck size={14} style={{ marginLeft: "auto" }} />
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button
                    onClick={onToggleNormalRefs}
                    style={{
                        padding: "9px 14px",
                        background: showNormalRefs
                            ? "rgba(239, 68, 68, 0.2)"
                            : "rgba(148, 163, 184, 0.15)",
                        color: showNormalRefs ? "#fca5a5" : "#cbd5e1",
                        border: `1px solid ${
                            showNormalRefs
                                ? "rgba(239, 68, 68, 0.4)"
                                : "rgba(148, 163, 184, 0.3)"
                        }`,
                        borderRadius: 10,
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                    }}
                >
                    {showNormalRefs ? <FiCheck size={14} /> : <FiX size={14} />}
                    Direct
                </button>
                <button
                    onClick={onToggleCalcRefs}
                    style={{
                        padding: "9px 14px",
                        background: showCalcRefs
                            ? "rgba(59, 130, 246, 0.2)"
                            : "rgba(148, 163, 184, 0.15)",
                        color: showCalcRefs ? "#93c5fd" : "#cbd5e1",
                        border: `1px solid ${
                            showCalcRefs
                                ? "rgba(59, 130, 246, 0.4)"
                                : "rgba(148, 163, 184, 0.3)"
                        }`,
                        borderRadius: 10,
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                    }}
                >
                    {showCalcRefs ? <FiCheck size={14} /> : <FiX size={14} />}
                    <FiHash size={14} />
                    Calc
                </button>
                <button
                    onClick={onToggleOnlyHighlighted}
                    style={{
                        padding: "9px 14px",
                        background: showOnlyHighlighted
                            ? "rgba(236, 72, 153, 0.2)"
                            : "rgba(148, 163, 184, 0.15)",
                        color: showOnlyHighlighted ? "#f9a8d4" : "#cbd5e1",
                        border: `1px solid ${
                            showOnlyHighlighted
                                ? "rgba(236, 72, 153, 0.4)"
                                : "rgba(148, 163, 184, 0.3)"
                        }`,
                        borderRadius: 10,
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                    }}
                >
                    {showOnlyHighlighted ? (
                        <FiStar size={14} />
                    ) : (
                        <FiEye size={14} />
                    )}
                    Highlighted
                </button>
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
