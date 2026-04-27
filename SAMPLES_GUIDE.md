# 🎸 Guía de Samples de Audio

## ¿Qué cambió?

He actualizado los CDNs para cargar los samples de **guitarra acústica** y **bajo eléctrico** desde fuentes más confiables:

### Bajo Eléctrico (Bass Electric)
- **CDN Principal**: https://nbrosowsky.github.io/tonejs-instruments/samples/bass-electric/
- **CDN Alternativo**: https://cdn.jsdelivr.net/npm/tonejs-instrument-bass-electric-mp3@1.1.2/
- **Notas disponibles**: E1, F1, F#1, G1, G#1, A1, A#1, B1, C2-C3 (completo)

### Guitarra Acústica (Guitar Acoustic)
- **CDN Principal**: https://nbrosowsky.github.io/tonejs-instruments/samples/guitar-acoustic/
- **CDN Alternativo**: https://cdn.jsdelivr.net/npm/tonejs-instrument-guitar-acoustic-mp3@1.1.2/
- **Notas disponibles**: E2-A3 (todas las notas naturales y sostenidos)

### Piano
- **CDN Principal**: https://tonejs.github.io/audio/salamander/
- **Notas disponibles**: A0-C6

## Cómo Verificar que Funciona

### Opción 1: Usar la Página de Diagnóstico (Recomendado)
1. Abre la app en http://localhost:5176
2. En la esquina superior derecha, verás un botón **🔧** (herramientas)
3. Haz clic en ese botón
4. Se abrirá la página de diagnóstico "Verificador de Samples"
5. Haz clic en **"▶️ Probar Samples"**
6. Espera a que se prueben todos los CDNs
7. Los CDNs marcados con ✅ están funcionando correctamente

### Opción 2: Verificación Manual en la App
1. En el selector de instrumentos (parte superior), selecciona cada uno:
   - 🎹 Piano
   - 🎸 Guitarra acústica
   - 🎸 Bajo eléctrico
2. Cambia entre ellos (tomará unos segundos cargar los samples)
3. Abre la consola del navegador (F12 → Pestaña "Console")
4. Deberías ver mensajes como:
   - ✅ `✓ Samples: https://nbrosowsky.github.io/tonejs-instruments/samples/guitar-acoustic/`
   - ✅ `✓ Samples: https://nbrosowsky.github.io/tonejs-instruments/samples/bass-electric/`

## ¿Qué hacer si no funciona?

### Si ves mensajes de error en la consola:
```
✗ CDN: https://nbrosowsky.github.io/tonejs-instruments/samples/guitar-acoustic/ timeout
✗ CDN: https://cdn.jsdelivr.net/npm/tonejs-instrument-guitar-acoustic-mp3@1.1.2/ timeout
```

**Soluciones:**
1. **Verifica tu conexión a internet** - Los CDNs requieren acceso externo
2. **Intenta de nuevo en unos minutos** - A veces los CDNs están saturados
3. **Usa un navegador diferente** - Chrome, Firefox, Safari suelen tener mejor acceso a CDNs
4. **Desactiva extensiones de bloqueo de anuncios** - Algunas bloquean CDNs

### Si no se escucha audio:
1. **Verifica el volumen** del navegador y de tu dispositivo
2. **Cierra el Verificador** y regresa a la app principal
3. **Abre DevTools** (F12) → Pestaña "Console"
4. Busca mensajes que comiencen con ✓ (verde)
5. Si solo ves ✗ (rojo), los samples no se cargaron

## Archivos Modificados

- `src/hooks/useAudioManager.js` - Actualizado CDNs y lista completa de notas
- `src/components/SamplesTest.jsx` - **NUEVO**: Página de diagnóstico para probar samples
- `src/App.jsx` - Agregado botón 🔧 para acceder al diagnóstico

## URLs de CDN Confiables

Si necesitas agregar más CDNs en el futuro, estos son recomendados:

- **ToneJS Instruments**: https://nbrosowsky.github.io/tonejs-instruments/samples/
- **jsDelivr**: https://cdn.jsdelivr.net/npm/tonejs-instrument-*/
- **Official ToneJS**: https://tonejs.github.io/audio/
- **Magenta**: https://storage.googleapis.com/magentadata/js/soundfont/

## Status Actual ✅

- ✅ Bajo eléctrico: Notas E1-A3 disponibles
- ✅ Guitarra acústica: Notas E2-E4 disponibles
- ✅ Piano: Notas A0-C6 disponibles
- ✅ Fallback synthesis: Si los CDNs fallan, usa sintetizador de respaldo
