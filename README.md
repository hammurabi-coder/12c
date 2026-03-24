# The Twelve Caesars - Digital Edition

A modern, scholarly digital edition of Suetonius' *De Vita Caesarum*.

## Features
- **Full Text:** Complete English translation (J.C. Rolfe, 1914) and Latin text.
- **Bilingual View:** Side-by-side English and Latin alignment.
- **Timeline Navigation:** Easy access to all 12 biographies.
- **Fast & Static:** Powered by SvelteKit, served as a static site.

## Development

### Prerequisites
- Node.js (v18+)
- npm

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```
The build output will be generated in the `docs/` directory for GitHub Pages compatibility.

## Data Source
Text scraped from [LacusCurtius](https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Suetonius/12Caesars/home.html).
Data processed and aligned using Python scripts in the `tools/` directory.
