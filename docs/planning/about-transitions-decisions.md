# About section: transition decisions (saved 2026-10-12, not built yet)

Context: About is a terminal window with two tabs (`developer.sh`, `personal.log`) and a
prompt bar at the bottom. Enter (keyboard) or tap (touch) runs the prompt. The prompt
should trigger a different *transition* depending on the tab, not just swap tabs.

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

## Still open (Q6 onward, asked 2026-10-12)

Personal tab → personal stories:
- 6. Destination format (gallery, timeline, map, mix; polaroid wall, film strip, scrapbook?)
- 7. Where it lives (new home section, separate page like /life, full-screen overlay)
- 8. Which parts of life go in (gym, games, music, cars/big bikes, photography, travel,
  family/friends, Cauayan, how he started coding)
- 9. Photos available? How many, of what? (No unlabeled placeholders on a live page.)
- 10. Comfortable with face photos, bikes/cars/plates? Anything off limits?
- 11. Music: Spotify embed/link, handwritten list (~5 songs/artists), or skip
- 12. Games: show ranks/stats or just names
- 13. Feel of the personal transition (film-leader countdown, page flip, aperture, warm
  amber particles into a polaroid stack); keep amber or another color
- 14. Particles on the personal side or a deliberately different mechanic (default: different)
- 15. How to return (button, Escape/Enter, scroll up); back to About or on to Projects
- 16. Mobile gallery: swipe horizontally or scroll vertically (default: swipe)
- 17. Audience (recruiters, classmates, startup people) and how personal is too personal
- 18. Keep, move or drop the "history" log; real dates needed (start coding, HIRED.PH
  placement, internship)
- 19. Prompt wording ("want to see the source?" / "want to see the history?" or other)
- 20. Photos/screenshots now, or build structure with clearly labeled empty slots first
- 21. Who writes captions/stories (default: interview one memory at a time, Claude drafts)
