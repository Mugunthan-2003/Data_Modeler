import { useMemo } from "react";

/**
 * Custom hook for filtering and decorating edges
 * @param {Array} edges - Array of edges
 * @param {Set} highlightedEdges - Set of highlighted edge IDs
 * @param {boolean} showNormalRefs - Whether to show normal references
 * @param {boolean} showCalcRefs - Whether to show calculation references
 * @param {boolean} showOnlyHighlighted - Whether to show only highlighted edges
 * @returns {Array} Filtered and decorated edges
 */
export const useEdgeFiltering = (
    edges,
    highlightedEdges,
    showNormalRefs,
    showCalcRefs,
    showOnlyHighlighted
) => {
    const decoratedEdges = useMemo(() => {
        return edges
            .filter((e) => {
                const isHighlighted = highlightedEdges.has(e.id);
                const isCalcEdge = e.ref_type === "calculation";
                if (showOnlyHighlighted) return isHighlighted;
                if (!showNormalRefs && !isCalcEdge) return false;
                if (!showCalcRefs && isCalcEdge) return false;
                return true;
            })
            .map((e) => {
                const isHighlighted = highlightedEdges.has(e.id);
                const isInactive =
                    highlightedEdges.size > 0 && !isHighlighted;
                const baseColor = e.style?.stroke || "#555";
                const baseAnimated = e.animated || false;

                return {
                    ...e,
                    style: {
                        ...e.style,
                        stroke: isInactive ? "#ccc" : baseColor,
                        opacity: isInactive ? 0.4 : 1,
                        // Ensure edges are always visible with minimum stroke width
                        strokeWidth: isInactive ? 2 : (e.style?.strokeWidth || 3),
                    },
                    animated:
                        highlightedEdges.size === 0
                            ? baseAnimated
                            : isHighlighted,
                };
            });
    }, [
        edges,
        highlightedEdges,
        showNormalRefs,
        showCalcRefs,
        showOnlyHighlighted,
    ]);

    return decoratedEdges;
};

