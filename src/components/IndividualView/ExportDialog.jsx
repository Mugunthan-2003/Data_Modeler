import { useState } from "react";
import { FiX, FiDownload } from "react-icons/fi";

/**
 * Dialog component for exporting JSON files with custom filename
 */
const ExportDialog = ({ onConfirm, onCancel }) => {
    const [fileName, setFileName] = useState("data_model.json");

    const handleConfirm = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!fileName.trim()) {
            alert("Please enter a file name");
            return;
        }

        // Ensure filename ends with .json
        let finalFileName = fileName.trim();
        if (!finalFileName.endsWith(".json")) {
            finalFileName += ".json";
        }

        onConfirm(finalFileName);
    };

    const handleCancel = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onCancel();
    };

    const handleFileNameChange = (e) => {
        let value = e.target.value;
        // Remove .json extension if user typed it, we'll add it back on export
        if (value.endsWith(".json")) {
            value = value.slice(0, -5);
        }
        setFileName(value);
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
            <h2
                style={{
                    margin: 0,
                    marginBottom: 8,
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#1f2937",
                }}
            >
                Export Data Model
            </h2>
            <p
                style={{
                    margin: 0,
                    marginBottom: 24,
                    fontSize: 14,
                    color: "#6b7280",
                    lineHeight: 1.5,
                }}
            >
                Choose a name for your exported JSON file. The file will be saved to your Downloads folder or the location you select.
            </p>

            <form onSubmit={handleConfirm}>
                <div
                    style={{
                        marginBottom: 24,
                    }}
                >
                    <label
                        style={{
                            display: "block",
                            marginBottom: 8,
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#1f2937",
                        }}
                    >
                        File Name
                    </label>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                        }}
                    >
                        <input
                            type="text"
                            value={fileName}
                            onChange={handleFileNameChange}
                            placeholder="data_model"
                            autoFocus
                            style={{
                                flex: 1,
                                padding: "10px 12px",
                                fontSize: 14,
                                border: "1px solid rgba(209, 213, 219, 0.8)",
                                borderRadius: 8,
                                background: "#fff",
                                color: "#1f2937",
                                fontFamily: "inherit",
                                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                                transition: "all 200ms ease",
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = "rgba(59, 130, 246, 0.5)";
                                e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = "rgba(209, 213, 219, 0.8)";
                                e.target.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)";
                            }}
                        />
                        <span
                            style={{
                                fontSize: 13,
                                color: "#6b7280",
                                fontWeight: 500,
                            }}
                        >
                            .json
                        </span>
                    </div>
                </div>

                <div
                    style={{
                        display: "flex",
                        gap: 12,
                        justifyContent: "flex-end",
                    }}
                >
                    <button
                        type="button"
                        onClick={handleCancel}
                        style={{
                            padding: "10px 18px",
                            background: "rgba(229, 231, 235, 0.5)",
                            color: "#6b7280",
                            border: "1px solid rgba(209, 213, 219, 0.5)",
                            borderRadius: 8,
                            cursor: "pointer",
                            fontWeight: 600,
                            fontSize: 14,
                            transition: "all 200ms ease",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = "rgba(229, 231, 235, 0.7)";
                            e.target.style.borderColor = "rgba(209, 213, 219, 0.7)";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = "rgba(229, 231, 235, 0.5)";
                            e.target.style.borderColor = "rgba(209, 213, 219, 0.5)";
                        }}
                    >
                        <FiX size={16} />
                        Cancel
                    </button>
                    <button
                        type="submit"
                        style={{
                            padding: "10px 18px",
                            background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                            color: "#fff",
                            border: "1px solid rgba(59, 130, 246, 0.5)",
                            borderRadius: 8,
                            cursor: "pointer",
                            fontWeight: 600,
                            fontSize: 14,
                            transition: "all 200ms ease",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.boxShadow = "0 6px 16px rgba(59, 130, 246, 0.4)";
                            e.target.style.transform = "translateY(-1px)";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.3)";
                            e.target.style.transform = "translateY(0)";
                        }}
                    >
                        <FiDownload size={16} />
                        Export
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ExportDialog;
