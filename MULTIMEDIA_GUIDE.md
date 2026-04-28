# 📚 MathAudioLab Multimedia Content Guide

## Overview
This guide documents all the educational YouTube videos and Spotify playlists integrated into MathAudioLab for each learning mode.

---

## 🎯 Multiplication Mode (Multiplicación)

### YouTube Videos

| # | Title | Video ID | Link | Source |
|---|-------|----------|------|--------|
| 1 | MULTIPLICACIÓN y DIVISIÓN - Matemáticas para niños | `3QPpyuNycQI` | [Watch](https://www.youtube.com/watch?v=3QPpyuNycQI) | Compilation video |
| 2 | Aprendiendo a multiplicar. La Multiplicación \| Happy Learning | `YFtEaVw5k1A` | [Watch](https://www.youtube.com/watch?v=YFtEaVw5k1A) | Happy Learning - Educational videos for children |

### 🎵 Spotify Playlist
- **Name:** Música para niños - Aprende Matemáticas
- **Playlist ID:** `6bx2DXYetqJT0mf748kEUe`
- **URL:** https://open.spotify.com/playlist/6bx2DXYetqJT0mf748kEUe
- **Description:** Educational music for children learning mathematics
- **Open in Spotify:** https://open.spotify.com/playlist/6bx2DXYetqJT0mf748kEUe?utm_source=generator

---

## ➗ Division Mode (División)

### YouTube Videos

| # | Title | Video ID | Link | Source |
|---|-------|----------|------|--------|
| 1 | La división - Aprende a dividir con nuestros amigos los monos | `zF4GYIbSMzg` | [Watch](https://www.youtube.com/watch?v=zF4GYIbSMzg) | Educational video for children |
| 2 | APRENDIENDO A DIVIDIR. LA DIVISIÓN \| Videos Educativos para Niños | `iA0fP4tL67s` | [Watch](https://www.youtube.com/watch?v=iA0fP4tL67s) | Happy Learning - Educational content |

### 🎵 Spotify Playlist
- **Name:** Música para hacer Matemáticas
- **Playlist ID:** `2itdA3rmYpuqo1bcJR24x7`
- **URL:** https://open.spotify.com/playlist/2itdA3rmYpuqo1bcJR24x7
- **Description:** Music for studying and learning mathematics
- **Open in Spotify:** https://open.spotify.com/playlist/2itdA3rmYpuqo1bcJR24x7?utm_source=generator

---

## ⚡ Powers Mode (Potencias)

### YouTube Videos

| # | Title | Video ID | Link | Source |
|---|-------|----------|------|--------|
| 1 | Las potencias para niños - Matemáticas para niños | `loEjcsaXh2Y` | [Watch](https://www.youtube.com/watch?v=loEjcsaXh2Y) | Educational video for children |
| 2 | POTENCIAS Super fácil - Para principiantes | `-K0ZSm9lPeY` | [Watch](https://www.youtube.com/watch?v=-K0ZSm9lPeY) | Easy explanation for beginners |

### 🎵 Spotify Playlist
- **Name:** Música educativa para niños
- **Playlist ID:** `2BhCL66fcE7KgwnNhmMrQs`
- **URL:** https://open.spotify.com/playlist/2BhCL66fcE7KgwnNhmMrQs
- **Description:** Educational music for children learning various subjects
- **Open in Spotify:** https://open.spotify.com/playlist/2BhCL66fcE7KgwnNhmMrQs?utm_source=generator

---

## 🔧 How to Update Content

### If you want to change YouTube videos:
1. Go to https://www.youtube.com and search for educational math content
2. Copy the Video ID from the URL (e.g., from `https://www.youtube.com/watch?v=VIDEO_ID`, copy `VIDEO_ID`)
3. Update the `MEDIA_CONTENT` object in `src/components/MediaPanel.jsx`

### If you want to change Spotify playlists:
1. Go to https://www.spotify.com
2. Find a math-related playlist
3. Click **Share** → **Copy Spotify URI** (format: `spotify:playlist:PLAYLIST_ID`)
4. Extract the PLAYLIST_ID and update the URL in `MEDIA_CONTENT`

### If you want to add more videos per mode:
1. Add more objects to the `videos` array in `MEDIA_CONTENT`
2. Format: `{ title: "Video Title", id: "VIDEO_ID" }`

---

## ✅ Integration Status

- [x] Multiplication videos integrated
- [x] Division videos integrated
- [x] Powers videos integrated
- [x] Spotify playlists integrated
- [ ] Test on mobile devices (next step)
- [ ] Verify all embeds load correctly
- [ ] Check Spotify embed permissions

---

## 📱 Testing

To test the multimedia panel:
1. Open MathAudioLab on desktop or mobile
2. Click the 🎬 button in the header
3. Click the **📹 Videos** tab to view YouTube content
4. Click the **🎵 Música** tab to view Spotify playlists
5. Test video selection dropdown
6. Test "Abrir en Spotify" button

---

## 🌐 Sources

### YouTube Educational Channels
- Happy Learning: https://www.youtube.com/watch?v=YFtEaVw5k1A
- Math Education Videos: Various educational creators

### Spotify Playlists
- [Música para niños - Aprende Matemáticas](https://open.spotify.com/playlist/6bx2DXYetqJT0mf748kEUe)
- [Música para hacer Matemáticas](https://open.spotify.com/playlist/2itdA3rmYpuqo1bcJR24x7)
- [Música educativa para niños](https://open.spotify.com/playlist/2BhCL66fcE7KgwnNhmMrQs)

---

## 📝 Notes

- YouTube embeds use iframes with `allowFullScreen` enabled
- Spotify embeds use Web Player embed URLs with `?utm_source=generator` parameter
- All content is educational and age-appropriate for children
- Videos are in Spanish to match the app's language setting
