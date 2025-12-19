import { useEffect, useRef, useCallback, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Network } from "vis-network";
import "vis-network/styles/vis-network.min.css";
import { mergedJsonToVisNetwork } from "../utils/ConsolidatedView/mergedToVisNetwork";
import { getMergedFile } from "../utils/ControlPage/fileStorage";
import Header from "../components/ConsolidatedView/Header";
import Minimap from "../components/ConsolidatedView/Minimap";
import ZoomControls from "../components/ConsolidatedView/ZoomControls";

function ConsolidatedView() {
    const { fileId } = useParams();
    const navigate = useNavigate();
    const networkRef = useRef(null);
    const containerRef = useRef(null);
    const [currentNodes, setCurrentNodes] = useState([]);
    const [currentEdges, setCurrentEdges] = useState([]);

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
                setCurrentNodes(JSON.parse(JSON.stringify(nodes)));
                setCurrentEdges(JSON.parse(JSON.stringify(edges)));

                const resetHighlighting = () => {
                    const positions = networkRef.current.getPositions();
                    const nodesWithPositions = originalNodes.map((node) => ({
                        ...node,
                        x: positions[node.id]?.x,
                        y: positions[node.id]?.y,
                        fixed: true,
                    }));

                    setCurrentNodes(JSON.parse(JSON.stringify(nodesWithPositions)));
                    setCurrentEdges(JSON.parse(JSON.stringify(originalEdges)));

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

                    setCurrentNodes(JSON.parse(JSON.stringify(updatedNodes)));
                    setCurrentEdges(JSON.parse(JSON.stringify(updatedEdges)));

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

                networkRef.current.once("stabilizationIterationsDone", () => {
                    if (networkRef.current) {
                        networkRef.current.setOptions({ physics: false });
                        physicsDisabled = true;
                    }
                });
            }

            return () => {
                if (networkRef.current) {
                    networkRef.current.destroy();
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
            <Header onBack={handleBack} />
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
                <Minimap
                    networkRef={networkRef}
                    currentNodes={currentNodes}
                    currentEdges={currentEdges}
                />
                <ZoomControls
                    onZoomIn={handleZoomIn}
                    onZoomOut={handleZoomOut}
                    onFitView={handleFitView}
                />
            </div>
        </div>
    );
}

export default ConsolidatedView;
