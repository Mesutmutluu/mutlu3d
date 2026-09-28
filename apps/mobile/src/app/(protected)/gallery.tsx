import { STATUS_LABELS, type GenerationRow } from '@mutlu3d/shared';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useApi } from '@/lib/api';

export default function GalleryScreen() {
  const { apiFetch } = useApi();
  const router = useRouter();
  const [generations, setGenerations] = useState<GenerationRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const res = await apiFetch('/api/generations');
    const body = await res.json();
    if (!res.ok) {
      setError(body.error ?? 'Galeri yüklenemedi');
      return;
    }
    setGenerations(body.generations);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount, not a render loop
    load();
  }, [load]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.heading}>
          Galerim
        </ThemedText>

        {error && <ThemedText themeColor="text">{error}</ThemedText>}

        {generations?.length === 0 && (
          <ThemedText themeColor="textSecondary">Henüz bir model üretmedin.</ThemedText>
        )}

        <FlatList
          data={generations ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              disabled={item.status !== 'success' || !item.model_url}
              onPress={() =>
                router.push({
                  pathname: '/(protected)/model/[id]',
                  params: {
                    id: item.id,
                    src: item.model_url ?? '',
                    alt: item.prompt ?? item.type,
                  },
                })
              }
            >
              <ThemedView type="backgroundElement" style={styles.card}>
                <ThemedText numberOfLines={1}>{item.prompt ?? item.type}</ThemedText>
                <ThemedText themeColor="textSecondary" type="small">
                  {STATUS_LABELS[item.status] ?? item.status} ·{' '}
                  {new Date(item.created_at).toLocaleDateString('tr-TR')}
                </ThemedText>
              </ThemedView>
            </Pressable>
          )}
        />
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
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  heading: {
    fontSize: 28,
    lineHeight: 32,
  },
  list: {
    gap: Spacing.two,
    paddingBottom: Spacing.six,
  },
  card: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.half,
  },
});
