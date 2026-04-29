# 🎵 Sistema de Audio y Pistas Progresivas - Guía Completa

## 📋 Resumen General

MathAudioLab ahora integra un sistema completo de **audio educativo** + **pistas progresivas inteligentes** que ayuda a los estudiantes a entender las operaciones matemáticas a través del sonido.

---

## 🎧 I. Sistema de Audio por Operación Matemática

### 1️⃣ **POTENCIAS (Powers) — Octavas Ascendentes** 🤘

**Banda**: My Chemical Romance (132 BPM)

#### ¿Cómo Suena?
Para **2³** (2 al cubo):
- **Do2** (base, 65 Hz) → **Do3** (130 Hz) → **Do4** (260 Hz) → **Do5** (520 Hz)

Cada nota sube una **octava**, es decir, la frecuencia se **duplica** exactamente.

#### ¿Por Qué Funciona?
- **Exponencial**: 2³ = 2 × 2 × 2
- **Audio**: Cada nota es 2x más aguda = Crecimiento exponencial
- **Percepción**: El niño *siente* la duplicación en el tono

#### Pistas Progresivas
1. Piensa en el número BASE y cuántas veces se multiplica
2. El exponente dice CUÁNTAS VECES multiplicas la base
3. Recuerda: 2³ = 2 × 2 × 2, no 2 + 2 + 2
4. Cuenta los factores: 2 × 2 (dos factores) = 2², 2 × 2 × 2 (tres factores) = 2³

---

### 2️⃣ **DIVISIÓN (Division) — Grupos Rítmicos** 🎵

**Banda**: Los Bunkers (95 BPM)

#### ¿Cómo Suena?
Para **12 ÷ 3 = 4**:
```
Grupo 1: ●  ●  ●  ● [pausa]
Grupo 2: ●  ●  ●  ● [pausa]
Grupo 3: ●  ●  ●  ● [pausa]
```

Escuchas 3 grupos distintos, cada uno con **4 notas idénticas**.

#### ¿Por Qué Funciona?
- **Repartición**: Divides 12 en 3 partes iguales
- **Audio**: Grupos separados = Unidades distintas
- **Percepción**: El niño cuenta y entiende que cada grupo es igual

#### Pistas Progresivas
1. ¿Cuántos números tienes que repartir? (dividendo)
2. ¿En cuántos grupos iguales los repartes? (divisor)
3. ¿Cuántos van en cada grupo? (cociente)
4. Verifica: grupos × notas por grupo = total

---

### 3️⃣ **MULTIPLICACIÓN (Multiplication) — Escala Victoriosa** 💃

**Bandas**: Twice (124 BPM) / Blackpink (108 BPM)

#### ¿Cómo Suena?
Una secuencia **ascendente** victoriosa:
- **Sol2 → Si2 → Re3 → Sol3**

Cada nota sube, representando la **acumulación**.

#### ¿Por Qué Funciona?
- **Repetición**: 5 × 7 = sumar 7 cinco veces
- **Audio**: Notas que suben = Acumulación positiva
- **Percepción**: Sonido "ganador" = Motivación

#### Pistas Progresivas
1. ¿Cuántas veces tienes que repetir el número?
2. Multiplicación es conmutativa: 4 × 6 = 6 × 4 = 24
3. Intenta: primero multiplica los números redondos, luego ajusta
4. Descomposición: 4 × 6 = 4 × 5 + 4 × 1 = 20 + 4 = 24

---

## 🎤 II. Sistema de Pistas Progresivas

### ¿Cómo Funciona?

El sistema da pistas automáticamente si el usuario se tarda **más de 10 segundos** sin responder:

#### Timeline:
1. **0-10 segundos**: Sin pista (el niño intenta resolver)
2. **10 segundos**: **Pista 1** (hint level 1)
   - La foca habla la pista automáticamente
   - La pista aparece en un bubble verde de 6 segundos
3. **20 segundos**: **Pista 2** (más específica)
4. **30 segundos**: **Pista 3** (aún más directa)
5. **40 segundos**: **Pista 4** (casi la solución)

### Cuando el Usuario Contesta Correctamente:
- Todas las pistas se **resetean**
- El sistema comienza a contar nuevamente desde 0

---

## 🗣️ III. La Foca Habla (Text-to-Speech)

### Funcionalidad:
- **Automático**: Cuando aparece una pista, la foca la enuncia en español
- **Manual**: El botón "Escucha a la Foca Explicar" en AudioLegendModal
- **Desactivable**: El usuario puede hacer click para detener

### Voces Disponibles:
- Español (es-ES) por defecto
- Velocidad: 0.9x (ligeramente más lenta para claridad)
- Volumen: 0.7 (para no abrumar)

---

## 📚 IV. AudioLegendModal: Explicación Visual + Audio

### Acceso:
1. Click en la **Foca** (esquina inferior derecha)
2. Click en **"🎵 Cómo Funcionan"** (botón naranja)
3. O en **Settings ⚙️** → **"🎵 Cómo Funcionan los Sonidos"**

### Contenido del Modal:

