# Quiet Mahjong

An ad-free, phone-friendly tile puzzle built with a small static web app. An independent prototype inspired by straight-line tile matching, with original presentation.

## Play

- Tap identical tiles in the same row or column with a clear path to remove them.
- Drag tiles horizontally or vertically. Tiles ahead push together into available space, within the board edges.
- Matching moved tiles clear automatically. If no match results, the entire group returns to its starting positions.
- New games contain 72 shuffled tiles. No hints, undo, timers, advertising, or external dependencies.
- The current board saves in the browser's local storage.

## Run locally

```sh
python3 -m http.server 8765
```

Open http://localhost:8765 in a browser. For permanent phone access, publish `index.html` with a static website host. The development tunnel is temporary. The web app includes a manifest and service worker for home-screen installation and offline play after the first successful online load. Wait for “Ready for offline play” before disconnecting. Browser storage removal or eviction can remove downloaded data.

## Validation

```sh
node test.cjs
```

Tests cover matching, group pushing, snap-back, boundaries, and tile distribution. Browser play checks verified dragging in both directions and clearing a pair after pushing a buried tile.

## Current limitations

Random boards are not guaranteed solvable. The prototype does not reproduce every rule or feature of Big Cake's Daily Mahjong Match. Existing saved boards retain their size; choose New game for a 72-tile board.
