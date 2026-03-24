# Twelve Caesars: Digital Edition - Mandates

## Core Purpose
The primary goal of this repository is to maintain a **high-performance, visually immersive, and interactive digital edition** of Suetonius' *The Twelve Caesars*.

## Mandates
- **Visual Aesthetic:** Prioritize the "Roman Volumen" (scroll) design, ensuring a tactile and scholarly experience using Cinzel and Marcellus typography on a papyrus background.
- **Maintenance:** The project is a full SvelteKit source implementation. Avoid manual patching of minified files.
- **Data-First:** All content is served from local, aligned JSON files in `static/content/`.
- **Scraping Tools:** Scripts in the `tools/` directory are currently on hold. They are not the core part of the project and should be ignored during code quality audits unless specifically requested for content expansion.

## Deployment
- **GitHub Pages:** Deploy from the `docs/` folder on the `master` branch.
- **Build Workflow:** Run `npm run build` and ensure `docs/index.html` is present before pushing.
