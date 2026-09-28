import { STATUS_LABELS, isTerminalStatus, type GenerationRow } from '@mutlu3d/shared';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useApi } from '@/lib/api';

type Mode = 'text' | 'image';

export default function GenerateScreen() {
  const { apiFetch } = useApi();
  const router = useRouter();

  const [mode, setMode] = useState<Mode>('text');
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [generation, setGeneration] = useState<GenerationRow | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  function pollStatus(id: string) {
    stopPolling();
    pollRef.current = setInterval(async () => {
      const res = await apiFetch(`/api/generate/${id}`);
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? 'Durum alınamadı');
        stopPolling();
        return;
      }
      setGeneration(body.generation);
      if (isTerminalStatus(body.generation.status)) {
        stopPolling();
      }
    }, 3000);
  }

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0]);
    }
  }

  async function handleSubmit() {
    setError(null);
    setGeneration(null);
    setSubmitting(true);

    const form = new FormData();
    form.append('mode', mode);
    if (mode === 'text') {
      form.append('prompt', prompt);
    } else if (image) {
      form.append('image', {
        uri: image.uri,
        name: image.fileName ?? 'image.jpg',
        type: image.mimeType ?? 'image/jpeg',
      } as unknown as Blob);
    }

    try {
      const res = await apiFetch('/api/generate', { method: 'POST', body: form });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? 'Üretim başlatılamadı');
        return;
      }
      setGeneration(body.generation);
      pollStatus(body.generation.id);
    } finally {
      setSubmitting(false);
    }
  }

  const isWorking = generation && !isTerminalStatus(generation.status);
  const canSubmit = mode === 'text' ? prompt.trim().length > 0 : !!image;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.modeRow}>
          <Pressable
            onPress={() => setMode('text')}
            style={[styles.modeButton, mode === 'text' && styles.modeButtonActive]}
          >
            <ThemedText type="small" style={mode === 'text' ? styles.modeTextActive : undefined}>
              Metinden
            </ThemedText>
          </Pressable>
          <Pressable
            onPress={() => setMode('image')}
            style={[styles.modeButton, mode === 'image' && styles.modeButtonActive]}
          >
            <ThemedText type="small" style={mode === 'image' ? styles.modeTextActive : undefined}>
              Görselden
            </ThemedText>
          </Pressable>
        </ThemedView>

        {mode === 'text' ? (
          <TextInput
            value={prompt}
            onChangeText={setPrompt}
            placeholder="Örn: ahşap ayaklı vintage deri koltuk"
            multiline
            numberOfLines={3}
            style={styles.input}
          />
        ) : (
          <Pressable onPress={pickImage} style={styles.imagePicker}>
            {image ? (
              <Image source={{ uri: image.uri }} style={styles.imagePreview} />
            ) : (
              <ThemedText themeColor="textSecondary">Görsel seç</ThemedText>
            )}
          </Pressable>
        )}

        <Pressable
          onPress={handleSubmit}
          disabled={submitting || !!isWorking || !canSubmit}
          style={[styles.submit, (submitting || !!isWorking || !canSubmit) && styles.submitDisabled]}
        >
          <ThemedText type="smallBold" style={styles.submitText}>
            {submitting ? 'Başlatılıyor...' : '3D Model Üret'}
          </ThemedText>
        </Pressable>

        {error && <ThemedText style={styles.error}>{error}</ThemedText>}

        {generation && (
          <ThemedView style={styles.statusBlock}>
            <ThemedText themeColor="textSecondary" type="small">
              Durum: {STATUS_LABELS[generation.status] ?? generation.status}
            </ThemedText>

            {generation.status === 'success' && generation.model_url && (
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: '/(protected)/model/[id]',
                    params: {
                      id: generation.id,
                      src: generation.model_url ?? '',
                      alt: generation.prompt ?? '3D model',
                    },
                  })
                }
                style={styles.viewModelButton}
              >
                <ThemedText type="smallBold" style={styles.submitText}>
                  Modeli görüntüle
                </ThemedText>
              </Pressable>
            )}
          </ThemedView>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  modeRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  modeButton: {
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderWidth: 1,
    borderColor: '#d4d4d8',
  },
  modeButtonActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  modeTextActive: {
    color: '#ffffff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d4d4d8',
    borderRadius: Spacing.three,
    padding: Spacing.three,
    minHeight: 96,
    textAlignVertical: 'top',
    fontSize: 16,
  },
  imagePicker: {
    borderWidth: 1,
    borderColor: '#d4d4d8',
    borderRadius: Spacing.three,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  submit: {
    backgroundColor: '#000000',
    borderRadius: 999,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  submitDisabled: {
    opacity: 0.5,
  },
  submitText: {
    color: '#ffffff',
  },
  viewModelButton: {
    backgroundColor: '#000000',
    borderRadius: 999,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    alignSelf: 'flex-start',
  },
  error: {
    color: '#dc2626',
  },
  statusBlock: {
    gap: Spacing.two,
  },
});
