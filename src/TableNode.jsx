// src/TableNode.jsx
import { memo, useState, useRef, useEffect } from "react";
import { Handle, Position } from "reactflow";

const TableNode = ({ data }) => {
  const bg = data.isViewOrCTE ? "#f0e6ff" : "#fff";
  const border = data.isViewOrCTE ? "2px solid #a855f7" : "1px solid #fff";

  const [openField, setOpenField] = useState(null);

  return (
    <div
      style={{
        background: bg,
        border,
        borderRadius: 6,
        minWidth: 300,
        fontFamily: "Arial, sans-serif",
        boxShadow: "0 2px 6px rgba(0,0,0,.1)",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "#555",
          color: "#fff",
          padding: "4px 8px",
          fontWeight: "bold",
          borderTopLeftRadius: 5,
          borderTopRightRadius: 5,
          fontSize: 13,
        }}
      >
        {data.label}{" "}
        {data.alias && <small style={{ opacity: 0.7 }}>({data.alias})</small>}
      </div>

      {/* Field List */}
      <div style={{ padding: "4px 8px" }}>
        {data.fields.map((f, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 12,
              marginBottom: 3,
              alignItems: "center",
              position: "relative",
              padding: "4px 12px",
              cursor: f.calculation ? "pointer" : "default",
            }}
            onClick={() =>
              setOpenField(openField === f.name ? null : f.name)
            }
          >
            {/* Left Handle (incoming) */}
            <Handle
              type="target"
              position={Position.Left}
              id={`${data.label}-${f.name}`}
              style={{
                background: "#555",
                width: 8,
                height: 8,
                position: "absolute",
                left: -6,
                top: "50%",
                transform: "translateY(-50%)",
              }}
            />

            {/* Field Name */}
            <span
              style={{
                color: f.calculation ? "#333" : "inherit",
                fontWeight: f.calculation ? "500" : "normal",
              }}
            >
              {f.name}
            </span>

            {/* Overlay (calculation expression) */}
            {openField === f.name && f.calculation && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: "10px",
                  background: "#fff",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                  zIndex: 100,
                  whiteSpace: "pre-wrap",
                  maxWidth: "280px",
                  marginTop: "2px",
                }}
              >
                <strong>Calculation:</strong>
                <div
                  style={{
                    marginTop: "4px",
                    color: "#0084ffff",
                    fontWeight: 600,
                  }}
                >
                  {f.calculation.expression}
                </div>
              </div>
            )}

            {/* Right Handle (outgoing) */}
            <Handle
              type="source"
              position={Position.Right}
              id={`${data.label}-${f.name}`}
              style={{
                background: "#555",
                width: 8,
                height: 8,
                position: "absolute",
                right: -6,
                top: "50%",
                transform: "translateY(-50%)",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default memo(TableNode);
