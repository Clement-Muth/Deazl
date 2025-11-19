import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Deazl - Compare Prices & Find the Best Deals";
export const size = {
  width: 1200,
  height: 630
};

export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        fontSize: 128,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontFamily: "system-ui"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
        <span style={{ fontSize: "120px", fontWeight: "bold" }}>🛒</span>
      </div>
      <div style={{ fontSize: "80px", fontWeight: "bold", marginBottom: "10px" }}>Deazl</div>
      <div style={{ fontSize: "32px", opacity: 0.9 }}>Compare Prices & Find the Best Deals</div>
    </div>,
    {
      ...size
    }
  );
}
