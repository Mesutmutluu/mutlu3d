import { useSignIn } from '@clerk/expo';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export default function SignInScreen() {
  const { signIn } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSignIn() {
    if (!signIn) return;
    setError(null);
    setSubmitting(true);
    try {
      const { error: signInError } = await signIn.password({
        identifier: email.trim(),
        password,
      });
      if (signInError) {
        setError(signInError.message);
        return;
      }
      if (signIn.status === 'complete') {
        await signIn.finalize();
        router.replace('/(protected)/generate');
      } else {
        setError('Giriş tamamlanamadı, bilgilerini kontrol et.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.title}>
          Giriş yap
        </ThemedText>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="E-posta"
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Şifre"
          secureTextEntry
          style={styles.input}
        />

        {error && <ThemedText style={styles.error}>{error}</ThemedText>}

        <Pressable onPress={handleSignIn} disabled={submitting} style={styles.submit}>
          <ThemedText type="smallBold" style={styles.submitText}>
            {submitting ? 'Giriş yapılıyor...' : 'Giriş yap'}
          </ThemedText>
        </Pressable>

        <Link href="/(auth)/sign-up" style={styles.link}>
          <ThemedText themeColor="textSecondary" type="small">
            Hesabın yok mu? Kayıt ol
          </ThemedText>
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
    justifyContent: 'center',
    padding: Spacing.four,
    gap: Spacing.three,
  },
  title: {
    fontSize: 28,
    lineHeight: 32,
    marginBottom: Spacing.two,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d4d4d8',
    borderRadius: Spacing.three,
    padding: Spacing.three,
    fontSize: 16,
  },
  submit: {
    backgroundColor: '#000000',
    borderRadius: 999,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  submitText: {
    color: '#ffffff',
  },
  error: {
    color: '#dc2626',
  },
  link: {
    alignSelf: 'center',
    marginTop: Spacing.three,
  },
});
