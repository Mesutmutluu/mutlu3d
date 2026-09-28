# Mutlu 3D

Metinden veya görselden 3D model üreten platform. Next.js 16, Clerk (kimlik doğrulama), Supabase (veritabanı) ve Tripo3D (3D üretim motoru) ile çalışır.

Bu, `mutlu makine/` altındaki npm workspaces monorepo'sunun bir parçası (`apps/web`). Ortak tipler `packages/shared` (`@mutlu3d/shared`) üzerinden gelir ve mobil uygulama (`apps/mobile`) ile paylaşılır.

## Kurulum

1. Bağımlılıklar monorepo kökünden kuruluyor: `mutlu makine/` dizininde `npm install` (tek seferlik, tüm workspace'ler için).
2. `.env.local.example` dosyasını `.env.local` olarak kopyala ve aşağıdaki anahtarları doldur:
   - **Clerk**: [dashboard.clerk.com](https://dashboard.clerk.com) → uygulama oluştur → API Keys
   - **Tripo3D**: [platform.tripo3d.ai](https://platform.tripo3d.ai) → API key oluştur
   - **Supabase**: [supabase.com/dashboard](https://supabase.com/dashboard) → proje oluştur → Project Settings → API (URL ve `service_role` key)
3. Supabase projende SQL Editor'den `supabase/schema.sql` dosyasındaki sorguyu çalıştırarak `generations` tablosunu oluştur.
4. Geliştirme sunucusunu başlat:

```bash
npm run dev
```

`http://localhost:3000` adresinde açılır.

## Windows notu

Bu dizinin yolunda `&` karakteri (`Elif & Ömer`) bulunduğu için `npx next ...` komutları Windows'ta path çözümleme hatası veriyor. Bunun yerine şu komutları kullan (monorepo'da `next` kök `node_modules`'a hoisted olduğu için `apps/web` içinden `../../` ile çağrılır):

```bash
node ../../node_modules/next/dist/bin/next dev
node ../../node_modules/next/dist/bin/next build
node ../../node_modules/next/dist/bin/next typegen
```

`npm run dev` / `npm run build` / `npm run lint` normal şekilde çalışır, sorun sadece doğrudan `npx` çağrılarında.

## Mimari

- `src/app/generate` — metinden/görselden üretim formu (korumalı, giriş gerektirir)
- `src/app/gallery` — kullanıcının geçmiş üretimleri
- `src/app/api/generate` — Tripo3D task oluşturma
- `src/app/api/generate/[taskId]` — Tripo3D task durumu sorgulama (polling)
- `src/lib/tripo.ts` — Tripo3D API istemcisi
- `src/lib/supabase.ts` — Supabase istemcisi
- `src/proxy.ts` — Clerk oturum context'i (Next.js 16'da `middleware.ts` yerine `proxy.ts`)

Sayfa ve API route seviyesinde `auth()` ile yetki kontrolü yapılıyor (Clerk Core 3'te önerilen "resource-based auth" yaklaşımı).
