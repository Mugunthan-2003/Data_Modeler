import {
    FiLayout,
    FiPlus,
    FiCheck,
    FiX,
    FiHash,
    FiEye,
    FiStar,
    FiDownload,
    FiChevronDown,
    FiArrowUp,
    FiArrowDown,
    FiRepeat,
} from "react-icons/fi";
import { useState, useEffect, useRef } from "react";

/**
 * Header component for the flow editor
 */
const FlowHeader = ({
    onLayout,
    onAddNewTable,
    onExport,
    showNormalRefs,
    showCalcRefs,
    showOnlyHighlighted,
    onToggleNormalRefs,
    onToggleCalcRefs,
    onToggleOnlyHighlighted,
    linkDirection,
    onLinkDirectionChange,
    selectedTableType,
    onTableTypeChange,
}) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isTableTypeDropdownOpen, setIsTableTypeDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const tableTypeDropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsDropdownOpen(false);
            }
            if (
                tableTypeDropdownRef.current &&
                !tableTypeDropdownRef.current.contains(event.target)
            ) {
                setIsTableTypeDropdownOpen(false);
            }
        };

        if (isDropdownOpen || isTableTypeDropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isDropdownOpen, isTableTypeDropdownOpen]);

    return (
        <div
            style={{
                padding: "16px 24px",
                background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                borderBottom: "2px solid rgba(148, 163, 184, 0.2)",
                display: "flex",
                gap: 12,
                alignItems: "center",
                boxShadow:
                    "0 4px 16px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)",
                backdropFilter: "blur(10px)",
                position: "relative",
                overflow: "visible",
                zIndex: 100,
            }}
        >
            {/* Decorative gradient overlay */}
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "2px",
                    background:
                        "linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)",
                    opacity: 0.8,
                }}
            />
            <div
                style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "center",
                    position: "relative",
                    zIndex: 1,
                }}
            >
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
                        backdropFilter: "blur(10px)",
                        boxShadow: "0 2px 8px rgba(59, 130, 246, 0.2)",
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = "rgba(59, 130, 246, 0.25)";
                        e.target.style.borderColor = "rgba(59, 130, 246, 0.5)";
                        e.target.style.transform = "translateY(-1px)";
                        e.target.style.boxShadow =
                            "0 4px 12px rgba(59, 130, 246, 0.3)";
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = "rgba(59, 130, 246, 0.15)";
                        e.target.style.borderColor = "rgba(59, 130, 246, 0.3)";
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow =
                            "0 2px 8px rgba(59, 130, 246, 0.2)";
                    }}
                >
                    <FiLayout size={16} />
                    Auto-Arrange
                </button>

                {/* New Table with Type Dropdown */}
                <div
                    ref={tableTypeDropdownRef}
                    style={{
                        position: "relative",
                    }}
                >
                    <button
                        onClick={() => {
                            setIsTableTypeDropdownOpen(!isTableTypeDropdownOpen);
                        }}
                        style={{
                            padding: "10px 18px",
                            background: "rgba(139, 92, 246, 0.15)",
                            color: "#c4b5fd",
                            border: "1px solid rgba(139, 92, 246, 0.3)",
                            borderRadius: 10,
                            cursor: "pointer",
                            fontWeight: 600,
                            fontSize: 14,
                            transition: "all 200ms ease",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            backdropFilter: "blur(10px)",
                            boxShadow: "0 2px 8px rgba(139, 92, 246, 0.2)",
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = "rgba(139, 92, 246, 0.25)";
                            e.target.style.borderColor = "rgba(139, 92, 246, 0.5)";
                            e.target.style.transform = "translateY(-1px)";
                            e.target.style.boxShadow =
                                "0 4px 12px rgba(139, 92, 246, 0.3)";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = "rgba(139, 92, 246, 0.15)";
                            e.target.style.borderColor = "rgba(139, 92, 246, 0.3)";
                            e.target.style.transform = "translateY(0)";
                            e.target.style.boxShadow =
                                "0 2px 8px rgba(139, 92, 246, 0.2)";
                        }}
                    >
                        <FiPlus size={16} />
                        New Table ({selectedTableType})
                        <FiChevronDown
                            size={14}
                            style={{
                                transform: isTableTypeDropdownOpen
                                    ? "rotate(180deg)"
                                    : "rotate(0deg)",
                                transition: "transform 200ms ease",
                                marginLeft: 4,
                            }}
                        />
                    </button>

                    {isTableTypeDropdownOpen && (
                        <div
                            style={{
                                position: "absolute",
                                top: "100%",
                                left: 0,
                                marginTop: 8,
                                background: "rgba(30, 41, 59, 0.95)",
                                backdropFilter: "blur(10px)",
                                border: "1px solid rgba(139, 92, 246, 0.3)",
                                borderRadius: 10,
                                padding: 4,
                                minWidth: 200,
                                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
                                zIndex: 1000,
                            }}
                        >
                            {["BASE", "CTE", "VIEW"].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => {
                                        setIsTableTypeDropdownOpen(false);
                                        // Close dropdown first, then call with the type
                                        onAddNewTable(type);
                                    }}
                                    style={{
                                        width: "100%",
                                        padding: "12px 14px",
                                        background:
                                            selectedTableType === type
                                                ? "rgba(139, 92, 246, 0.2)"
                                                : "transparent",
                                        color:
                                            selectedTableType === type
                                                ? "#c4b5fd"
                                                : "#cbd5e1",
                                        border: "none",
                                        borderRadius: 8,
                                        cursor: "pointer",
                                        fontSize: 13,
                                        fontWeight: 600,
                                        transition: "all 200ms ease",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 10,
                                        justifyContent: "space-between",
                                    }}
                                    onMouseEnter={(e) => {
                                        if (selectedTableType !== type) {
                                            e.target.style.background =
                                                "rgba(139, 92, 246, 0.1)";
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (selectedTableType !== type) {
                                            e.target.style.background =
                                                "transparent";
                                        }
                                    }}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <FiPlus size={14} />
                                        <span>New {type} Table</span>
                                    </div>
                                    {selectedTableType === type && (
                                        <FiCheck size={14} />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <button
                    onClick={onExport}
                    style={{
                        padding: "10px 18px",
                        background: "rgba(34, 197, 94, 0.15)",
                        color: "#86efac",
                        border: "1px solid rgba(34, 197, 94, 0.3)",
                        borderRadius: 10,
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: 14,
                        transition: "all 200ms ease",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        backdropFilter: "blur(10px)",
                        boxShadow: "0 2px 8px rgba(34, 197, 94, 0.2)",
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = "rgba(34, 197, 94, 0.25)";
                        e.target.style.borderColor = "rgba(34, 197, 94, 0.5)";
                        e.target.style.transform = "translateY(-1px)";
                        e.target.style.boxShadow =
                            "0 4px 12px rgba(34, 197, 94, 0.3)";
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = "rgba(34, 197, 94, 0.15)";
                        e.target.style.borderColor = "rgba(34, 197, 94, 0.3)";
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow =
                            "0 2px 8px rgba(34, 197, 94, 0.2)";
                    }}
                >
                    <FiDownload size={16} />
                    Export JSON
                </button>
            </div>

            {/* Link Direction Dropdown */}
            <div
                style={{
                    marginLeft: "auto",
                    marginRight: 10,
                    position: "relative",
                    zIndex: 1,
                }}
            >
                <div
                    ref={dropdownRef}
                    style={{
                        position: "relative",
                    }}
                >
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        style={{
                            padding: "9px 16px",
                            background: "rgba(148, 163, 184, 0.15)",
                            color: "#cbd5e1",
                            border: "1px solid rgba(148, 163, 184, 0.3)",
                            borderRadius: 10,
                            cursor: "pointer",
                            fontSize: 13,
                            fontWeight: 600,
                            transition: "all 200ms ease",
                            backdropFilter: "blur(10px)",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            minWidth: 140,
                            justifyContent: "space-between",
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background =
                                "rgba(148, 163, 184, 0.25)";
                            e.target.style.borderColor =
                                "rgba(148, 163, 184, 0.4)";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background =
                                "rgba(148, 163, 184, 0.15)";
                            e.target.style.borderColor =
                                "rgba(148, 163, 184, 0.3)";
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                            }}
                        >
                            {linkDirection === "upstream" && (
                                <FiArrowUp size={14} />
                            )}
                            {linkDirection === "downstream" && (
                                <FiArrowDown size={14} />
                            )}
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
                                transform: isDropdownOpen
                                    ? "rotate(180deg)"
                                    : "rotate(0deg)",
                                transition: "transform 200ms ease",
                            }}
                        />
                    </button>

                    {isDropdownOpen && (
                        <div
                            style={{
                                position: "absolute",
                                top: "100%",
                                right: 0,
                                marginTop: 8,
                                background: "rgba(30, 41, 59, 0.95)",
                                backdropFilter: "blur(10px)",
                                border: "1px solid rgba(148, 163, 184, 0.3)",
                                borderRadius: 10,
                                padding: 4,
                                minWidth: 140,
                                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
                                zIndex: 1000,
                            }}
                        >
                            {["upstream", "downstream", "both"].map(
                                (direction) => (
                                    <button
                                        key={direction}
                                        onClick={() => {
                                            onLinkDirectionChange(direction);
                                            setIsDropdownOpen(false);
                                        }}
                                        style={{
                                            width: "100%",
                                            padding: "10px 14px",
                                            background:
                                                linkDirection === direction
                                                    ? "rgba(59, 130, 246, 0.2)"
                                                    : "transparent",
                                            color:
                                                linkDirection === direction
                                                    ? "#93c5fd"
                                                    : "#cbd5e1",
                                            border: "none",
                                            borderRadius: 8,
                                            cursor: "pointer",
                                            fontSize: 13,
                                            fontWeight: 600,
                                            transition: "all 200ms ease",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 8,
                                            textAlign: "left",
                                        }}
                                        onMouseEnter={(e) => {
                                            if (linkDirection !== direction) {
                                                e.target.style.background =
                                                    "rgba(148, 163, 184, 0.1)";
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (linkDirection !== direction) {
                                                e.target.style.background =
                                                    "transparent";
                                            }
                                        }}
                                    >
                                        {direction === "upstream" && (
                                            <FiArrowUp size={14} />
                                        )}
                                        {direction === "downstream" && (
                                            <FiArrowDown size={14} />
                                        )}
                                        {direction === "both" && (
                                            <FiRepeat size={14} />
                                        )}
                                        <span>
                                            {direction === "upstream" &&
                                                "Upstream"}
                                            {direction === "downstream" &&
                                                "Downstream"}
                                            {direction === "both" && "Both"}
                                        </span>
                                        {linkDirection === direction && (
                                            <FiCheck
                                                size={14}
                                                style={{ marginLeft: "auto" }}
                                            />
                                        )}
                                    </button>
                                )
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Ref Filter Buttons */}
            <div
                style={{
                    display: "flex",
                    gap: 10,
                    position: "relative",
                    zIndex: 1,
                }}
            >
                <button
                    onClick={onToggleNormalRefs}
                    style={{
                        padding: "9px 16px",
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
                        transition: "all 200ms ease",
                        backdropFilter: "blur(10px)",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        boxShadow: showNormalRefs
                            ? "0 2px 8px rgba(239, 68, 68, 0.2)"
                            : "none",
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = showNormalRefs
                            ? "rgba(239, 68, 68, 0.3)"
                            : "rgba(148, 163, 184, 0.25)";
                        e.target.style.borderColor = showNormalRefs
                            ? "rgba(239, 68, 68, 0.5)"
                            : "rgba(148, 163, 184, 0.4)";
                        e.target.style.transform = "translateY(-1px)";
                        if (showNormalRefs) {
                            e.target.style.boxShadow =
                                "0 4px 12px rgba(239, 68, 68, 0.3)";
                        }
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = showNormalRefs
                            ? "rgba(239, 68, 68, 0.2)"
                            : "rgba(148, 163, 184, 0.15)";
                        e.target.style.borderColor = showNormalRefs
                            ? "rgba(239, 68, 68, 0.4)"
                            : "rgba(148, 163, 184, 0.3)";
                        e.target.style.transform = "translateY(0)";
                        if (showNormalRefs) {
                            e.target.style.boxShadow =
                                "0 2px 8px rgba(239, 68, 68, 0.2)";
                        } else {
                            e.target.style.boxShadow = "none";
                        }
                    }}
                >
                    {showNormalRefs ? <FiCheck size={14} /> : <FiX size={14} />}
                    Normal
                </button>

                <button
                    onClick={onToggleCalcRefs}
                    style={{
                        padding: "9px 16px",
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
                        transition: "all 200ms ease",
                        backdropFilter: "blur(10px)",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        boxShadow: showCalcRefs
                            ? "0 2px 8px rgba(59, 130, 246, 0.2)"
                            : "none",
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = showCalcRefs
                            ? "rgba(59, 130, 246, 0.3)"
                            : "rgba(148, 163, 184, 0.25)";
                        e.target.style.borderColor = showCalcRefs
                            ? "rgba(59, 130, 246, 0.5)"
                            : "rgba(148, 163, 184, 0.4)";
                        e.target.style.transform = "translateY(-1px)";
                        if (showCalcRefs) {
                            e.target.style.boxShadow =
                                "0 4px 12px rgba(59, 130, 246, 0.3)";
                        }
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = showCalcRefs
                            ? "rgba(59, 130, 246, 0.2)"
                            : "rgba(148, 163, 184, 0.15)";
                        e.target.style.borderColor = showCalcRefs
                            ? "rgba(59, 130, 246, 0.4)"
                            : "rgba(148, 163, 184, 0.3)";
                        e.target.style.transform = "translateY(0)";
                        if (showCalcRefs) {
                            e.target.style.boxShadow =
                                "0 2px 8px rgba(59, 130, 246, 0.2)";
                        } else {
                            e.target.style.boxShadow = "none";
                        }
                    }}
                >
                    {showCalcRefs ? <FiCheck size={14} /> : <FiX size={14} />}
                    <FiHash size={14} />
                    Calc
                </button>

                <button
                    onClick={onToggleOnlyHighlighted}
                    style={{
                        padding: "9px 16px",
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
                        transition: "all 200ms ease",
                        backdropFilter: "blur(10px)",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        boxShadow: showOnlyHighlighted
                            ? "0 2px 8px rgba(236, 72, 153, 0.2)"
                            : "none",
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = showOnlyHighlighted
                            ? "rgba(236, 72, 153, 0.3)"
                            : "rgba(148, 163, 184, 0.25)";
                        e.target.style.borderColor = showOnlyHighlighted
                            ? "rgba(236, 72, 153, 0.5)"
                            : "rgba(148, 163, 184, 0.4)";
                        e.target.style.transform = "translateY(-1px)";
                        if (showOnlyHighlighted) {
                            e.target.style.boxShadow =
                                "0 4px 12px rgba(236, 72, 153, 0.3)";
                        }
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = showOnlyHighlighted
                            ? "rgba(236, 72, 153, 0.2)"
                            : "rgba(148, 163, 184, 0.15)";
                        e.target.style.borderColor = showOnlyHighlighted
                            ? "rgba(236, 72, 153, 0.4)"
                            : "rgba(148, 163, 184, 0.3)";
                        e.target.style.transform = "translateY(0)";
                        if (showOnlyHighlighted) {
                            e.target.style.boxShadow =
                                "0 2px 8px rgba(236, 72, 153, 0.2)";
                        } else {
                            e.target.style.boxShadow = "none";
                        }
                    }}
                >
                    {showOnlyHighlighted ? (
                        <FiStar size={14} fill="#fff" />
                    ) : (
                        <FiEye size={14} />
                    )}
                    Highlighted
                </button>
            </div>
        </div>
    );
};

export default FlowHeader;
