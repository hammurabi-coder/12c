# Plan: Editorial Split and Website Audit

## Objective
1.  **Split Editorial Text:** Refine the JSON generation to separate main Suetonius narrative from editorial notes, page numbers, and boilerplate.
2.  **Audit Website:** Check for broken links, redundant files, and improve the overall structure/consistency.

## 1. Editorial Text Split

### Analysis of Current Data
- **Boilerplate Headers:** "Suetonius, The Lives of the Caesars", "The Life of Julius Caesar", etc.
- **Page Markers:** Patterns like `p3`, `p101`, etc.
- **Footnote Markers:** Numeric (1, 2) and Alpha (a, b) markers in the text.
- **Editorial Notes:** "The Editor's Notes:" and "Thayer's Notes:" sections at the end of files.

### Proposed JSON Schema Update
```json
{
  "sections": [
    {
      "heading": "Chapter 1",
      "en": "English text...",
      "la": "Latin text..."
    }
  ]
}
```

### Implementation Steps
1.  **Update `convert_to_json.py`:**
    - Add regex to strip page numbers (`p\d+`).
    - Add logic to split text into chapters based on the `\d+ \d+` pattern.
    - Extract "The Editor's Notes" and "Thayer's Notes" sections into a separate field.
    - Match chapters between English and Latin versions.
2.  **Regenerate JSON:** Run the updated script.
3.  **Cleanup:** Remove duplicate `julius caesar.json` (keep `julius.json`).

## 2. Website Audit

### Redundancy & Cleanup
- [ ] Remove duplicate `julius caesar.json` in `docs/content/`.
- [ ] Verify if `src/content/EPUB` is still needed.
- [ ] Ensure all 12 Caesars are correctly represented in the timeline.

### UI/UX Improvements
- [ ] Check if the patched JS correctly handles the new JSON structure.
- [ ] Verify mobile responsiveness of the timeline and text display.
- [ ] Ensure Latin/English toggle works as expected with the new structure.

### Verification
- [ ] Run a local audit script to check for 404s or missing content files.
- [ ] Manually verify a few lives (e.g., Nero, Domitian) for data integrity.
