# About section: transition decisions (saved 2026-10-12, not built yet)

Context: About is a single terminal window (`developer.sh`) with a prompt bar at the
bottom. Enter (keyboard) or tap (touch) runs the prompt, which should trigger the sphere
transition. (It originally had a second `personal.log` tab; removed 2026-10-13.)

## Answered

### Developer tab → sphere transition
1. Enter plays the existing particle sequence (particles gather into the sphere, then the
   projects scene). YES.
2. The terminal window dissolves into particles that become the sphere. YES.
3. Particles stay hidden during About, and appear only when Enter is pressed.
4. Clean mode: Randel is considering REMOVING it. Particles/immersive becomes the only
   experience. (So the transition does not need a "light Clean" variant. Confirm before
   deleting the mode toggle, since Clean is also the fallback for low-power/no-WebGL.)
5. Scrolling past About also triggers the transition, exactly as if Enter had been pressed.

### Personal side: dropped (2026-10-13)
6. No personal-stories destination and no personal transition. Q6–Q21 from 2026-10-12
   (gallery format, photos, music, games, return path, captions, etc.) are withdrawn.

7. The `personal.log` tab is removed (2026-10-13). The history log moved into
   `developer.sh` as a `git log --graph --oneline history/` step. The off-the-clock list
   (gym, games, music, engines, photography) was dropped.
8. Until the transition is built, running the prompt scrolls to `#projects`.

## Still open
- Prompt wording now that it is the only prompt (currently "want to see the source?" /
  `./source --why`).
