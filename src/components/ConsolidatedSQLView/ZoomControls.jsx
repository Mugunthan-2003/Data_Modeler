import { FiZoomIn, FiZoomOut, FiMaximize2 } from "react-icons/fi";

function ZoomControls({ onZoomIn, onZoomOut, onFitView }) {
    return (
        <div
            style={{
                position: "absolute",
                bottom: 50,
                right: 20,
                display: "flex",
                flexDirection: "column",
                gap: 8,
                zIndex: 100,
            }}
        >
            <button
                onClick={onZoomIn}
                style={{
                    width: 40,
                    height: 40,
                    background: "rgba(30, 41, 59, 0.9)",
                    color: "#cbd5e1",
                    border: "1px solid rgba(148, 163, 184, 0.3)",
                    borderRadius: 8,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backdropFilter: "blur(10px)",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
                    transition: "all 200ms ease",
                }}
                onMouseEnter={(e) => {
                    e.target.style.background = "rgba(30, 41, 59, 1)";
                    e.target.style.borderColor =
                        "rgba(148, 163, 184, 0.5)";
                    e.target.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                    e.target.style.background = "rgba(30, 41, 59, 0.9)";
                    e.target.style.borderColor =
                        "rgba(148, 163, 184, 0.3)";
                    e.target.style.transform = "scale(1)";
                }}
                title="Zoom In"
            >
                <FiZoomIn size={20} />
            </button>
            <button
                onClick={onZoomOut}
                style={{
                    width: 40,
                    height: 40,
                    background: "rgba(30, 41, 59, 0.9)",
                    color: "#cbd5e1",
                    border: "1px solid rgba(148, 163, 184, 0.3)",
                    borderRadius: 8,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backdropFilter: "blur(10px)",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
                    transition: "all 200ms ease",
                }}
                onMouseEnter={(e) => {
                    e.target.style.background = "rgba(30, 41, 59, 1)";
                    e.target.style.borderColor =
                        "rgba(148, 163, 184, 0.5)";
                    e.target.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                    e.target.style.background = "rgba(30, 41, 59, 0.9)";
                    e.target.style.borderColor =
                        "rgba(148, 163, 184, 0.3)";
                    e.target.style.transform = "scale(1)";
                }}
                title="Zoom Out"
            >
                <FiZoomOut size={20} />
            </button>
            <button
                onClick={onFitView}
                style={{
                    width: 40,
                    height: 40,
                    background: "rgba(30, 41, 59, 0.9)",
                    color: "#cbd5e1",
                    border: "1px solid rgba(148, 163, 184, 0.3)",
                    borderRadius: 8,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backdropFilter: "blur(10px)",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
                    transition: "all 200ms ease",
                }}
                onMouseEnter={(e) => {
                    e.target.style.background = "rgba(30, 41, 59, 1)";
                    e.target.style.borderColor =
                        "rgba(148, 163, 184, 0.5)";
                    e.target.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                    e.target.style.background = "rgba(30, 41, 59, 0.9)";
                    e.target.style.borderColor =
                        "rgba(148, 163, 184, 0.3)";
                    e.target.style.transform = "scale(1)";
                }}
                title="Fit View"
            >
                <FiMaximize2 size={18} />
            </button>
        </div>
    );
}

export default ZoomControls;

