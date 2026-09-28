import { useSignUp } from '@clerk/expo';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export default function SignUpScreen() {
  const { signUp } = useSignUp();
  const router = useRouter();

  const [step, setStep] = useState<'form' | 'verify'>('form');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate() {
    if (!signUp) return;
    setError(null);
    setSubmitting(true);
    try {
      const { error: createError } = await signUp.password({
        emailAddress: email.trim(),
        password,
      });
      if (createError) {
        setError(createError.message);
        return;
      }
      const { error: codeError } = await signUp.verifications.sendEmailCode();
      if (codeError) {
        setError(codeError.message);
        return;
      }
      setStep('verify');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerify() {
    if (!signUp) return;
    setError(null);
    setSubmitting(true);
    try {
      const { error: verifyError } = await signUp.verifications.verifyEmailCode({ code });
      if (verifyError) {
        setError(verifyError.message);
        return;
      }
      if (signUp.status === 'complete') {
        await signUp.finalize();
        router.replace('/(protected)/generate');
      } else {
        setError('Doğrulama tamamlanamadı.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.title}>
          Kayıt ol
        </ThemedText>

        {step === 'form' ? (
          <>
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

            <Pressable onPress={handleCreate} disabled={submitting} style={styles.submit}>
              <ThemedText type="smallBold" style={styles.submitText}>
                {submitting ? 'Gönderiliyor...' : 'Kayıt ol'}
              </ThemedText>
            </Pressable>

            <Link href="/(auth)/sign-in" style={styles.link}>
              <ThemedText themeColor="textSecondary" type="small">
                Zaten hesabın var mı? Giriş yap
              </ThemedText>
            </Link>
          </>
        ) : (
          <>
            <ThemedText themeColor="textSecondary" type="small">
              {email} adresine gönderilen kodu gir.
            </ThemedText>
            <TextInput
              value={code}
              onChangeText={setCode}
              placeholder="Doğrulama kodu"
              keyboardType="number-pad"
              style={styles.input}
            />

            {error && <ThemedText style={styles.error}>{error}</ThemedText>}

            <Pressable onPress={handleVerify} disabled={submitting} style={styles.submit}>
              <ThemedText type="smallBold" style={styles.submitText}>
                {submitting ? 'Doğrulanıyor...' : 'Doğrula'}
              </ThemedText>
            </Pressable>
          </>
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
