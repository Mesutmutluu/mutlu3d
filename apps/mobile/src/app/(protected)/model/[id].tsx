import * as MediaLibrary from 'expo-media-library';
import { useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';

import ModelViewer from '@/components/model-viewer';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export default function ModelDetailScreen() {
  const { src, alt } = useLocalSearchParams<{ id: string; src: string; alt: string }>();
  const viewerRef = useRef<View>(null);
  const [saving, setSaving] = useState(false);

  async function handleSaveToPhotos() {
    setSaving(true);
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('İzin gerekli', 'Fotoğraflara kaydetmek için galeri izni vermelisin.');
        return;
      }
      const uri = await captureRef(viewerRef, { format: 'png', quality: 1 });
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert('Kaydedildi', 'Model görüntüsü Fotoğraflar\'a kaydedildi.');
    } catch {
      Alert.alert('Hata', 'Görüntü kaydedilemedi, tekrar dene.');
    } finally {
      setSaving(false);
    }
  }

  if (!src) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.center}>
          <ThemedText>Model bulunamadı.</ThemedText>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <ModelViewer ref={viewerRef} src={src} alt={alt ?? '3D model'} />
        <Pressable
          onPress={handleSaveToPhotos}
          disabled={saving}
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        >
          <ThemedText type="smallBold" style={styles.saveButtonText}>
            {saving ? 'Kaydediliyor...' : 'Fotoğrafa Kaydet'}
          </ThemedText>
        </Pressable>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    position: 'absolute',
    bottom: Spacing.four,
    alignSelf: 'center',
    backgroundColor: '#000000',
    borderRadius: 999,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.five,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#ffffff',
  },
});
