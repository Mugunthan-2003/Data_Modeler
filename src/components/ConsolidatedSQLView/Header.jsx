import { FiArrowLeft } from "react-icons/fi";

function Header({ onBack }) {
    return (
        <div
            style={{
                padding: "16px 24px",
                background:
                    "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                borderBottom: "2px solid rgba(148, 163, 184, 0.2)",
                display: "flex",
                gap: 12,
                alignItems: "center",
                boxShadow:
                    "0 4px 16px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)",
                backdropFilter: "blur(10px)",
                position: "relative",
                zIndex: 100,
            }}
        >
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
                        backdropFilter: "blur(10px)",
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background =
                            "rgba(148, 163, 184, 0.25)";
                        e.target.style.borderColor =
                            "rgba(148, 163, 184, 0.5)";
                        e.target.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background =
                            "rgba(148, 163, 184, 0.15)";
                        e.target.style.borderColor =
                            "rgba(148, 163, 184, 0.3)";
                        e.target.style.transform = "translateY(0)";
                    }}
                >
                    <FiArrowLeft size={16} />
                    Back
                </button>
            </div>
        </div>
    );
}

export default Header;

