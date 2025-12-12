import { useCallback, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Network } from "vis-network";
import { DataSet } from "vis-data";
import "vis-network/styles/vis-network.min.css";
import { mergedJsonToVisNetwork } from "../utils/lineageToVisNetwork";
import { getMergedFile } from "../utils/fileStorage";
import { FiArrowLeft, FiLayout } from "react-icons/fi";

const LineageViewer = () => {
    const { fileId } = useParams();
    const navigate = useNavigate();
    const networkRef = useRef(null);
    const containerRef = useRef(null);
    const nodesRef = useRef(new DataSet());
    const edgesRef = useRef(new DataSet());
    const loadedFileIdRef = useRef(null);

    const defaultSourceColor = "#cbd5e1";
    const defaultTargetColor = "#86efac";
    const sourceHighlightColor = "#64748b";
    const targetHighlightColor = "#16a34a";
    const edgeHighlightColor = "#3b82f6";

    const resetHighlights = useCallback(() => {
        nodesRef.current.forEach((node) => {
            const nodeType = node.nodeType || "source";
            nodesRef.current.update({
                id: node.id,
                color: nodeType === "source" ? defaultSourceColor : defaultTargetColor,
            });
        });
        edgesRef.current.forEach((edge) => {
            edgesRef.current.update({
                id: edge.id,
                color: { color: "#94a3b8" },
                width: 2,
            });
        });
    }, []);

    const highlightSelected = useCallback((nodeId) => {
        resetHighlights();

        const node = nodesRef.current.get(nodeId);
        if (!node) return;

        const nodeType = node.nodeType || "source";
        nodesRef.current.update({
            id: nodeId,
            color: nodeType === "source" ? sourceHighlightColor : targetHighlightColor,
        });

        const connectedEdges = edgesRef.current.get({
            filter: (edge) => edge.from === nodeId || edge.to === nodeId,
        });

        connectedEdges.forEach((edge) => {
            edgesRef.current.update({
                id: edge.id,
                color: { color: edgeHighlightColor },
                width: 3,
            });

            const connectedNodeId = edge.from === nodeId ? edge.to : edge.from;
            const connectedNode = nodesRef.current.get(connectedNodeId);
            if (connectedNode) {
                const connectedNodeType = connectedNode.nodeType || "source";
                nodesRef.current.update({
                    id: connectedNodeId,
                    color: connectedNodeType === "source" ? sourceHighlightColor : targetHighlightColor,
                });
            }
        });
    }, [resetHighlights]);

    const onLayout = useCallback(() => {
        if (networkRef.current) {
            networkRef.current.fit({
                animation: {
                    duration: 300,
                    easingFunction: "easeInOutQuad",
                },
            });
        }
    }, []);

    const handleBack = useCallback(() => {
        navigate("/");
    }, [navigate]);

    useEffect(() => {
        if (!containerRef.current) return;

        const options = {
            physics: {
                enabled: true,
                barnesHut: {
                    theta: 0.2,
                    gravitationalConstant: -30000,
                    centralGravity: 0.2,
                    springLength: 250,
                    springConstant: 0.3,
                    damping: 0.1,
                    avoidOverlap: 0,
                },
                stabilization: {
                    enabled: true,
                    iterations: 1000,
                    updateInterval: 25,
                    onlyDynamicEdges: false,
                    fit: true,
                },
                adaptiveTimestep: true,
            },
            nodes: {
                shape: "dot",
                shadow: {
                    enabled: true,
                    color: "rgba(0,0,0,0.3)",
                    size: 5,
                    x: -5,
                    y: 5,
                },
                font: {
                    face: "arial",
                    align: "center",
                },
            },
            edges: {
                color: { color: "#94a3b8" },
                width: 2,
                smooth: {
                    enabled: true,
                    type: "dynamic",
                },
                shadow: {
                    enabled: true,
                    color: "rgba(0,0,0,0.3)",
                    size: 7,
                    x: -5,
                    y: 5,
                },
            },
            interaction: {
                dragNodes: true,
                selectable: true,
                hover: true,
                tooltipDelay: 10,
            },
            layout: {
                improvedLayout: true,
            },
        };

        const data = {
            nodes: nodesRef.current,
            edges: edgesRef.current,
        };

        networkRef.current = new Network(containerRef.current, data, options);

        networkRef.current.on("click", (params) => {
            if (params.nodes.length > 0) {
                const nodeId = params.nodes[0];
                highlightSelected(nodeId);
            } else {
                resetHighlights();
            }
        });

        networkRef.current.on("stabilizationEnd", () => {
            if (networkRef.current) {
                networkRef.current.fit({
                    animation: {
                        duration: 300,
                        easingFunction: "easeInOutQuad",
                    },
                });
            }
        });

        return () => {
            if (networkRef.current) {
                networkRef.current.destroy();
                networkRef.current = null;
            }
        };
    }, [highlightSelected, resetHighlights]);

    useEffect(() => {
        if (fileId) {
            if (loadedFileIdRef.current === fileId) {
                return;
            }
            loadedFileIdRef.current = null;
            const loadFile = async () => {
                const mergedFile = await getMergedFile(fileId);
                if (mergedFile && mergedFile.data) {
                    try {
                        const { nodes: visNodes, edges: visEdges, nodeMap } = mergedJsonToVisNetwork(mergedFile.data);

                        visNodes.forEach((node) => {
                            node.nodeType = nodeMap.get(node.id) || "source";
                        });

                        nodesRef.current.clear();
                        edgesRef.current.clear();
                        nodesRef.current.add(visNodes);
                        edgesRef.current.add(visEdges);

                        loadedFileIdRef.current = fileId;

                        if (networkRef.current) {
                            networkRef.current.fit({
                                animation: {
                                    duration: 300,
                                    easingFunction: "easeInOutQuad",
                                },
                            });
                        }
                    } catch (error) {
                        console.error("Error loading merged file data:", error);
                        alert("Error loading file. Please try again.");
                        navigate("/");
                    }
                } else {
                    navigate("/");
                }
            };
            loadFile();
        }
    }, [fileId, navigate]);

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
                    background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                    borderBottom: "2px solid rgba(148, 163, 184, 0.2)",
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)",
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
                        background: "linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)",
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
                            e.target.style.background = "rgba(148, 163, 184, 0.25)";
                            e.target.style.borderColor = "rgba(148, 163, 184, 0.5)";
                            e.target.style.transform = "translateY(-1px)";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = "rgba(148, 163, 184, 0.15)";
                            e.target.style.borderColor = "rgba(148, 163, 184, 0.3)";
                            e.target.style.transform = "translateY(0)";
                        }}
                    >
                        <FiArrowLeft size={16} />
                        Back
                    </button>
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
                            e.target.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.3)";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = "rgba(59, 130, 246, 0.15)";
                            e.target.style.borderColor = "rgba(59, 130, 246, 0.3)";
                            e.target.style.transform = "translateY(0)";
                            e.target.style.boxShadow = "0 2px 8px rgba(59, 130, 246, 0.2)";
                        }}
                    >
                        <FiLayout size={16} />
                        Auto-Arrange
                    </button>
                </div>
            </div>

            <div
                ref={containerRef}
                style={{
                    flex: 1,
                    width: "100%",
                    height: "100%",
                    background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                }}
            />
        </div>
    );
};

export default LineageViewer;
