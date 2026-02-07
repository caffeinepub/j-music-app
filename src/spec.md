# Specification

## Summary
**Goal:** Add in-app video (camera) and audio (mic) recording to the UI, allow downloads (video + MP3), update the header to use a logo image, and add basic SEO metadata for indexing readiness.

**Planned changes:**
- Add a prominent Camera button on the main page that requests permission, shows a live in-app preview, supports start/stop recording, and provides a playback preview plus a download/save action.
- Add camera recorder options: front/back switch (when available), a High/Medium/Low quality selector, and a pre-recording audio on/off toggle with graceful fallback for unsupported options.
- Add a mic icon button at the end/bottom of the main page that opens an in-app audio recorder with permission handling and start/pause/resume/stop controls.
- Enable downloading completed audio recordings as MP3 (with error handling and a safe alternative if MP3 encoding fails without losing the recording).
- Replace the current letter-based header mark with a static logo image shown across main screens (with English alt text).
- Add basic SEO metadata in English in the HTML head: title, meta description, and Open Graph title/description tags.

**User-visible outcome:** Users can record video from their device camera with selectable options and download the result, record microphone audio with pause/resume and download it as an MP3, see a logo in the header, and the site includes basic metadata suitable for search/index previews.
