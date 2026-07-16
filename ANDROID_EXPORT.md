# Garrdashpe 3D - Guía de Exportación a Android

## Requisitos previos
- Node.js 18+
- Android Studio
- JDK 17

## Pasos

### 1. Instalar Capacitor y dependencias Android
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "Garrdashpe 3D" "com.garrdashpe.game3d" --web-dir=out
```

### 2. Configurar export estático
El archivo `next.config.js` ya incluye `output: 'export'`.

### 3. Construir el proyecto web
```bash
npm run build
```

### 4. Añadir plataforma Android y sincronizar
```bash
npx cap add android
npx cap sync
```

### 5. Abrir en Android Studio
```bash
npx cap open android
```

### 6. Generar APK / AAB
Desde Android Studio: **Build > Generate Signed Bundle / APK**.

## Notas
- El `appId` es `com.garrdashpe.game3d` (definido en `capacitor.config.ts`).
- El `webDir` apunta a `out/` (salida de `next build` con export estático).
- Para AdMob real, instala `@capacitor-community/admob` y configura los IDs en `android/app/src/main/AndroidManifest.xml`.
- Para Firebase real, instala `@capacitor-firebase/analytics` y añade `google-services.json`.
