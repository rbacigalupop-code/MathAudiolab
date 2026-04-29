# 🎨 Analytics Dashboard - Características Visuales

## Interfaz General

```
┌─────────────────────────────────────────────────────────────┐
│  ⚙️ Settings (esquina superior derecha)                     │
│  ▼                                                           │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Configuración                                            ││
│  ├─────────────────────────────────────────────────────────┤│
│  │ 👤 Perfil Activo                                        ││
│  │ [👨 Cristóbal] [👩 Grace]                              ││
│  │                                                          ││
│  │ ☮️ Zen Mode                                             ││
│  │ [✓ Zen Mode Activo]                                     ││
│  │                                                          ││
│  │ 🔊 Volumen: 70%                                         ││
│  │ [■─────────●─────────]                                  ││
│  │                                                          ││
│  │ ♪ Tempo (BPM): 100                                      ││
│  │ [−] [100] [+]                                           ││
│  │                                                          ││
│  │ [🎵 Cómo Funcionan los Sonidos]                        ││
│  │ [📊 Analytics Dashboard] ← NUEVO                       ││
│  │ [🎸 Band Guide]                                         ││
│  │ [✓ Listo]                                               ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## Panel del Analytics Dashboard

```
┌───────────────────────────────────────────────────────────┐
│                                                            │
│  📊 Analytics Dashboard                              [✕]  │
│                                                            │
├───────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────┬──────────────┬──────────────┬──────────┐│
│  │ Sesiones: 5  │  Intentos:127│ Correctas: 95│ Tasa: 75%││
│  │   📊🔵       │   🎯🔵       │   ✅🟢      │   📈🟠  ││
│  └──────────────┴──────────────┴──────────────┴──────────┘│
│                                                            │
│  [Resumen] [Operaciones] [Operadores] [Historial] [Logros]│
│   (activo)                                                 │
│                                                            │
├───────────────────────────────────────────────────────────┤
│                                                            │
│  📊 Top Operaciones Difíciles (Tasa de Error)            │
│                                                            │
│  7×8   [████████████░░░░░░░░░░░░░░░░░░░░] 85% | 6/7      │
│        ↑ Rojo (muy difícil)                               │
│                                                            │
│  6×9   [███████░░░░░░░░░░░░░░░░░░░░░░░░░░] 75% | 6/8     │
│        ↑ Naranja (difícil)                                │
│                                                            │
│  9×8   [██████░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 60% | 3/5    │
│        ↑ Naranja (moderado)                               │
│                                                            │
│  12÷4  [██░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 20% | 1/5    │
│        ↑ Verde (fácil)                                    │
│                                                            │
│  ... (más operaciones)                                    │
│                                                            │
│  🔢 Rendimiento por Operador                             │
│                                                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │    ×     │  │    ÷     │  │    +     │  │    −     │ │
│  │Multiplic.│  │ División │  │  Sumas   │  │  Restas  │ │
│  │127 inten │  │ 56 inten │  │ 89 inten │  │ 67 inten │ │
│  │   82%    │  │   65%    │  │   90%    │  │   88%    │ │
│  │ ✓104|✗23 │  │ ✓36|✗20  │  │ ✓80|✗9   │  │ ✓59|✗8   │ │
│  │  🟠borde │  │  🟡borde │  │  🟢borde │  │  🟢borde │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │
│                                                            │
│  📅 Historial de Sesiones (Últimas 10)                    │
│                                                            │
│  Fecha   │ Correctas │ Intentos │ Tasa                    │
│  ─────────┼───────────┼──────────┼──────                  │
│  24/04   │     8     │    10    │ 80%  ✅ (Verde)        │
│  23/04   │     7     │     9    │ 78%  ✅ (Verde)        │
│  22/04   │    12     │    15    │ 80%  ✅ (Verde)        │
│  21/04   │     5     │     8    │ 62%  🟡 (Naranja)      │
│  ...     │   ...     │   ...    │ ...                    │
│                                                            │
│  🏆 Logros Desbloqueados                                  │
│                                                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │ 🎸 Rock     │  │ 🔊 Reverb   │  │ 🌊 Wah-Wah  │       │
│  │ Activado    │  │ Reverb      │  │ Wah-Wah     │       │
│  │ (Desbloq.)  │  │ (Falta 15)  │  │ (Falta 35)  │       │
│  │ 5+ racha    │  │ 30+ racha   │  │ 50+ racha   │       │
│  │ 🔲 Activo   │  │ ◻ Bloqueado │  │ ◻ Bloqueado │       │
│  └─────────────┘  └─────────────┘  └─────────────┘       │
│                                                            │
└───────────────────────────────────────────────────────────┘
```

---

## Secciones por Pestaña

### 📊 Resumen (Default)
- 4 estadísticas grandes en grid 2x2
- Gráfico de barras: Top 10 operaciones
- Grid: Rendimiento por operador

**Animaciones:**
- Las barras de error se animan (width) al cargar
- Los operadores tienen entrada escalonada (stagger)

### 📈 Operaciones
- Solo muestra el gráfico de barras (sin tablas)
- Cada barra:
  - Etiqueta: operación (ej: "5×7")
  - Barra: ancho proporcional a tasa de error
  - Porcentaje: "85%"
  - Estadísticas: "6/7" (fallos/intentos)

### 🔢 Operadores
- 4 tarjetas (una por operador)
- Cada tarjeta:
  - Símbolo grande (×, ÷, +, −)
  - Nombre del operador
  - Intento count
  - Porcentaje de éxito (grande)
  - Estadísticas (correctas | incorrectas)
  - Borde coloreado según dificultad

### 📅 Historial
- Tabla scrollable (max 200px altura)
- Columnas: Fecha | Correctas | Intentos | Tasa
- Filas alternadas (alternating color)
- Colores en Tasa: Verde > 70% | Naranja 50-70% | Rojo < 50%

### 🏆 Logros
- Grid 3 columnas
- 3 logros con iconos grandes
- Estado visual (opacidad, borde color)
- Descripción del requisito

---

## Colores del Sistema

### Por Tasa de Error
- **Rojo (#ef4444)**: > 70% error ⚠️ MUY DIFÍCIL
- **Naranja (#f97316)**: 40-70% error 📊 MODERADO
- **Verde (#22c55e)**: < 40% error ✅ RELATIVAMENTE FÁCIL

### Por Operador
- **Rojo**: < 60% éxito
- **Naranja**: 60-80% éxito
- **Azul**: 80-90% éxito
- **Verde**: > 90% éxito

### UI
- **Header**: #f97316 (naranja)
- **Fondo**: #0f172a (azul muy oscuro)
- **Borde modal**: #f97316 (naranja)
- **Botones tabs**: #f97316 activo, #334155 inactivo

---

## Interactividad

### Botones
- **Tab buttons**: Cambiar pestaña visible (animación suave)
- **Close button**: Cerrar modal (✕ en esquina)
- **Overlay**: Click fuera del modal también cierra

### Animaciones (Framer Motion)
- Modal entrada: scale 0.8 → 1 + fade
- Barras: width 0 → 100% (duration 0.6s)
- Operadores: stagger 0.1s entre cada uno
- Logros: scale 0.8 → 1 con delay

### Tabla Historial
- Scrollable si hay > 10 sesiones
- Hover: (opcional) resaltar fila

---

## Responsividad

```
Desktop (> 700px):
┌─────────────────────────────────────────────────────────┐
│ Modal 700x85vh, centrado en pantalla                   │
│ Grid operadores: 4 columnas                            │
│ Tabla: ancho 100% del modal                            │
└─────────────────────────────────────────────────────────┘

Mobile (< 700px):
┌────────────────────┐
│ Modal fullscreen   │
│ Grid operadores:   │
│ 2 columnas (360px) │
│ Tabla: scroll H    │
└────────────────────┘
```

---

## Estados Especiales

### Sin datos
```
"Sin datos de error aún. ¡Sigue practicando!"
"Sin datos de operadores aún."
"Sin sesiones registradas"
```

### Logros incompletos
- Mostrar requisito que falta
- Ejemplo: "🔊 Reverb (Falta 15 de racha)"
- Opacidad 50% para mostrar "desbloqueado próximamente"

---

## Accesibilidad

- ✅ Etiquetas claras en español
- ✅ Colores contrastantes (WCAG AA)
- ✅ Tamaños de fuente legibles (min 10px)
- ✅ Botones clickeables (min 44x44px)
- ✅ Keyboard navigable (future: Tab, Enter, Esc)

---

Made with 🎨 & 📊 for MathAudioLab v2.0
