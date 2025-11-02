import { useCallback, useState } from "react";

/**
 * Custom hook for field highlighting and selection
 * @param {Array} edges - Array of edges
 * @returns {Object} Object containing highlighting state and handlers
 */
export const useFieldHighlighting = (edges) => {
    const [highlightedEdges, setHighlightedEdges] = useState(new Set());
    const [selectedField, setSelectedField] = useState(null);

    // Recursive upstream traversal (dependencies of a field)
    const findUpstreamEdges = useCallback(
        (startField) => {
            const visitedFields = new Set();
            const visitedEdges = new Set();
            const stack = [startField];

            while (stack.length > 0) {
                const current = stack.pop();
                if (visitedFields.has(current)) continue;
                visitedFields.add(current);

                // Traverse edges that *lead into* the current field
                edges.forEach((e) => {
                    if (e.targetHandle === current) {
                        visitedEdges.add(e.id);
                        stack.push(e.sourceHandle);
                    }
                });
            }

            return visitedEdges;
        },
        [edges]
    );

    const handleFieldClick = useCallback(
        (nodeId, fieldName, fieldData) => {
            const fieldId = `${nodeId}-${fieldName}`;
            setHighlightedEdges((prev) => {
                if (prev.size > 0 && prev.has("__root__" + fieldId))
                    return new Set();
                const newEdges = findUpstreamEdges(fieldId);
                newEdges.add("__root__" + fieldId);
                return newEdges;
            });

            if (
                selectedField &&
                selectedField.fieldName === fieldName &&
                selectedField.nodeId === nodeId
            ) {
                setSelectedField(null);
            } else if (fieldData?.calculation) {
                setSelectedField({
                    nodeId,
                    fieldName,
                    calculation: fieldData.calculation.expression,
                });
            } else {
                setSelectedField(null);
            }
        },
        [findUpstreamEdges, selectedField]
    );

    const clearHighlighting = useCallback(() => {
        setHighlightedEdges(new Set());
        setSelectedField(null);
    }, []);

    return {
        highlightedEdges,
        selectedField,
        handleFieldClick,
        setSelectedField,
        setHighlightedEdges,
        clearHighlighting,
    };
};

