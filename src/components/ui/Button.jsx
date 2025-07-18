import React from "react";
export default function Button({ children, ...props }) {
  return (
    <button style={{
      background: "linear-gradient(90deg, #4f8cff 0%, #6be7ff 100%)",
      color: "#fff",
      border: "none",
      borderRadius: "8px",
      padding: "0.8rem 1.5rem",
      fontWeight: 600,
      cursor: "pointer"
    }} {...props}>{children}</button>
  );
}
