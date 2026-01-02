import React from "react";

const ConnectionSuggestionModal = ({
    mode,
    sourceName,
    targetName,
    targetOptions = [],
    requiredSources = [],
    onSelectTarget,
    onSkip,
}) => {
    const isSourceMode = mode === "SOURCE";

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0, 0, 0, 0.55)",
                backdropFilter: "blur(4px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1200,
                padding: "24px",
            }}
            onClick={onSkip}
        >
            <div
                style={{
                    width: "520px",
                    maxWidth: "90vw",
                    background: "#ffffff",
                    borderRadius: "12px",
                    boxShadow: "0 20px 60px rgba(15, 23, 42, 0.25)",
                    padding: "20px",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "12px",
                    }}
                >
                    <div>
                        <div
                            style={{
                                fontSize: "16px",
                                fontWeight: 700,
                                color: "#0f172a",
                                marginBottom: "4px",
                            }}
                        >
                            {isSourceMode
                                ? `Connect ${sourceName} to targets`
                                : `Connect sources to ${targetName}`}
                        </div>
                        <div
                            style={{
                                fontSize: "13px",
                                color: "#475569",
                            }}
                        >
                            {isSourceMode
                                ? "Pick a target to auto-wire all referenced sources"
                                : "Auto-add required sources and edges for this target"}
                        </div>
                    </div>
                    <button
                        onClick={onSkip}
                        style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                            background: "#ffffff",
                            color: "#0f172a",
                            cursor: "pointer",
                            fontWeight: 700,
                        }}
                    >
                        X
                    </button>
                </div>

                {isSourceMode ? (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr",
                            gap: "12px",
                            maxHeight: "360px",
                            overflowY: "auto",
                            paddingRight: "4px",
                        }}
                    >
                        {targetOptions.map((option) => (
                            <div
                                key={option.name}
                                style={{
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "10px",
                                    padding: "12px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: "12px",
                                }}
                            >
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div
                                        style={{
                                            fontSize: "14px",
                                            fontWeight: 700,
                                            color: "#0f172a",
                                            marginBottom: "4px",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {sourceName} → {option.name}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: "12px",
                                            color: "#475569",
                                        }}
                                    >
                                        Required sources:{" "}
                                        {option.requiredSources.length
                                            ? option.requiredSources.join(", ")
                                            : "None"}
                                    </div>
                                </div>
                                <button
                                    onClick={() => onSelectTarget(option.name)}
                                    style={{
                                        padding: "10px 14px",
                                        background:
                                            "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                                        color: "#ffffff",
                                        border: "none",
                                        borderRadius: "8px",
                                        fontSize: "13px",
                                        fontWeight: 700,
                                        cursor: "pointer",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    Connect
                                </button>
                            </div>
                        ))}

                        {targetOptions.length === 0 && (
                            <div
                                style={{
                                    padding: "16px",
                                    textAlign: "center",
                                    color: "#94a3b8",
                                    fontSize: "13px",
                                }}
                            >
                                No targets reference this source in the mapping.
                            </div>
                        )}
                    </div>
                ) : (
                    <div
                        style={{
                            border: "1px solid #e2e8f0",
                            borderRadius: "10px",
                            padding: "12px",
                            marginBottom: "12px",
                        }}
                    >
                        <div
                            style={{
                                fontSize: "14px",
                                fontWeight: 700,
                                color: "#0f172a",
                                marginBottom: "6px",
                            }}
                        >
                            Required sources
                        </div>
                        <div
                            style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "8px",
                            }}
                        >
                            {requiredSources.length ? (
                                requiredSources.map((src) => (
                                    <div
                                        key={src}
                                        style={{
                                            padding: "8px 10px",
                                            borderRadius: "8px",
                                            background: "rgba(59, 130, 246, 0.08)",
                                            color: "#1d4ed8",
                                            fontSize: "12px",
                                            border: "1px solid rgba(59, 130, 246, 0.2)",
                                        }}
                                    >
                                        {src}
                                    </div>
                                ))
                            ) : (
                                <div
                                    style={{
                                        fontSize: "13px",
                                        color: "#475569",
                                    }}
                                >
                                    No source references defined for this target.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div
                    style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "10px",
                        marginTop: "12px",
                    }}
                >
                    <button
                        onClick={onSkip}
                        style={{
                            padding: "10px 14px",
                            background: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            color: "#0f172a",
                            fontSize: "13px",
                            fontWeight: 600,
                            cursor: "pointer",
                        }}
                    >
                        Skip
                    </button>
                    <button
                        onClick={() =>
                            onSelectTarget(
                                isSourceMode && targetOptions.length
                                    ? targetOptions[0].name
                                    : targetName
                            )
                        }
                        disabled={
                            isSourceMode ? targetOptions.length === 0 : !targetName
                        }
                        style={{
                            padding: "10px 14px",
                            background:
                                "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                            border: "none",
                            borderRadius: "8px",
                            color: "#ffffff",
                            fontSize: "13px",
                            fontWeight: 700,
                            cursor: isSourceMode
                                ? targetOptions.length === 0
                                    ? "not-allowed"
                                    : "pointer"
                                : !targetName
                                ? "not-allowed"
                                : "pointer",
                            opacity:
                                isSourceMode && targetOptions.length === 0
                                    ? 0.6
                                    : !isSourceMode && !targetName
                                    ? 0.6
                                    : 1,
                        }}
                    >
                        {isSourceMode ? "Connect first target" : "Connect all"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConnectionSuggestionModal;

