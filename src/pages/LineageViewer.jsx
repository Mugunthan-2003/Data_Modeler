import { useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Network } from "vis-network";
import "vis-network/styles/vis-network.min.css";
import { mergedJsonToVisNetwork } from "../utils/lineageToVisNetwork";
import { getMergedFile } from "../utils/fileStorage";
import { FiArrowLeft, FiZoomIn, FiZoomOut, FiMaximize2 } from "react-icons/fi";

function LineageViewer() {
    const { fileId } = useParams();
    const navigate = useNavigate();
    const networkRef = useRef(null);
    const containerRef = useRef(null);
    const minimapRef = useRef(null);
    const minimapNetworkRef = useRef(null);

    const handleBack = useCallback(() => {
        navigate("/");
    }, [navigate]);

    const handleZoomIn = useCallback(() => {
        if (networkRef.current) {
            const currentZoom = networkRef.current.getScale();
            networkRef.current.moveTo({
                scale: Math.min(currentZoom * 1.2, 4),
                animation: {
                    duration: 200,
                    easingFunction: "easeInOutQuad",
                },
            });
        }
    }, []);

    const handleZoomOut = useCallback(() => {
        if (networkRef.current) {
            const currentZoom = networkRef.current.getScale();
            networkRef.current.moveTo({
                scale: Math.max(currentZoom / 1.2, 0.1),
                animation: {
                    duration: 200,
                    easingFunction: "easeInOutQuad",
                },
            });
        }
    }, []);

    const handleFitView = useCallback(() => {
        if (networkRef.current) {
            networkRef.current.fit({
                animation: {
                    duration: 300,
                    easingFunction: "easeInOutQuad",
                },
            });
        }
    }, []);

    useEffect(() => {
        const loadAndRender = async () => {
            if (!containerRef.current) return;

            let nodes = [];
            let edges = [];

            if (fileId) {
                const mergedFile = await getMergedFile(fileId);
                if (mergedFile && mergedFile.data) {
                    try {
                        const { nodes: visNodes, edges: visEdges } =
                            mergedJsonToVisNetwork(mergedFile.data);
                        nodes = visNodes;
                        edges = visEdges;
                    } catch (error) {
                        console.error("Error loading merged file data:", error);
                        navigate("/");
                        return;
                    }
                } else {
                    navigate("/");
                    return;
                }
            }

            const data = {
                nodes: nodes,
                edges: edges,
            };

            const options = {
                nodes: {
                    shape: "dot",
                    size: 30,
                    font: {
                        size: 14,
                        color: "#000000",
                    },
                    borderWidth: 2,
                },
                edges: {
                    width: 2,
                    color: { color: "#848484" },
                    smooth: {
                        type: "continuous",
                    },
                },
                physics: {
                    enabled: true,
                    solver: "forceAtlas2Based",
                    forceAtlas2Based: {
                        gravitationalConstant: -100,
                        centralGravity: 0.01,
                        springLength: 150,
                        springConstant: 0.1,
                        damping: 0.8,
                        avoidOverlap: 1,
                    },
                    stabilization: {
                        enabled: true,
                        iterations: 1000,
                        updateInterval: 25,
                    },
                },
                layout: {
                    hierarchical: {
                        enabled: false,
                    },
                },
                interaction: {
                    zoomView: true,
                    dragView: true,
                },
                configure: {
                    enabled: false,
                },
            };

            if (containerRef.current) {
                networkRef.current = new Network(
                    containerRef.current,
                    data,
                    options
                );

                const originalNodes = JSON.parse(JSON.stringify(nodes));
                const originalEdges = JSON.parse(JSON.stringify(edges));
                let physicsDisabled = false;

                const resetHighlighting = () => {
                    const positions = networkRef.current.getPositions();
                    const nodesWithPositions = originalNodes.map((node) => ({
                        ...node,
                        x: positions[node.id]?.x,
                        y: positions[node.id]?.y,
                        fixed: true,
                    }));

                    networkRef.current.setData({
                        nodes: nodesWithPositions,
                        edges: JSON.parse(JSON.stringify(originalEdges)),
                    });

                    if (physicsDisabled) {
                        networkRef.current.setOptions({ physics: false });
                    }
                };

                const highlightConnected = (nodeId) => {
                    const isTarget = nodeId.startsWith("TARGET_");
                    const isSource = nodeId.startsWith("SOURCE_");

                    if (!isTarget && !isSource) return;

                    const connectedNodeIds = new Set();
                    const connectedEdgeIds = new Set();

                    if (isTarget) {
                        originalEdges.forEach((edge) => {
                            if (edge.to === nodeId) {
                                connectedNodeIds.add(edge.from);
                                connectedEdgeIds.add(edge.id);
                            }
                        });
                    } else if (isSource) {
                        originalEdges.forEach((edge) => {
                            if (edge.from === nodeId) {
                                connectedNodeIds.add(edge.to);
                                connectedEdgeIds.add(edge.id);
                            }
                        });
                    }

                    connectedNodeIds.add(nodeId);

                    const positions = networkRef.current.getPositions();

                    const updatedNodes = originalNodes.map((node) => {
                        const nodeWithPosition = {
                            ...node,
                            x: positions[node.id]?.x,
                            y: positions[node.id]?.y,
                            // fixed: true,
                        };

                        if (connectedNodeIds.has(node.id)) {
                            const originalColor =
                                typeof node.color === "string"
                                    ? node.color
                                    : node.color?.background || node.color;
                            return {
                                ...nodeWithPosition,
                                color: {
                                    background: originalColor,
                                    border: "#64748b",
                                },
                                borderWidth: 4,
                            };
                        }
                        return nodeWithPosition;
                    });

                    const updatedEdges = originalEdges.map((edge) => {
                        if (connectedEdgeIds.has(edge.id)) {
                            return {
                                ...edge,
                                color: { color: "#64748b" },
                                width: 3,
                            };
                        }
                        return { ...edge };
                    });

                    networkRef.current.setData({
                        nodes: updatedNodes,
                        edges: updatedEdges,
                    });

                    if (physicsDisabled) {
                        networkRef.current.setOptions({ physics: false });
                    }
                };

                networkRef.current.on("click", (params) => {
                    if (params.nodes.length > 0) {
                        const clickedNodeId = params.nodes[0];
                        highlightConnected(clickedNodeId);
                    } else {
                        resetHighlighting();
                    }
                });

                const updateMinimap = () => {
                    if (
                        minimapRef.current &&
                        networkRef.current &&
                        nodes.length > 0
                    ) {
                        if (minimapNetworkRef.current) {
                            minimapNetworkRef.current.destroy();
                        }

                        const positions = networkRef.current.getPositions();
                        const nodesWithPositions = nodes.map((node) => ({
                            ...node,
                            x: positions[node.id]?.x,
                            y: positions[node.id]?.y,
                            fixed: true,
                        }));

                        const minimapData = {
                            nodes: nodesWithPositions,
                            edges: edges,
                        };

                        const minimapOptions = {
                            nodes: {
                                shape: "dot",
                                size: 8,
                                font: {
                                    size: 0,
                                    color: "#000000",
                                },
                                borderWidth: 1,
                            },
                            edges: {
                                width: 1,
                                color: { color: "#848484" },
                                smooth: {
                                    type: "continuous",
                                },
                            },
                            physics: {
                                enabled: false,
                            },
                            interaction: {
                                zoomView: false,
                                dragView: false,
                                selectConnectedEdges: false,
                                dragNodes: false,
                            },
                        };

                        minimapNetworkRef.current = new Network(
                            minimapRef.current,
                            minimapData,
                            minimapOptions
                        );

                        setTimeout(() => {
                            if (minimapNetworkRef.current) {
                                minimapNetworkRef.current.fit({
                                    animation: false,
                                    padding: 15,
                                });
                            }
                        }, 200);
                    }
                };

                networkRef.current.once("stabilizationIterationsDone", () => {
                    updateMinimap();
                    if (networkRef.current) {
                        networkRef.current.setOptions({ physics: false });
                        physicsDisabled = true;
                    }
                });

                networkRef.current.on("stabilizationEnd", () => {
                    updateMinimap();
                });
            }

            return () => {
                if (networkRef.current) {
                    networkRef.current.destroy();
                }
                if (minimapNetworkRef.current) {
                    minimapNetworkRef.current.destroy();
                }
            };
        };

        loadAndRender();
    }, [fileId]);

    return (
        <div
            style={{
                width: "100vw",
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                overflow: "hidden",
            }}
        >
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
                        onClick={handleBack}
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
            <div
                style={{
                    flex: 1,
                    width: "100%",
                    height: "90%",
                    position: "relative",
                    background:
                        "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                }}
            >
                <div
                    ref={containerRef}
                    style={{
                        width: "100%",
                        height: "100%",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        bottom: 50,
                        left: 20,
                        width: 200,
                        height: 150,
                        background: "rgba(30, 41, 59, 0.9)",
                        border: "1px solid rgba(148, 163, 184, 0.3)",
                        borderRadius: 8,
                        backdropFilter: "blur(10px)",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
                        zIndex: 10,
                        overflow: "hidden",
                        padding: 8,
                        boxSizing: "border-box",
                    }}
                >
                    <div
                        ref={minimapRef}
                        style={{
                            width: "100%",
                            height: "100%",
                            position: "relative",
                        }}
                    />
                </div>
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
                        onClick={handleZoomIn}
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
                        onClick={handleZoomOut}
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
                        onClick={handleFitView}
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
            </div>
        </div>
    );
}

export default LineageViewer;
