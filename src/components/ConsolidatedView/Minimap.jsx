import { useRef, useEffect } from "react";
import { Network } from "vis-network";

function Minimap({ networkRef, currentNodes, currentEdges }) {
    const minimapRef = useRef(null);
    const minimapNetworkRef = useRef(null);

    useEffect(() => {
        const updateMinimap = () => {
            if (
                minimapRef.current &&
                networkRef.current &&
                currentNodes.length > 0
            ) {
                if (minimapNetworkRef.current) {
                    minimapNetworkRef.current.destroy();
                }

                const positions = networkRef.current.getPositions();
                const nodesWithPositions = currentNodes.map((node) => ({
                    ...node,
                    x: positions[node.id]?.x,
                    y: positions[node.id]?.y,
                    fixed: true,
                }));

                const minimapData = {
                    nodes: nodesWithPositions,
                    edges: currentEdges,
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

        const network = networkRef.current;
        if (network) {
            network.on("stabilizationIterationsDone", updateMinimap);
            network.on("stabilizationEnd", updateMinimap);
        }

        const timeoutId = setTimeout(() => {
            updateMinimap();
        }, 50);

        return () => {
            clearTimeout(timeoutId);
            if (minimapNetworkRef.current) {
                minimapNetworkRef.current.destroy();
            }
            if (network) {
                network.off("stabilizationIterationsDone", updateMinimap);
                network.off("stabilizationEnd", updateMinimap);
            }
        };
    }, [networkRef, currentNodes, currentEdges]);

    return (
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
    );
}

export default Minimap;

