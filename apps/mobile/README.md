# Mutlu 3D — Mobil Uygulama

Expo (React Native) ile yazılmış native mobil uygulama. `mutlu makine/` monorepo'sunun bir parçası (`apps/mobile`); `apps/web`'deki aynı Next.js API'lerini (Tripo3D + Supabase üretim akışı) kullanır, kendi backend'i yoktur.

## Kurulum

1. Bağımlılıklar monorepo kökünden kuruluyor: `mutlu makine/` dizininde `npm install`.
2. `.env.example` dosyasını `.env` olarak kopyala ve doldur:
   - `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` — web ile **aynı** Clerk uygulamasının publishable key'i (dashboard.clerk.com)
   - `EXPO_PUBLIC_API_BASE_URL` — lokal geliştirmede `http://<bilgisayarının-LAN-IP'si>:3000` (telefon aynı Wi-Fi'de olmalı — `ipconfig` ile IP'yi bul), prod'da Vercel deploy URL'i
3. Bu native modüller (`react-native-webview`, `@clerk/expo`'nun SecureStore plugin'i) içerdiği için **Expo Go yetmez** — bir development build gerekir:

```bash
node ../../node_modules/expo/bin/cli install expo-dev-client   # zaten kurulu
node ../../node_modules/eas-cli/bin/run build:configure         # (eas-cli kurulunca)
```

## Geliştirme

Önce `apps/web`'de `npm run dev` çalışıyor olmalı (mobil, backend olarak buna bağlanır). Sonra:

```bash
node ../../node_modules/expo/bin/cli start
```

## Windows notu

Bu monorepo `Elif & Ömer` klasöründe olduğu için `&` karakteri `npx`'i bozuyor (bkz. `apps/web/README.md`). Bu yüzden `npx expo ...` / `npx eas ...` yerine hoisted binary'yi doğrudan çağır:

```bash
node ../../node_modules/expo/bin/cli start
node ../../node_modules/expo/bin/cli install <paket>
```

## Mimari

- `src/app/_layout.tsx` — `ClerkProvider` + kök `Stack`
- `src/app/(auth)/sign-in.tsx`, `sign-up.tsx` — `@clerk/expo`'nun signal tabanlı `useSignIn`/`useSignUp` API'si (`signIn.password()` → `signIn.finalize()`; kayıtta e-posta kodu doğrulama adımı var)
- `src/app/(protected)/_layout.tsx` — `useAuth()` ile auth gate, giriş yoksa `/(auth)/sign-in`'e yönlendirir
- `src/app/(protected)/generate.tsx` — metin/görsel modu, `apps/web`'in `/api/generate` + `/api/generate/[taskId]` route'larına Bearer token ile istek atar, polling ile durumu izler
- `src/app/(protected)/gallery.tsx` — `apps/web`'in `GET /api/generations`'ından geçmiş üretimleri listeler
- `src/components/model-viewer.tsx` — `react-native-webview` içinde CDN'den yüklenen `<model-viewer>` web component'i (native 3D renderer yerine, gesture/görsel parity için)
- `src/lib/api.ts` — Clerk session token'ını `Authorization: Bearer` header'ı olarak ekleyen fetch wrapper'ı
- `@mutlu3d/shared` (`packages/shared`) — `GenerationRow`, `STATUS_LABELS`, `isTerminalStatus()` — web ile ortak

Detaylı plan: `C:\Users\Elif & Ömer\.claude\plans\groovy-juggling-cupcake.md`
