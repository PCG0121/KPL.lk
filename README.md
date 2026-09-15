# Kurunegala Plantations Limited — concept demo

A responsive corporate redesign concept using Next.js App Router, TypeScript, Tailwind CSS 4, Framer Motion and Lucide icons.

## Run locally

```sh
npm install
npm run dev
```

Open http://localhost:3000. On Windows PowerShell with script execution disabled, use `npm.cmd` instead of `npm`.

```sh
npm run typecheck
npm run build
npm start
```

## Demo scope

- All twelve requested sections, sticky navigation and mobile menu.
- Seven selectable estates with a schematic map and live detail panel.
- Scroll reveals, count-up statistics and reduced-motion support.
- Product, report, news and social actions provide demo feedback. No checkout, backend or official report downloads.
- The contact address uses the reserved `.example` domain and must be replaced.
- Estate areas, crop allocations, dates, news and report covers are illustrative. Statistics were supplied in the brief and require client verification.
- The hero uses 16 user-supplied frames hosted locally as optimised WebP assets. Remaining remote Unsplash photographs are temporary illustrative imagery, not representations of actual KPL estates or official product packaging. Google Fonts and Unsplash require internet access.
- Replace the placeholder logo, contact details, imagery and sample content before any public production use.

## Editing

- `app/page.tsx`: content, estate data and interactions.
- `app/globals.css`: design tokens, component styles and responsive breakpoints.
- `app/layout.tsx`: page metadata.

The fixed “Concept Demo – For Evaluation Only” label remains visible throughout the site.

## Scroll-driven plantation hero

Scroll through the pinned hero to move through 16 frames, from a coconut seed to a mature palm and harvest. Scrolling backwards reverses the sequence. Gentle time-based smoothing softens wheel steps. Each image is rendered fully opaque to avoid double edges from crossfading, with at most one draw scheduled per animation frame and no redraw until the selected image or canvas size changes. The renderer pauses offscreen, limits concurrent image requests to three, loads only nearby frames, releases distant decoded images, and caps canvas pixel density. No React state changes occur while scrubbing.

The 16 frames are extracted from a consistently upscaled 4K video, served at 3840 x 2160 on desktop and 1280 x 720 on mobile, encoded at WebP quality 96 and 90 respectively. The sequence totals approximately 18.18 MB on desktop or 2.82 MB on mobile. Canvas rendering supports up to 2× pixel density, limited to 3840 pixels on its longest edge and 8.3 million pixels overall on desktop (2560 pixels / four million on mobile), with high-quality image smoothing. Reduced-motion, data-saving and short landscape viewports use the first frame without the extended pinned scroll. The poster also remains visible if canvas or image loading fails. Hero links let visitors skip straight to the other sections.

Source images are not changed. To regenerate the assets:

```sh
node scripts/prepare-hero-frames.cjs "path/to/source-frame-folder"
```

Run the renderer lifecycle tests with:

```sh
node scripts/test-hero-sequence.cjs
```

These tests simulate scrolling, loading, resizing and cleanup; they are not a substitute for visual testing in a real browser.

The source video is 720p at 24 fps. `output/video/plantation-upscaled-4k.mp4` is a silent 3840 x 2160 copy produced using FFmpeg Lanczos scaling and mild unsharp filtering, not native 4K or AI detail reconstruction. Full-size extracted PNGs are in `output/video/frames`; web assets are in `public/hero-sequence-v6`. Run `node scripts/prepare-upscaled-hero.cjs output/video/frames` to regenerate the web assets.
