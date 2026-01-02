import { useState, useRef, useEffect } from "react";
import { FiX, FiBarChart2, FiDatabase, FiHash, FiEdit2, FiCheck, FiRotateCcw, FiLink2 } from "react-icons/fi";

/**
 * Drawer component for displaying and editing field calculation details
 */
const FieldDrawer = ({ selectedField, onClose, onUpdateCalculation }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState("");
    const [suggestion, setSuggestion] = useState("");
    const [cursorPos, setCursorPos] = useState({ top: 0, left: 0 });
    const [drawerWidth, setDrawerWidth] = useState(400);
    const [isResizing, setIsResizing] = useState(false);
    const textareaRef = useRef(null);
    const drawerRef = useRef(null);

    const handleResizeStart = (e) => {
        setIsResizing(true);
        e.preventDefault();
    };

    const handleResizeMove = (e) => {
        if (!isResizing || !drawerRef.current) return;

        const drawerRect = drawerRef.current.getBoundingClientRect();
        // For left-side dragging: calculate width from right edge
        const newWidth = drawerRect.right - e.clientX;
        if (newWidth > 300 && newWidth < 800) {
            setDrawerWidth(newWidth);
        }
    };

    const handleResizeEnd = () => {
        setIsResizing(false);
    };

    // Add event listeners for resize
    useEffect(() => {
        if (isResizing) {
            document.addEventListener('mousemove', handleResizeMove);
            document.addEventListener('mouseup', handleResizeEnd);
            return () => {
                document.removeEventListener('mousemove', handleResizeMove);
                document.removeEventListener('mouseup', handleResizeEnd);
            };
        }
    }, [isResizing]);

    if (!selectedField) return null;

    const handleEditStart = () => {
        setEditValue(selectedField.calculation || "");
        setIsEditing(true);
    };

    const handleSave = () => {
        if (onUpdateCalculation) {
            onUpdateCalculation(selectedField.nodeId, selectedField.fieldName, editValue);
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditValue("");
        setSuggestion("");
    };

    // Extract referenced fields from calculation
    const getReferencedFields = () => {
        const refs = selectedField.refs || [];
        return refs;
    };

    const referencedFields = getReferencedFields();

    // Get text being typed after last space or special character
    const getCurrentWord = (text, cursorPos) => {
        const textBeforeCursor = text.substring(0, cursorPos);
        const words = textBeforeCursor.split(/[\s\(\)\,\+\-\*\/\=\<\>\!]+/);
        return words[words.length - 1] || "";
    };

    const handleTextareaChange = (e) => {
        const newValue = e.target.value;
        setEditValue(newValue);

        // Get the current word being typed
        const selectionStart = e.target.selectionStart;
        const currentWord = getCurrentWord(newValue, selectionStart);

        // Calculate cursor position
        const textBeforeCursor = newValue.substring(0, selectionStart);
        const lines = textBeforeCursor.split('\n');
        const currentLine = lines[lines.length - 1];
        
        // Use canvas to measure text width
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.font = '13px "Fira Code", "Courier New", monospace';
        const textWidth = ctx.measureText(currentLine).width;
        const lineNumber = lines.length - 1;
        
        // Calculate position with bounds checking
        let left = textWidth + 12;
        let top = lineNumber * 20.8 + 12 + 20; // +20 for line below
        
        // Constrain to textarea bounds (assuming ~350px width for suggestion space)
        if (e.target) {
            const maxLeft = e.target.offsetWidth - 180; // Leave space for suggestion
            if (left > maxLeft) {
                left = maxLeft;
            }
            if (left < 12) {
                left = 12;
            }
            
            const maxTop = e.target.offsetHeight - 40; // Leave space at bottom
            if (top > maxTop) {
                top = Math.max(12, lineNumber * 20.8 + 12 - 30); // Show above cursor if needed
            }
        }
        
        setCursorPos({
            top,
            left,
        });

        // Find the best matching suggestion using substring search
        if (currentWord.length > 0) {
            const filtered = referencedFields.filter((ref) =>
                ref.toLowerCase().includes(currentWord.toLowerCase())
            );
            if (filtered.length > 0) {
                setSuggestion(filtered[0]);
            } else {
                setSuggestion("");
            }
        } else {
            setSuggestion("");
        }
    };

    const insertSuggestion = () => {
        if (!suggestion) return;
        
        const textareaElement = textareaRef.current;
        if (!textareaElement) return;

        const cursorPos = textareaElement.selectionStart;
        const textBeforeCursor = editValue.substring(0, cursorPos);
        const textAfterCursor = editValue.substring(cursorPos);

        // Find the start of the current word
        const words = textBeforeCursor.split(/[\s\(\)\,\+\-\*\/\=\<\>\!]+/);
        const currentWord = words[words.length - 1] || "";
        const wordStartPos = textBeforeCursor.length - currentWord.length;

        // Replace the current word with the suggestion
        const newValue =
            textBeforeCursor.substring(0, wordStartPos) +
            suggestion +
            textAfterCursor;

        setEditValue(newValue);
        setSuggestion("");

        // Move cursor after the inserted suggestion
        setTimeout(() => {
            textareaElement.focus();
            textareaElement.selectionStart = wordStartPos + suggestion.length;
            textareaElement.selectionEnd = wordStartPos + suggestion.length;
        }, 0);
    };

    const handleKeyDown = (e) => {
        if (suggestion && e.key === "Tab") {
            e.preventDefault();
            insertSuggestion();
        } else if (suggestion && e.key !== "Escape") {
            // Any other key dismisses the suggestion
            setSuggestion("");
        } else if (e.key === "Escape") {
            setSuggestion("");
        }
    };

    return (
        <div
            ref={drawerRef}
            style={{
                width: `${drawerWidth}px`,
                background: "linear-gradient(180deg, #ffffff 0%, #f9fafb 100%)",
                borderLeft: "2px solid #e5e7eb",
                boxShadow: "-4px 0 20px rgba(0, 0, 0, 0.15)",
                padding: "24px",
                overflowY: "auto",
                transition: isResizing ? "none" : "transform 300ms ease",
                position: "relative",
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "24px",
                    paddingBottom: "18px",
                    borderBottom: "2px solid #e5e7eb",
                }}
            >
                <h3 style={{ 
                    margin: 0, 
                    color: "#111827",
                    fontSize: "20px",
                    fontWeight: 600,
                    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                }}>
                    <FiBarChart2 size={20} />
                    Field Calculation
                </h3>
                <div style={{ position: "relative" }}>
                    <button
                        onClick={onClose}
                        style={{ 
                            cursor: "pointer",
                            background: "#ef4444",
                            color: "#fff",
                            border: "none",
                            borderRadius: "50%",
                            width: "28px",
                            height: "28px",
                            fontSize: "16px",
                            fontWeight: "bold",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 150ms ease",
                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = "#dc2626";
                            e.target.style.transform = "scale(1.1) rotate(90deg)";
                            const tooltip = e.target.parentElement?.querySelector('.tooltip');
                            if (tooltip) tooltip.style.opacity = "1";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = "#ef4444";
                            e.target.style.transform = "scale(1) rotate(0deg)";
                            const tooltip = e.target.parentElement?.querySelector('.tooltip');
                            if (tooltip) tooltip.style.opacity = "0";
                        }}
                    >
                        <FiX size={16} />
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
                        Close
                    </div>
                </div>
            </div>

            <div style={{ 
                marginBottom: "24px",
                padding: "16px",
                background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
                borderRadius: 10,
                border: "1px solid #bae6fd",
            }}>
                <div style={{ fontSize: 14, marginBottom: "10px", display: "flex", alignItems: "center", gap: 8 }}>
                    <FiDatabase size={16} color="#0369a1" />
                    <strong style={{ color: "#0369a1" }}>Node:</strong> 
                    <span style={{ color: "#0c4a6e", marginLeft: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selectedField.nodeId}</span>
                </div>
                <div style={{ fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
                    <FiHash size={16} color="#0369a1" />
                    <strong style={{ color: "#0369a1" }}>Field:</strong> 
                    <span style={{ color: "#0c4a6e", marginLeft: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selectedField.fieldName}</span>
                </div>
            </div>

            {/* Scrollable, pre-formatted calculation box */}
            <div
                style={{
                    padding: "16px",
                    background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                    borderRadius: 12,
                    border: "2px solid #3b82f6",
                    maxHeight: "calc(100vh - 300px)",
                    overflow: "auto",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    fontFamily: "'Fira Code', 'Courier New', monospace",
                    fontSize: 13,
                    color: "#92400e",
                    lineHeight: "1.6",
                    boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.06)",
                    position: "relative",
                    overflowWrap: "break-word",
                }}
            >
                {isEditing ? (
                    <div style={{ position: "relative" }}>
                        <textarea
                            ref={textareaRef}
                            value={editValue}
                            onChange={handleTextareaChange}
                            onKeyDown={handleKeyDown}
                            style={{
                                width: "100%",
                                height: "100%",
                                minHeight: "200px",
                                padding: "12px",
                                border: "2px solid #3b82f6",
                                borderRadius: 8,
                                fontFamily: "'Fira Code', 'Courier New', monospace",
                                fontSize: 13,
                                resize: "vertical",
                                background: "#fff",
                                color: "#1f2937",
                                lineHeight: "1.6",
                                boxSizing: "border-box",
                            }}
                        />

                        {/* Suggestion Overlay - full text within textarea */}
                        {suggestion && (
                            <div
                                style={{
                                    position: "absolute",
                                    top: `${cursorPos.top}px`,
                                    left: `${cursorPos.left}px`,
                                    padding: "4px 8px",
                                    background: "rgba(255, 255, 255, 0.98)",
                                    border: "1px solid #d1d5db",
                                    borderRadius: "4px",
                                    fontSize: 12,
                                    fontFamily: "'Fira Code', 'Courier New', monospace",
                                    color: "#1f2937",
                                    pointerEvents: "none",
                                    zIndex: 10,
                                    whiteSpace: "pre-wrap",
                                    wordBreak: "break-word",
                                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                                    maxWidth: "calc(100% - " + (cursorPos.left + 16) + "px)",
                                }}
                            >
                                {suggestion}
                            </div>
                        )}
                    </div>
                ) : (
                    selectedField.calculation
                )}
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
                {isEditing ? (
                    <>
                        <button
                            onClick={handleSave}
                            style={{
                                flex: 1,
                                padding: "10px 16px",
                                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                color: "#fff",
                                border: "none",
                                borderRadius: 8,
                                cursor: "pointer",
                                fontWeight: 600,
                                fontSize: 14,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 8,
                                transition: "all 150ms ease",
                                boxShadow: "0 4px 6px rgba(16, 185, 129, 0.3)",
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = "linear-gradient(135deg, #059669 0%, #047857 100%)";
                                e.target.style.boxShadow = "0 6px 12px rgba(16, 185, 129, 0.4)";
                                e.target.style.transform = "translateY(-1px)";
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = "linear-gradient(135deg, #10b981 0%, #059669 100%)";
                                e.target.style.boxShadow = "0 4px 6px rgba(16, 185, 129, 0.3)";
                                e.target.style.transform = "translateY(0)";
                            }}
                        >
                            <FiCheck size={16} />
                            Save
                        </button>
                        <button
                            onClick={handleCancel}
                            style={{
                                flex: 1,
                                padding: "10px 16px",
                                background: "#f3f4f6",
                                color: "#374151",
                                border: "1px solid #d1d5db",
                                borderRadius: 8,
                                cursor: "pointer",
                                fontWeight: 600,
                                fontSize: 14,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 8,
                                transition: "all 150ms ease",
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = "#e5e7eb";
                                e.target.style.transform = "translateY(-1px)";
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = "#f3f4f6";
                                e.target.style.transform = "translateY(0)";
                            }}
                        >
                            <FiRotateCcw size={16} />
                            Cancel
                        </button>
                    </>
                ) : (
                    <button
                        onClick={handleEditStart}
                        style={{
                            flex: 1,
                            padding: "10px 16px",
                            background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                            color: "#fff",
                            border: "none",
                            borderRadius: 8,
                            cursor: "pointer",
                            fontWeight: 600,
                            fontSize: 14,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                            transition: "all 150ms ease",
                            boxShadow: "0 4px 6px rgba(59, 130, 246, 0.3)",
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)";
                            e.target.style.boxShadow = "0 6px 12px rgba(59, 130, 246, 0.4)";
                            e.target.style.transform = "translateY(-1px)";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)";
                            e.target.style.boxShadow = "0 4px 6px rgba(59, 130, 246, 0.3)";
                            e.target.style.transform = "translateY(0)";
                        }}
                    >
                        <FiEdit2 size={16} />
                        Edit
                    </button>
                )}
            </div>

            {/* Referenced Fields Section - Below Action Buttons */}
            {referencedFields.length > 0 && (
                <div style={{ 
                    marginTop: "20px",
                    padding: "14px",
                    background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                    borderRadius: 10,
                    border: "1px solid #fcd34d",
                }}>
                    <div style={{ 
                        fontSize: 12, 
                        fontWeight: 600,
                        color: "#92400e",
                        marginBottom: "10px",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                    }}>
                        <FiLink2 size={14} />
                        Referenced Fields
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        {referencedFields.map((ref, idx) => (
                            <div
                                key={idx}
                                style={{
                                    padding: "6px 10px",
                                    background: "#fff",
                                    borderRadius: 6,
                                    border: "1px solid #fcd34d",
                                    fontSize: 12,
                                    fontFamily: "'Fira Code', 'Courier New', monospace",
                                    color: "#78350f",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    wordBreak: "break-all",
                                }}
                                title={ref}
                            >
                                {ref}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Resize Handle - Left side */}
            <div
                onMouseDown={handleResizeStart}
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "4px",
                    height: "100%",
                    cursor: "col-resize",
                    backgroundColor: isResizing ? "#3b82f6" : "#d1d5db",
                    transition: "backgroundColor 150ms ease",
                    userSelect: "none",
                }}
                onMouseEnter={(e) => {
                    if (!isResizing) e.target.style.backgroundColor = "#3b82f6";
                }}
                onMouseLeave={(e) => {
                    if (!isResizing) e.target.style.backgroundColor = "#d1d5db";
                }}
            />
        </div>
    );
};

export default FieldDrawer;
