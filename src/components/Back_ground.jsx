import React from "react";

export default function Background(props) {
  const { children } = props;
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        background:
          "linear-gradient(135deg, rgba(230,244,255,1) 0%, rgba(245,245,255,1) 100%)",
        padding: "24px 12px",
        boxSizing: "border-box",
      }}
    >
      {children}
    </div>
  );
}


