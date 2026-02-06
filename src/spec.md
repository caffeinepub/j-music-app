# Specification

## Summary
**Goal:** Extend J Music App with an integrated amp-style guitar control panel plus a full in-app composer screen that supports piano-roll/timeline editing and audio file import, while keeping save/load compatible.

**Planned changes:**
- Add an in-app amp-like control panel (amp-style UI) for the guitar audio path with real-time controls: input gain/drive, 3-band EQ, presence, and output/master; include sensible defaults and a one-click reset.
- Add a prominent “Open Composer” action and in-app navigation/state so users can enter/exit the composer without unexpectedly losing unsaved work (prompt on discard).
- Implement a composer screen with a piano-roll editor: add/move/resize/delete notes, scroll/zoom timeline beyond a fixed 16-step view, and ensure playback reflects pitch/timing.
- Add “Import Audio” to the composer using a file picker; communicate supported formats, validate files with English errors, allow preview, and make imported audio participate deterministically in playback (e.g., placed on a timeline region/track or reliably triggered); enforce a reasonable max file size with an English warning.
- Update composition save/load so new composer data (piano-roll/timeline + imported-audio references) is persisted/restored, while older saved compositions still load and missing new fields default safely.

**User-visible outcome:** Users can shape guitar tone with amp-like controls in real time, open a dedicated composer to write melodies in a piano-roll timeline, import/preview an audio file for use in playback, and save/load compositions without breaking older projects.
