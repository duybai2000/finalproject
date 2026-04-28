# Report Assets

Everything you need to assemble the thesis chapters.

## Contents

- **[REPORT.md](../REPORT.md)** — full Design / Implementation /
  Evaluation chapters, with Mermaid diagrams. Paste sections directly
  into your thesis.
- **[screenshots/README.md](./screenshots/README.md)** — capture
  instructions for 24 screenshots, ordered by report section. Drop the
  PNG files into the `screenshots/` folder using the suggested
  filenames and the README will preview them.

## Workflow

1. Read `REPORT.md` to see how each chapter is structured.
2. Open `screenshots/README.md` to see what screenshots are expected
   and where to take them.
3. Run the **Seed activity script** at the bottom of
   `screenshots/README.md` (5–10 min) to populate the dashboards with
   demo data.
4. Take all 24 screenshots and save them in `screenshots/` with the
   suggested filenames.
5. Assemble the thesis: open `REPORT.md` in Word (or copy-paste it)
   and insert each PNG at the matching section reference.

## Diagrams

`REPORT.md` uses Mermaid for system architecture, use cases, class,
ER, activity, and sequence diagrams. To export them as PNG for Word:

```bash
npm install -g @mermaid-js/mermaid-cli
# Save each ```mermaid block to e.g. arch.mmd, then:
mmdc -i arch.mmd -o arch.png -b transparent
```

GitHub renders Mermaid natively, so `REPORT.md` already previews in the
browser at <https://github.com/duybai2000/finalproject/blob/main/docs/REPORT.md>.

## Translation

Both files are in English. If your university requires Vietnamese,
ask and they'll be translated in one pass.
