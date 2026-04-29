# 📊 Analytics Dashboard - Guía Completa

## Acceso

**Ubicación:** ⚙️ Settings (esquina superior derecha) → 📊 Analytics Dashboard

---

## Secciones del Dashboard

### 1️⃣ **Resumen (Overview)**
Muestra 4 estadísticas clave:
- **Total Sesiones**: Número de sesiones de práctica registradas
- **Total Intentos**: Cantidad total de problemas intentados
- **Correctas**: Número de respuestas correctas
- **Tasa Global**: Porcentaje de éxito general (correctas ÷ intentos × 100)

**Ejemplo:**
```
📊 Total Sesiones: 5
🎯 Total Intentos: 127
✅ Correctas: 95
📈 Tasa Global: 75%
```

---

### 2️⃣ **Operaciones (Top Difíciles)**
Visualización de las 10 operaciones con mayor tasa de error.

**Formato:**
```
Operación | [Barra de progreso] | Tasa% | Fallos/Intentos
5×7       | ====▓▓▓▓ 60% orange | 60%   | 3/5
12÷3      | ██████ 85% red      | 85%   | 6/7
```

**Códigos de color:**
- 🟢 Verde: < 40% error (relativamente fácil)
- 🟠 Naranja: 40-70% error (moderado)
- 🔴 Rojo: > 70% error (muy difícil)

**Caso de uso:**
Identifica qué operaciones específicas necesitan más práctica.

---

### 3️⃣ **Operadores (Rendimiento por Tipo)**
Compara el rendimiento en cada operación matemática (×, ÷, +, -, ^)

**Tarjeta para cada operador:**
```
┌─────────────┐
│      ×      │
│ Multiplicar │
│  127 inten  │
│    82%      │
│ ✓95 | ✗32  │
└─────────────┘
```

**Métricas:**
- Tasa de éxito (%)
- Correctas vs Incorrectas
- Color del borde indica dificultad

**Caso de uso:**
Saber si hay un tipo de operación que es más difícil (ej: divisiones más duras que sumas).

---

### 4️⃣ **Historial (Session History)**
Tabla de las últimas 10 sesiones de práctica

**Columnas:**
| Fecha  | Correctas | Intentos | Tasa  |
|--------|-----------|----------|-------|
| 24/04  | 8         | 10       | 80%   |
| 23/04  | 12        | 15       | 80%   |
| 22/04  | 5         | 8        | 62%   |

**Código de color en Tasa:**
- 🟢 Verde: > 70%
- 🟠 Naranja: 50-70%
- 🔴 Rojo: < 50%

**Caso de uso:**
Trackear progresión día a día. ¿Mejora o empeora con el tiempo?

---

### 5️⃣ **Logros (Achievements)**
Visualiza qué efectos de audio se han desbloqueado

**Logros disponibles:**
1. **🎸 Rock Activado**
   - Requisito: 5+ racha (streak)
   - Efecto: Distorsión en el audio

2. **🔊 Reverberación**
   - Requisito: 30+ mejor racha
   - Efecto: Reverb en el sonido

3. **🌊 Wah-Wah**
   - Requisito: 50+ mejor racha
   - Efecto: Modulación Wah-Wah

**Visual:**
- ✅ Desbloqueado: Color completo, borde naranja
- 🔒 Bloqueado: Transparencia 50%, borde gris

---

## Cómo Interpretar los Datos

### Ejemplo Completo: Un Alumno
```
OVERVIEW:
- 5 sesiones
- 127 intentos
- 95 correctas
- 75% tasa global ✅ (bien)

OPERACIONES DIFÍCILES:
1. 7×8 - 85% error ⚠️ (muy difícil)
2. 6×9 - 75% error ⚠️ (difícil)
3. 9×7 - 60% error (moderado)

OPERADORES:
- Multiplicación (×): 82% ✅
- División (÷): 65% 📊
- Sumas (+): 90% ✅
- Restas (-): 88% ✅

HISTORIAL:
- 24/04: 80% (muy bien)
- 23/04: 75% (bien)
- 22/04: 62% (mejora necesaria)
→ Tendencia: MEJORANDO ⬆️

LOGROS:
- 🎸 Rock: ✅ Desbloqueado
- 🔊 Reverb: 🔒 Falta 15 de racha
- 🌊 Wah-Wah: 🔒 Falta 35 de racha
```

### Interpretación:
✅ El alumno está mejorando (75% → 80%)
⚠️ Enfocarse en tablas del 7 y 9 (7×8, 6×9)
📊 Divisiones son punto débil relativo
🎸 Ya activó Rock Mode, ¡sigue así!

---

## Caso de Uso: Cristóbal vs Grace

El dashboard es **por perfil**:
1. Si Cristóbal entra → Ve sus analytics
2. Si Grace entra → Ve sus analytics (independientes)

Esto permite:
- Monitorear progreso individualizado
- Identificar patrones por estudiante
- Dar feedback personalizado

---

## Mejoras Futuras

Potenciales expansiones:
- 📈 Gráfico de tendencia (línea temporal)
- 🎯 Objetivos semanales
- 🏆 Ranking entre perfiles
- 📱 Export de datos (CSV/PDF)
- 🤖 Recomendaciones AI basadas en weak points
- 🎵 Correlación: ¿qué instrumento funciona mejor?

---

## Datos Técnicos

### Dónde se almacenan
```javascript
localStorage["__mal_cristobal_v1"] = {
  errorLog: {
    "5×7": { intentos: 5, fallos: 3, rate: 0.6 },
    "12÷3": { intentos: 7, fallos: 6, rate: 0.857 },
    ...
  },
  sesiones: [
    { fecha: "24/04", correctas: 8, intentos: 10 },
    ...
  ],
  unlocked_effects: ["distortion", "reverb"],
  rachaGlobal: 2,
  mejorRacha: 12
}
```

### Qué se trackea automáticamente
- ✅ Cada intento (correcto/incorrecto)
- ✅ Sesiones diarias
- ✅ Racha global (streak)
- ✅ Mejor racha histórica
- ✅ Effects desbloqueados
- ✅ Última vez que se intentó una operación

### Actualización
- En tiempo real (se guarda al final de cada sesión)
- Persistente (no se borra con refresh)
- Por perfil (Cristóbal y Grace independientes)

---

## Preguntas Frecuentes

**P: ¿Por qué mi tasa es baja?**
R: Es normal al principio. La tasa mejora con práctica consistente.

**P: ¿Se resetean los datos?**
R: No, están guardados en localStorage. Solo se borran si limpias cache del navegador.

**P: ¿Cómo subo de nivel?**
R: Cada modo tiene su propio sistema de niveles. El dashboard monitorea weak points para sugerencias.

**P: ¿Puedo exportar mis datos?**
R: Próximamente. Por ahora puedes hacer screenshot del dashboard.

---

Made with 🎸 & 📊 for MathAudioLab v2.0
