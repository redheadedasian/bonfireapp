# Ink Brush-Stroke Frame — 9-Slice Asset Kit

## What's inside

| File | Size (px) | viewBox | preserveAspectRatio |
|---|---|---|---|
| `corner-tl.svg` | 150 × 150 | `0 0 150 150` | `xMidYMid meet` |
| `corner-tr.svg` | 150 × 150 | `0 0 150 150` | `xMidYMid meet` |
| `corner-bl.svg` | 150 × 150 | `0 0 150 150` | `xMidYMid meet` |
| `corner-br.svg` | 150 × 150 | `0 0 150 150` | `xMidYMid meet` |
| `rail-top.svg` | 737 × 150 | `0 0 737 150` | `none` (stretch) |
| `rail-bottom.svg` | 737 × 150 | `0 0 737 150` | `none` (stretch) |
| `rail-left.svg` | 150 × 409 | `0 0 150 409` | `none` (stretch) |
| `rail-right.svg` | 150 × 409 | `0 0 150 409` | `none` (stretch) |

Same packaging approach as the ornate gold frame: each `.svg` is a thin `viewBox`/`<image>`
wrapper around an alpha-transparent PNG crop, not traced vector paths — a hand-inked brush
stroke is pure organic shading, so tracing it into flat `<path>` fills would turn the soft
ink edges into hard, lifeless shapes. This wrapper still gives you a proper scalable
container with `preserveAspectRatio` control and a single drop-in file per slice.

One difference from the gold frame worth knowing: **this source PNG already had a real
alpha channel** (no white background to key out), so these crops are a direct 1:1 slice
of your original artwork with zero re-processing of the ink itself — pixel-for-pixel
identical to the source where they overlap.

## Slice geometry

Source art is 1037 × 709 px (the outer `<svg>` you gave me just adds a few px of canvas
margin around it). This is a hand-drawn stroke, not a repeating ornamental motif, so
there's no sharp line between "corner ornament" and "straight edge" the way the gold
frame had — I picked **150 px** as the corner size by checking where each corner's ink
blob (the overlap where the two strokes meet, plus its immediate spatter) finishes and a
clean, mostly-empty margin begins, then used that same 150 px for all four corners so
the rails line up. Core stroke thickness on the straight runs is much thinner
(~25–30 px) — the rest of each 150 px slice is transparent padding, which is expected
and is what keeps the corner/rail seam invisible.

I verified this by recompositing all 8 slices back into the full frame — it's byte-for-byte
identical to your source PNG (zero pixel difference).

## A note on stretching hand-drawn rails

Because the brush stroke has natural thickness variation and a few loose ink spatter
marks, non-uniform stretching (`preserveAspectRatio="none"`) will space those spatter
marks farther apart at larger frame sizes rather than duplicating them — this reads fine
for moderate resizing but will look thin/sparse if you stretch the rails a lot (e.g. a
very wide top edge on a very short frame). If you end up needing the frame at
dramatically different aspect ratios, a tiled/repeating rail (instead of stretched) would
preserve the ink density better — happy to cut a seamlessly-tileable repeat unit instead
if that's a better fit for Bonfire's layouts.

## Usage

Identical CSS Grid pattern to the gold frame kit — just swap the slice sizes:

```css
.frame {
  display: grid;
  grid-template-columns: 150px 1fr 150px;
  grid-template-rows: 150px 1fr 150px;
}
.frame > img { width: 100%; height: 100%; display: block; }
.corner-tl { grid-column: 1; grid-row: 1; }
.corner-tr { grid-column: 3; grid-row: 1; }
.corner-bl { grid-column: 1; grid-row: 3; }
.corner-br { grid-column: 3; grid-row: 3; }
.rail-top    { grid-column: 2; grid-row: 1; }
.rail-bottom { grid-column: 2; grid-row: 3; }
.rail-left   { grid-column: 1; grid-row: 2; }
.rail-right  { grid-column: 3; grid-row: 2; }
.content     { grid-column: 2; grid-row: 2; }
```

`demo.html` is a live, resizable example — drag the frame's resize handle to see the
rails stretch.
