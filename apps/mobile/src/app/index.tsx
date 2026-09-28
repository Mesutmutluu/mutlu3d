import { useAuth } from '@clerk/expo';
import { Link } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export default function HomeScreen() {
  const { isSignedIn } = useAuth();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.title}>
          Metinden veya görselden 3D model üret
        </ThemedText>
        <ThemedText type="subtitle" themeColor="textSecondary" style={styles.subtitle}>
          Tripo3D motoruyla çalışan üretim platformu. Bir açıklama yaz veya bir
          görsel yükle, saniyeler içinde indirilebilir bir 3D model al.
        </ThemedText>

        <Link href={isSignedIn ? '/(protected)/generate' : '/(auth)/sign-in'} asChild>
          <Pressable style={styles.cta}>
            <ThemedText type="smallBold" style={styles.ctaText}>
              Üretmeye başla
            </ThemedText>
          </Pressable>
        </Link>
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  cta: {
    backgroundColor: '#000000',
    borderRadius: 999,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  ctaText: {
    color: '#ffffff',
  },
});
