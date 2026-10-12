# Hero sides + About window redesign: decisions (saved 2026-10-13, not built yet)

## Problems named by Randel
- Hero side paragraphs ("A CS student from Cauayan..." and "Seven products designed...")
  feel plain and empty: no graphics, no motion, nothing to do.
- About window is a small terminal sitting on top of a big empty div box. Wants it big,
  and the right/empty side used for a visual made from his portrait particles.
- Wants scroll to drive everything with purpose: smooth scrubbing, each wheel click
  advances something.

## Decided
- Hero needs a contact / socials button right at the start, and/or a "skip to contact"
  control so a visitor (recruiter) can reach contact and socials immediately.
- Side text: rewrite is allowed (show copy before it goes in). Style: Claude decides
  (default: technical, thin lines, brackets, coordinates, to match the terminal).
- Hero side elements (all of the problems): add graphics, motion, and interaction.
- Scroll: smooth scrubbing with a pinned sequence of about 4-5 beats, then releases into
  normal scroll. Beat order: Claude decides.
- Window size/layout: Claude decides (default: near full viewport, terminal text left,
  visual right).
- Window styling: Claude may improve anything; Randel will say what he does not want.
- Personal tab: already removed. About is developer-only for now.
- Particles in the transition: Claude decides (default: portrait particles visibly travel
  to the right-side visual). The red particle band along the top edge of About is
  Claude's call (default: remove or make it a deliberate hand-off).
- Clean mode: NOT removed in this task (see backlog).
- Earlier answers still stand: Enter (or scrolling past) on the developer tab runs the
  sphere transition; particles stay hidden in About until then.

## Right-side visual: black hole (Randel's idea, 2026-10-13)
Proposed plan (needs Randel's yes): the portrait particles are pulled into a black hole
with an accretion disk and lensing, as the scroll scrubs. The About window sits beside it.
Pressing Enter (or scrolling past) collapses the black hole into the sphere, which gives
the whole home page one story: portrait -> singularity -> sphere of projects.
Open: black hole instead of ASCII, or the disk drawn in ASCII characters? (default: black
hole rendered with ASCII glyphs in the disk, so both ideas survive.)

## BACKLOG (remind Randel when he says he does not know what to do / forgot)
- **Replace the Clean/Immersive toggle with a first-visit choice.** Instead of a mode
  switch, ask the visitor: "Want a quick look?" (fast, no heavy particles) or "Want to have
  some fun?" (full immersive experience). Randel will define it later. Decisions to make
  then: what "quick look" contains, whether the choice is remembered, whether it can be
  changed afterwards, the fallback for low-power / no-WebGL devices.
  Status: saved only, do not build until Randel asks.
