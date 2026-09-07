import { ImageResponse } from "next/og";

export const size = { width: 192, height: 192 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#070908",
          color: "#d4ff3a",
          fontSize: 88,
          fontWeight: 700,
        }}
      >
        PH
      </div>
    ),
    size,
  );
}
