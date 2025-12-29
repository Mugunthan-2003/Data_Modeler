import { useEffect } from "react";
import { useReactFlow } from "reactflow";

function FitViewHelper({ onFitView, onCenterNode }) {
    const { fitView, getNode, setCenter, getZoom } = useReactFlow();

    useEffect(() => {
        const timer = setTimeout(() => {
            fitView({ padding: 0.1, duration: 0 });
        }, 100);
        return () => clearTimeout(timer);
    }, [fitView]);

    useEffect(() => {
        if (onFitView) {
            onFitView(() => {
                fitView({ padding: 0.1, duration: 300 });
            });
        }
    }, [fitView, onFitView]);

    useEffect(() => {
        if (onCenterNode) {
            onCenterNode((nodeId, position) => {
                const node = getNode(nodeId);
                if (node) {
                    const zoom = getZoom();
                    const nodeWidth = 380;
                    const nodeHeight = 200;
                    const centerX = node.position.x + nodeWidth / 2;
                    const centerY = node.position.y + nodeHeight / 2;
                    setCenter(centerX, centerY, { duration: 400, zoom });
                } else if (position) {
                    const nodeWidth = 380;
                    const nodeHeight = 200;
                    const centerX = position.x + nodeWidth / 2;
                    const centerY = position.y + nodeHeight / 2;
                    setCenter(centerX, centerY, { duration: 400 });
                }
            });
        }
    }, [getNode, setCenter, getZoom, onCenterNode]);

    return null;
}

export default FitViewHelper;