#### Para cada banda:
- **Concepto**: Qué operación enseña (Potencias, División, etc.)
- **Canción Ejemplo**: La pista de música real
- **BPM**: Pulso rítmico sincronizado
- **Explicación Audio**: Descripción de cómo suena
- **Pista General**: Insight breve
- **Botón Hablar**: "🎤 Escucha a la Foca Explicar"
- **Pistas Progresivas**: 4 pistas en orden creciente de especificidad
- **Pedagógica**: Concepto clave a recordar
- **Resumen Rápido**: Comparación de todas las bandas

---

## 🎯 V. Integración con Modos

### Cambios en ModoPotencias, ModoDivision, ModoEjercicios:

1. **useProgressiveHints Hook**:
   ```javascript
   const { currentHint, resetHints: resetHintsHook } = useProgressiveHints(
     "potencias",  // o "division", "ejercicios"
     null,         // banda (opcional)
     10000         // 10 segundos de espera
   );
   ```

2. **Sincronización con Contexto**:
   ```javascript
   useEffect(() => {
     if (currentHint) updateHint(currentHint);
   }, [currentHint, updateHint]);
   ```

3. **Reset al Acertar**:
   ```javascript
   if (isCorrect) {
     triggerPunch();
     resetHints();        // Contexto
     resetHintsHook();    // Hook
     // ... resto de la lógica
   }
   ```

---

## 🔧 VI. Arquitectura Técnica

### Nuevos Archivos:
- `src/hooks/useTextToSpeech.js` — Web Speech API wrapper
- `src/hooks/useProgressiveHints.js` — Sistema de pistas con timeout
- `src/components/AudioLegendModal.jsx` — Modal educativo
- `src/constants/educationalManual.json` — Contenido pedagógico

### Actualizaciones:
- `src/contexts/MascotaFocaContext.jsx` — Agregado: `currentHint`, `updateHint`, `resetHints`
- `src/components/MascotaFoca.jsx` — Muestra hints, botón AudioLegend, Text-to-Speech
- `src/components/SettingsPanel.jsx` — Botón "Cómo Funcionan los Sonidos"
- Todos los modos — Integración con `useProgressiveHints`

---

## 📱 VII. Experiencia del Usuario (UX)

### Flujo Típico:

1. **Usuario abre ModoPotencias**
   - Ve la pregunta: ¿Cuánto es 2³?
   - Escucha la escala de octavas

2. **Usuario intenta pero se queda pensando**
   - 0-10 segundos: Nada especial
   - 10 segundos: 💡 Pista aparece con sonido: "Piensa en el número BASE..."
   - La foca habla automáticamente

3. **Usuario ve la pista pero sigue dudando**
   - 20 segundos: Segunda pista más específica

4. **Usuario responde correctamente (ej: 8)**
   - Escucha la victoria (escala ascendente)
   - La foca hace punch (animación de celebración)
   - Las pistas se **resetean**

5. **Nueva pregunta**
   - El reloj comienza de nuevo
   - 0-10 segundos sin pistas

---

## 🎓 VIII. Pedagogía

### ¿Por qué este sistema funciona para estudiantes neurodiversos?

1. **Multimodal**:
   - Visual: Interfaz clara, colores por operación
   - Auditivo: Sonidos que representan conceptos
   - Cinético: Feedback inmediato (punch, error filter)

2. **Tempo Adaptado**:
   - Sincronización con bandas reales (MCR, Bunkers, Twice)
   - El ritmo ayuda a la memoria a largo plazo

3. **Progresión Lógica**:
   - Las pistas no son aleatorias
   - Van de lo general a lo específico
   - Permiten al niño construir su propio entendimiento

4. **Motivación Intrínseca**:
   - Sonidos "buenos" para respuestas correctas
   - Sonidos "neutrales" para errores (no punitivos)
   - La foca proporciona aliento y claridad

---

## 🚀 IX. Próximas Mejoras (Roadmap)

- [ ] Análisis de patrones: Si la pista N siempre se necesita, reforzar ese concepto
- [ ] Grabaciones de voz real (en lugar de Text-to-Speech)
- [ ] Adaptación de velocidad de pistas según performance
- [ ] Integración con Firebase para analítica entre estudiantes
- [ ] Soporte para otros idiomas (inglés, portugués)

---

## 📞 X. Troubleshooting

### "No escucho las pistas"
→ Revisa que tu navegador tenga **Web Speech API** habilitada (Chrome, Edge, Firefox)
→ Sube el volumen de tu dispositivo
→ Intenta recargar la página

### "La pista aparece muy rápido/lento"
→ Puedes cambiar el delay en los modos (por ahora está en 10000ms = 10 segundos)
→ Contacta al desarrollador para ajustes

### "Quiero ver todas las pistas"
→ Abre Settings ⚙️ → "🎵 Cómo Funcionan los Sonidos"
→ Allí ves todas las 4 pistas de cada operación

---

## 📖 Resumen Visual

| Operación | Banda | BPM | Sonido | Concepto |
|-----------|-------|-----|--------|----------|
| **Potencias** | MCR | 132 | Octavas ascendentes | Exponencial |
| **División** | Bunkers | 95 | Grupos rítmicos | Repartición |
| **Multiplicación** | Twice | 124 | Escala victoriosa | Acumulación |

---

¡Que disfrutes aprendiendo matemáticas con música! 🎵📐
