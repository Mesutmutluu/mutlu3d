"use client";

import { useEffect } from "react";

declare module "react" {
  // eslint-disable-next-line @typescript-eslint/no-namespace -- required to augment the JSX IntrinsicElements map
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          alt?: string;
          "camera-controls"?: boolean;
          "auto-rotate"?: boolean;
          exposure?: string;
          ar?: boolean;
        },
        HTMLElement
      >;
    }
  }
}

export default function ModelViewer({ src, alt }: { src: string; alt: string }) {
  useEffect(() => {
    import("@google/model-viewer");
  }, []);

  const proxiedSrc = src.startsWith("http")
    ? `/api/proxy-model?url=${encodeURIComponent(src)}`
    : src;

  return (
    <model-viewer
      src={proxiedSrc}
      alt={alt}
      camera-controls
      auto-rotate
      exposure="1"
      ar
      style={{ width: "100%", height: "100%", background: "transparent" }}
    />
  );
}
