# Testing Checklist - MathAudio Lab

**Dev Server**: http://localhost:5176

## Phase 1: Core Functionality
- [ ] **SplashScreen loads** - Orange button appears, Tone.js initializes
- [ ] **All 5 modes appear** in tab navigation:
  - [ ] 📖 Tabla
  - [ ] ✏️ Multiplicar
  - [ ] ⚡ Potencias
  - [ ] 👂 Escuchar
  - [ ] ⚔️ Batalla
- [ ] **Header displays** correctly with Nivel and Mejor Racha

## Phase 2: Mode - Tabla (📖)
- [ ] 10 button grid (1-10) selectable
- [ ] Shows all multiplications 1×1 through 10×10
- [ ] Clicking buttons plays audio
- [ ] "Escuchar tabla" button plays full sequence
- [ ] Colors correspond to table (different color per table)
- [ ] Shows note names (e.g., "Sol", "La", "Si")

## Phase 3: Mode - Multiplicar (✏️)
- [ ] Generates random multiplication question
- [ ] Accepts input and validates
- [ ] Shows correctas/intentos/racha stats
- [ ] Level progression (displays "Nivel 1" through "Nivel 5")
- [ ] Progress bar shows streak toward level-up
- [ ] Victory/error feedback appears
- [ ] Plays sound on correct/incorrect answers
- [ ] Level-up message appears at 8 consecutive correct
- [ ] Tables change per level (Nivel 1: 1-3, Nivel 5: 2-10)

## Phase 4: Mode - Potencias (⚡)
- [ ] 3 level buttons (Nivel 1-3)
- [ ] Shows exponent notation (e.g., 2⁵)
- [ ] Visual expansion (shows 2×2×2×2×2 for exponent 5)
- [ ] Calculates 2^exp, 3^exp, 5^exp correctly
- [ ] "Escalera de octavas" button plays frequency doublings
- [ ] Rock Mode activates at 5-streak
  - [ ] Header turns red (#dc2626)
  - [ ] Background darkens (#1f0808)
  - [ ] "🤘 ROCK MODE ACTIVADO" banner appears
  - [ ] "🤘 ¡ROCK!" message on correct answer
- [ ] Rock Mode deactivates on wrong answer
- [ ] Stats show: Correctas, Intentos, 🤘 ROCK or 🔥 Racha

## Phase 5: Mode - Escuchar (👂)
- [ ] Plays bass beat pattern (multiplication pattern)
- [ ] Generates 4 answer options
- [ ] One option is correct, 3 are wrong
- [ ] Clicking correct option highlights green (#22c55e)
- [ ] Clicking wrong option highlights red (#7f1d1d)
- [ ] Shows precision percentage
- [ ] "🎸 Tocar la pregunta" button replays the audio
- [ ] "Siguiente →" button loads new question

## Phase 6: Mode - Batalla (⚔️)
- [ ] Timer starts at 12 seconds
- [ ] Timer counts down every second
- [ ] Timer color changes: green (>7s) → orange (4-7s) → red (<4s)
- [ ] Displays 3 hearts (❤️) for lives
- [ ] Loses 1 heart per wrong answer or timeout
- [ ] Game Over when lives reach 0
  - [ ] Shows "Batería agotada" message
  - [ ] Shows final score
  - [ ] "Recargar y jugar" button restarts
- [ ] Bonus points awarded: Math.ceil(timeLeft / 4)
- [ ] Input focuses automatically when waiting

## Phase 7: Audio Integration
- [ ] **Instrument selector** works (piano, guitar-acoustic, bass-electric)
- [ ] **Changing instrument** reloads audio samples
- [ ] Instrument changes reflected in all modes
- [ ] All audio plays without errors (check browser console)

## Phase 8: Responsive Design

### Mobile (375px width)
- [ ] Header is readable (not cut off)
- [ ] Buttons are ≥48px tall (easy to tap)
- [ ] Input field accepts text without zoom
- [ ] ResponsiveBassNeck scales down (not cut off right edge)
- [ ] Scrolling works if content exceeds viewport
- [ ] Mode tabs scroll horizontally if needed
- [ ] Stats cards stack nicely (no overlap)
- [ ] Game question is readable
- [ ] Number input for answers is accessible

### Tablet (768px width)
- [ ] Buttons scale appropriately
- [ ] Grid layouts (like Escuchar options) display 2 columns
- [ ] ResponsiveBassNeck fills ~90% width
- [ ] No horizontal scrolling needed
- [ ] Text is readable without zoom

### Desktop (1280px+ width)
- [ ] ResponsiveBassNeck displays at ~580px width max
- [ ] All layouts look proportional
- [ ] Hover states work on buttons (if applicable)
- [ ] No layout shifting when switching modes

## Phase 9: Persistence
- [ ] Refresh page → Nivel is remembered
- [ ] Refresh page → Score/intentos reset (new session)
- [ ] Close tab & reopen → Mejor Racha is remembered
- [ ] Change Nivel → Table selection updates (Nivel 1 shows tables 1-3 only)
- [ ] Session ends → Data saved to localStorage

## Phase 10: Edge Cases
- [ ] Type 0 in Multiplicar → "Era X" feedback appears
- [ ] Type very large number → handled gracefully
- [ ] Very rapid clicking on buttons → no duplicate events
- [ ] Play audio multiple times quickly → audio cuts off/restarts correctly
- [ ] Leave game on halfway through → session data saved on unmount
- [ ] Navigate between modes → previous state resets appropriately
- [ ] Enter wrong answer 3 times in Batalla → game over works

## Phase 11: Browser Console
- [ ] Open DevTools (F12)
- [ ] No red error messages
- [ ] No warnings about missing dependencies
- [ ] Network tab: All assets load (no 404s)
- [ ] Click through all modes → no console errors

## Verification Commands
```bash
# Build production version
npm run build

# Check for TypeScript/syntax issues (if available)
npm run lint

# Restart dev server if needed
npm run dev
```

## Summary Checklist
- [ ] All 5 modes work independently
- [ ] Audio plays in all modes
- [ ] Responsive design works (mobile/tablet/desktop)
- [ ] Data persists across sessions
- [ ] No console errors
- [ ] Rock Mode activates and deactivates correctly
- [ ] Instrument switching works
- [ ] Timer and lives system in Batalla work
- [ ] Level progression in Multiplicar works

**Status**: Ready for user testing
