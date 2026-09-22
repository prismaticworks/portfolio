# Vaibhav Kunjir — Portfolio

Personal site for Vaibhav Kunjir, Security Research Engineer.

Static site, no build step. Motion is canvas-based and runs client-side:

- `js/chain.js` — attack chain vs. detection sweep
- `js/radar.js` — defensive threat-surface radar
- `js/scanner.js` — offensive scan matrix
- `js/embers.js` — hero particle drift

## Local preview

```
python3 -m http.server 5600
```

## Portrait

Drop a photo at `assets/portrait.png` and it replaces the placeholder
silhouette automatically — no code change needed.

## Tool marks

Brand marks in the marquee come from [Simple Icons](https://simpleicons.org)
(icons CC0; trademarks belong to their respective owners, used nominatively to
indicate tools worked with).

Vendors with no official mark in that set — CrowdStrike Falcon, SentinelOne,
Nuclei, YARA, Velociraptor — use a glyph for the tool's *category* (EDR console,
scanner, rule language, DFIR) rather than an approximated logo.
