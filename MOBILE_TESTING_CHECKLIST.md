# 📱 MathAudioLab Mobile Testing Checklist

## Deployment Status
- ✅ Latest commit pushed to GitHub
- ⏳ Vercel automatic deployment in progress...
- **Expected URL:** https://mathaudiolab.vercel.app or https://math-audio-lab.vercel.app

---

## 📱 Pre-Testing Setup

### On Your Mobile Device (iPhone/iPad/Android):
1. Open Safari (iOS) or Chrome (Android)
2. Navigate to your Vercel deployment URL
3. Wait for the app to load (should see SplashScreen first)

---

## 🎯 Test Cases

### 1. MediaPanel Button Visibility ✓
- [ ] See 🎬 button in header (between ⚙️ settings and 🔧 diagnostics)
- [ ] Button is responsive and touchable on mobile
- [ ] Color matches theme (purple accent)

### 2. Modal Opening ✓
- [ ] Tap 🎬 button → modal opens smoothly
- [ ] See "🎬 Multimedia - {Mode Name}" header
- [ ] See close button (✕) in top right
- [ ] Modal has dark overlay backdrop
- [ ] Modal is centered on screen

### 3. Tab Navigation ✓
- [ ] Two tabs visible: "📹 Videos" and "🎵 Música"
- [ ] "📹 Videos" tab is default/active (highlighted)
- [ ] Tapping "🎵 Música" switches tabs smoothly
- [ ] Tapping "📹 Videos" switches back

### 4. Videos Tab Content ✓
#### For Multiplication Mode:
- [ ] YouTube iframe loads without black bars
- [ ] See video: "MULTIPLICACIÓN y DIVISIÓN - Matemáticas para niños"
- [ ] Video can be played (press play button)
- [ ] Below video: two selectable video options:
  - [ ] "1. MULTIPLICACIÓN y DIVISIÓN - Matemáticas para niños"
  - [ ] "2. Aprendiendo a multiplicar - Happy Learning"
- [ ] Clicking other video switches to that video in iframe
- [ ] Border around selected video is purple/active

#### For Division Mode:
- [ ] YouTube iframe shows: "La división - Aprende con los monos"
- [ ] Video options:
  - [ ] "1. La división - Aprende con los monos"
  - [ ] "2. Aprendiendo a dividir - Happy Learning"

#### For Powers Mode:
- [ ] YouTube iframe shows: "Las potencias para niños - Matemáticas"
- [ ] Video options:
  - [ ] "1. Las potencias para niños - Matemáticas"
  - [ ] "2. POTENCIAS Super fácil - Para principiantes"

### 5. Música Tab Content ✓
#### For Multiplication Mode:
- [ ] Spotify Web Player iframe loads
- [ ] Shows "Música para niños - Aprende Matemáticas" playlist
- [ ] Green "Abrir en Spotify →" button appears
- [ ] Button taps open Spotify app or Spotify web

#### For Division Mode:
- [ ] Spotify playlist: "Música para hacer Matemáticas"
- [ ] Spotify player functional

#### For Powers Mode:
- [ ] Spotify playlist: "Música educativa para niños"
- [ ] Spotify player functional

### 6. Mode Switching ✓
- [ ] Switch to different modes (Multiplicación → División → Potencias)
- [ ] 🎬 button updates content when mode changes
- [ ] YouTube videos match current mode
- [ ] Spotify playlists match current mode
- [ ] Modal closes and reopens correctly between modes

### 7. Modal Closing ✓
- [ ] Tap ✕ button → modal closes
- [ ] Tap outside modal (dark overlay) → modal closes
- [ ] Modal reopens when clicking 🎬 again
- [ ] All state resets properly

### 8. Responsive Design (Mobile) ✓
- [ ] Modal fits on screen without excessive scrolling
- [ ] YouTube iframe responsive (no horizontal scroll)
- [ ] Video list fits without overflow
- [ ] Spotify player responsive
- [ ] Buttons are at least 48px × 48px (touch-friendly)
- [ ] Text is readable at mobile font sizes

### 9. Responsive Design (Tablet) ✓
- [ ] Modal centered and appropriately sized
- [ ] All content visible without scrolling
- [ ] Grid layouts work correctly
- [ ] Touch targets remain adequate

### 10. Performance ✓
- [ ] YouTube iframes load within 3 seconds
- [ ] Spotify player loads within 3 seconds
- [ ] No lag when switching tabs
- [ ] Animations smooth (framer-motion)
- [ ] No console errors (F12 → Console)

---

## 🐛 Bug Reports

If you find issues, note:
- [ ] Device type (iPhone 13, iPad, Samsung Galaxy, etc.)
- [ ] iOS/Android version
- [ ] Browser (Safari, Chrome, etc.)
- [ ] URL shown in address bar
- [ ] Steps to reproduce
- [ ] Screenshot or video if possible

### Common Issues & Solutions

| Issue | Possible Cause | Solution |
|-------|---|---|
| YouTube video won't play | Blocked by YouTube embed restrictions | Check browser privacy settings |
| Spotify embed blank | Spotify account not premium | Spotify Web Player requires account |
| Videos not loading | Network issue | Check internet connection, reload page |
| Modal stays open | State sync issue | Close and reopen, or refresh page |
| Wrong videos showing | Mode not updating | Ensure you switched modes before opening modal |

---

## 📊 Verification Checklist

### Before marking as complete:
- [ ] All 10 test cases pass
- [ ] No console errors
- [ ] Works on iOS and Android (if available)
- [ ] Modal responsive on 375px (mobile) to 1024px (tablet) widths
- [ ] YouTube videos play smoothly
- [ ] Spotify Web Player loads without errors

---

## 🚀 Success Criteria

✅ **Testing Complete When:**
1. All above test cases pass on at least ONE mobile device
2. No critical bugs or broken embeds
3. Modal UI is smooth and responsive
4. Video content matches each mode

---

## 📝 Notes

- The app uses **Vercel** for deployment
- Changes auto-deploy when you push to GitHub
- Refresh your browser if you don't see latest version (Ctrl+Shift+R or Cmd+Shift+R)
- Vercel builds take 1-3 minutes after push
