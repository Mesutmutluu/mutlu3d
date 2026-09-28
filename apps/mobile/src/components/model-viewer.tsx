import { WebView } from 'react-native-webview';

import { API_BASE_URL } from '@/lib/config';

function buildHtml(src: string, alt: string): string {
  const safeSrc = JSON.stringify(src);
  const safeAlt = JSON.stringify(alt);

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
    <script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/4.3.1/model-viewer.min.js"></script>
    <style>
      html, body { margin: 0; padding: 0; width: 100%; height: 100%; background: transparent; }
      model-viewer { width: 100%; height: 100%; }
    </style>
  </head>
  <body>
    <model-viewer src=${safeSrc} alt=${safeAlt} camera-controls auto-rotate exposure="1"></model-viewer>
  </body>
</html>`;
}

export default function ModelViewer({ src, alt }: { src: string; alt: string }) {
  const proxiedSrc = src.startsWith('http')
    ? `${API_BASE_URL}/api/proxy-model?url=${encodeURIComponent(src)}`
    : src;

  return (
    <WebView
      originWhitelist={['*']}
      source={{ html: buildHtml(proxiedSrc, alt) }}
      javaScriptEnabled
      domStorageEnabled
      style={{ backgroundColor: 'transparent' }}
    />
  );
}
