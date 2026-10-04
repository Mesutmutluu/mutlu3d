import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { API_BASE_URL } from '@/lib/config';
import { ThemedText } from '@/components/themed-text';

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
    <script>
      const mv = document.querySelector('model-viewer');
      mv.addEventListener('load', () => window.ReactNativeWebView.postMessage('loaded'));
      mv.addEventListener('error', (e) => window.ReactNativeWebView.postMessage('error:' + (e.detail ? JSON.stringify(e.detail) : '')));
      mv.addEventListener('progress', (e) => window.ReactNativeWebView.postMessage('progress:' + Math.round((e.detail.totalProgress ?? 0) * 100)));
    </script>
  </body>
</html>`;
}

export default function ModelViewer({ src, alt }: { src: string; alt: string }) {
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const proxiedSrc = src.startsWith('http')
    ? `${API_BASE_URL}/api/proxy-model?url=${encodeURIComponent(src)}`
    : src;

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={['*']}
        source={{ html: buildHtml(proxiedSrc, alt) }}
        javaScriptEnabled
        domStorageEnabled
        style={{ backgroundColor: 'transparent' }}
        onMessage={(event) => {
          const data = event.nativeEvent.data;
          if (data === 'loaded') {
            setLoaded(true);
          } else if (data.startsWith('progress:')) {
            setProgress(Number(data.split(':')[1]) || 0);
          } else if (data.startsWith('error:')) {
            setLoadError(data.slice('error:'.length) || 'Model yüklenemedi');
          }
        }}
      />
      {!loaded && (
        <View style={styles.overlay} pointerEvents="none">
          <ActivityIndicator size="large" />
          <ThemedText type="small" style={styles.overlayText}>
            {loadError ? 'Model yüklenemedi' : `Model yükleniyor... %${progress}`}
          </ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  overlayText: {
    marginTop: 8,
  },
});
