#!/usr/bin/env python3
"""
verify-links.py

For each wikiLink in static/content/*.json, extracts surrounding context,
queries Wikipedia to verify the linked article is the correct historical figure,
and compares the linked article vs the suggested article. Emits a markdown
table and emails it as an attachment to shapiro.peter@gmail.com.

Peter's correction (2026-03-26): The "Name Suetonius" search heuristic generates
massive false negatives — Wikipedia search returns articles ABOUT Suetonius the
author rather than the historical figure being referenced. The correct approach
is to use context (emperor name, chapter heading) to disambiguate, not append
"Suetonius" to every query.
"""

import json
import re
import smtplib
import os
from pathlib import Path
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders

import requests

# ── Config ────────────────────────────────────────────────────────────────────

CONTENT_DIR = Path(__file__).parent / "static" / "content"
OUTPUT_PATH = Path(__file__).parent / "verify_links.md"
WIKIPEDIA_API = "https://en.wikipedia.org/w/api.php"
GMAIL_USER = "bushap5000@gmail.com"
GMAIL_APP_PASSWORD = "***"
RECIPIENT = "shapiro.peter@gmail.com"

# Emperor-specific context terms for disambiguation
# Maps emperor slug → terms to include in Wikipedia search to narrow results
EMPEROR_CONTEXT = {
    "julius": "Roman Republic dictator",
    "augustus": "Roman emperor first",
    "tiberius": "Roman emperor second",
    "caligula": "Roman emperor third",
    "claudius": "Roman emperor fourth",
    "nero": "Roman emperor fifth",
    "galba": "Roman emperor sixth",
 "otho": "Roman emperor seventh",
    "vitellius": "Roman emperor eighth",
    "vespasian": "Roman emperor ninth",
    "titus": "Roman emperor tenth",
    "domitian": "Roman emperor eleventh",
}

# Known ambiguous names that need disambiguation even with emperor context
# Format: display_name -> (wrong_article_prefix, correct_context_hint)
AMBIGUOUS_NAMES = {
    "Lepidus": ("Marcus Aemilius Lepidus", "triumvir not later consul"),
    "Brutus": ("Marcus Junius Brutus", "Republic assassin not other Brutus"),
    "Pompey": ("Gnaeus Pompeius Magnus", "Roman general not other Pompey"),
    "Cato": ("Marcus Porcius Cato", "Republic statesman not other Cato"),
    "Sulla": ("Lucius Cornelius Sulla", "Roman dictator not other Sulla"),
    "Cicero": ("Marcus Tullius Cicero", "Roman orator not other Cicero"),
    "Marius": ("Gaius Marius", "Roman general not other Marius"),
    "Crassus": ("Marcus Licinius Crassus", "triumvir not other Crassus"),
}


# ── Wikipedia helpers ──────────────────────────────────────────────────────────

def wikipedia_opensearch(query: str) -> list[str]:
    """Return Wikipedia title suggestions using opensearch (prefix search).
    
    Uses the Wikipedia OpenSearch API which returns title matches rather
    than full-text search matches. Best for disambiguating Roman names
    when you know the rough correct form.
    """
    params = {
        "action": "opensearch",
        "search": query,
        "limit": 5,
        "namespace": 0,
        "format": "json",
    }
    headers = {
        "User-Agent": "TreadwellBot/1.0 (Suetonius-link-verification; mailto:bushap@gmail.com)"
    }
    try:
        resp = requests.get(WIKIPEDIA_API, params=params, headers=headers, timeout=10)
        data = resp.json()
        return data[1] if isinstance(data, list) and len(data) > 1 else []
    except Exception:
        return []


def wikipedia_srsearch(query: str) -> str | None:
    """Return top Wikipedia article title using full-text search.
    
    Uses the Wikipedia search API which returns articles matching the query
    text. Good for names that are specific enough to find the right article
    on their own (Cleopatra, Pompey, geographic places).
    Peter correction: Do NOT append "Suetonius" — it causes search to return
    articles about the author rather than the historical figure.
    """
    params = {
        "action": "query",
        "list": "search",
        "srsearch": query,
        "format": "json",
        "srlimit": 1,
    }
    headers = {
        "User-Agent": "TreadwellBot/1.0 (Suetonius-link-verification; mailto:bushap@gmail.com)"
    }
    try:
        resp = requests.get(WIKIPEDIA_API, params=params, headers=headers, timeout=10)
        data = resp.json()
        hits = data.get("query", {}).get("search", [])
        return hits[0]["title"] if hits else None
    except Exception:
        return None


# Names that are short and ambiguous — need hints from AMBIGUOUS_NAMES
_SHORT_AMBIGUOUS = frozenset(k for k in AMBIGUOUS_NAMES)


def wikipedia_suggest(name: str, emperor_slug: str) -> str | None:
    """Get the best Wikipedia article suggestion for a name.
    
    Strategy (Peter correction — do NOT append "Suetonius"):
    1. Short ambiguous names (Brutus, Lepidus, Cato, etc.) → use opensearch
       with the full name + disambiguation hint from AMBIGUOUS_NAMES
    2. Full/disambiguated names (Ptolemy XIII, Gaius Marius) → opensearch directly
    3. Common names and places (Cleopatra, Pompey, Gaul) → srsearch with emperor context
    
    This avoids the false-negative problem where "Name Suetonius" search
    returns articles about the author Suetonius.
    """
    # Case 1: short ambiguous names — use hints
    if name in _SHORT_AMBIGUOUS:
        correct_name, hint = AMBIGUOUS_NAMES[name]
        suggestions = wikipedia_opensearch(f"{correct_name} {hint}")
        return suggestions[0] if suggestions else None
    
    # Case 2: names that look already disambiguated — try opensearch directly
    if any(c in name for c in "(,)"):
        suggestions = wikipedia_opensearch(name)
        return suggestions[0] if suggestions else None
    
    # Case 3: common names and places — use srsearch with emperor context
    emperor_context = EMPEROR_CONTEXT.get(emperor_slug, "")
    query = f"{name} {emperor_context}" if emperor_context else name
    return wikipedia_srsearch(query)


def title_from_url(url: str) -> str:
    """Extract article title from a Wikipedia URL."""
    if not url:
        return ""
    return url.split("/")[-1].replace("_", " ")


# ── Context extraction ─────────────────────────────────────────────────────────

def get_context(text: str, location: int, radius: int = 80) -> str:
    start = max(0, location - radius)
    end = min(len(text), location + radius)
    excerpt = text[start:end].replace("\n", " ").replace(r"\s+", " ")
    if start > 0:
        excerpt = "..." + excerpt
    if end < len(text):
        excerpt = excerpt + "..."
    return excerpt.strip()


# ── Load all emperor data ──────────────────────────────────────────────────────

def load_all_emperors():
    files = list(CONTENT_DIR.glob("*.json"))
    emperors = []
    for f in files:
        slug = f.stem
        data = json.loads(f.read_text())
        emperors.append({"slug": slug, "data": data})
    return emperors


def collect_links_with_context(emperors):
    """Collect all unique wikiLinks across all emperors, with context."""
    collected = {}  # name -> {url, contexts, slug}

    for emperor in emperors:
        data = emperor["data"]
        sections = data.get("sections", [])
        slug = emperor["slug"]

        for section in sections:
            text = section.get("en", "")
            wiki_links = section.get("wikiLinks", {})

            for name, url in wiki_links.items():
                if not name or not url:
                    continue

                try:
                    pattern = re.compile(r"\b" + re.escape(name) + r"\b", re.IGNORECASE)
                except re.error:
                    continue

                contexts = []
                for m in pattern.finditer(text):
                    contexts.append(get_context(text, m.start()))

                if name not in collected:
                    collected[name] = {"url": url, "contexts": contexts, "slug": slug}
                else:
                    existing = collected[name]
                    for ctx in contexts:
                        if ctx not in existing["contexts"]:
                            existing["contexts"].append(ctx)

    return collected


# ── Markdown builder ──────────────────────────────────────────────────────────

def build_markdown(results):
    lines = [
        "# Suetonius Links — Disambiguation Verification\n",
        "*Using Wikipedia title search with emperor historical context (NOT 'Suetonius' suffix)*\n",
        "## How to read this\n",
        "- **Linked Article** = what we currently have in the JSON\n",
        "- **Suggested Article** = top Wikipedia title match using emperor context disambiguation\n",
        "- **Match?** = ✓ if they agree, ✗ if they diverge, ? if no suggestion found\n",
        "---\n",
        "| N | Name | Context | Linked Article | Suggested | Match? |\n",
        "|--:|--|--|--|--|--:|\n",
    ]

    for i, r in enumerate(results, 1):
        ctx = r["context"]
        if len(ctx) > 100:
            ctx = ctx[:100] + "..."
        lines.append(
            f"| {i} | {r['name']} | {ctx} | {r['linked_title']} | "
            f"{r['suggested_title']} | {r['match']} |"
        )

    stats = {
        "total": len(results),
        "match": sum(1 for r in results if r["match"] == "✓"),
        "mismatch": sum(1 for r in results if r["match"] == "✗"),
        "uncertain": sum(1 for r in results if r["match"] == "?"),
    }

    lines.extend([
        "\n## Summary\n",
        f"- **Total unique links verified:** {stats['total']}\n",
        f"- **✓ Matches:** {stats['match']}\n",
        f"- **✗ Mismatches:** {stats['mismatch']}\n",
        f"- **? Uncertain:** {stats['uncertain']}\n",
    ])

    mismatches = [r for r in results if r["match"] == "✗"]
    if mismatches:
        lines.append("\n## Mismatches to review\n")
        for r in mismatches:
            lines.append(
                f"- **{r['name']}** → currently linked to \"{r['linked_title']}\" "
                f"but Wikipedia suggests \"{r['suggested_title']}\"\n"
            )

    return "\n".join(lines)


# ── Email ─────────────────────────────────────────────────────────────────────

def send_email(markdown_content: str, to_email: str):
    msg = MIMEMultipart()
    msg["Subject"] = "Suetonius Links — Disambiguation Verification"
    msg["From"] = GMAIL_USER
    msg["To"] = to_email

    body = (
        "Verification report attached. Check the Match column:\n"
        "- \\u2713 = linked article matches Wikipedia disambiguation\n"
        "- \\u2717 = mismatch, review needed\n"
        "- ? = no suggestion found\n\n"
        "Uses emperor historical context for disambiguation (NOT 'Suetonius' suffix).\n"
        "Run by your frontier model for a second opinion.\n"
        f"Total: {len([l for l in markdown_content.splitlines() if l.startswith('|') and not l.startswith('|--')])} rows"
    )
    msg.attach(MIMEText(body, "plain"))

    part = MIMEBase("application", "octet-stream")
    part.set_payload(markdown_content.encode("utf-8"))
    encoders.encode_base64(part)
    part.add_header("Content-Disposition", "attachment", filename="verify_links.md")
    msg.attach(part)

    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.starttls()
        server.login(GMAIL_USER, GMAIL_APP_PASSWORD)
        server.send_message(msg)

    print(f"Email sent to {to_email}")


# ── Main ─────────────────────────────────────────────────────────────────────

def main():
    print("Loading emperor data...")
    emperors = load_all_emperors()
    print(f"Loaded {len(emperors)} emperors")

    print("Collecting wikiLinks...")
    collected = collect_links_with_context(emperors)
    print(f"Found {len(collected)} unique linked names")

    results = []
    for i, (name, info) in enumerate(collected.items(), 1):
        url = info["url"]
        contexts = info["contexts"]
        slug = info["slug"]

        linked_title = title_from_url(url)
        context = contexts[0] if contexts else ""

        # Use proper Wikipedia disambiguation (Peter's correction — no "Suetonius" suffix)
        suggested_title = wikipedia_suggest(name, slug)
        print(f"[{i}/{len(collected)}] {name} (emperor={slug}) -> suggested: {suggested_title}")

        # Check match: normalize titles for comparison
        if suggested_title and linked_title:
            linked_slug = linked_title.lower().replace(" ", "_").replace("-", "_")
            linked_slug = re.sub(r"[()]", "", linked_slug)
            suggested_slug = suggested_title.lower().replace(" ", "_").replace("-", "_")
            suggested_slug = re.sub(r"[()]", "", suggested_slug)

            slug_contained = (linked_slug in suggested_slug) or (suggested_slug in linked_slug)
            linked_words = set(re.sub(r"[^a-z]", "", w.lower()) for w in linked_title.split() if len(w) > 2)
            suggested_words = set(re.sub(r"[^a-z]", "", w.lower()) for w in suggested_title.split() if len(w) > 2)
            word_overlap = len(linked_words & suggested_words)
            min_overlap = max(2, len(linked_words) // 2)
            match = "✓" if slug_contained or word_overlap >= min_overlap else "✗"
        elif suggested_title:
            match = "?"
        else:
            match = "? (no wiki)"

        results.append({
            "name": name,
            "context": context,
            "linked_title": linked_title,
            "suggested_title": suggested_title or "(none)",
            "match": match,
        })

    print("\nBuilding markdown...")
    md = build_markdown(results)
    OUTPUT_PATH.write_text(md)
    print(f"Markdown saved to {OUTPUT_PATH}")

    mismatches = [r for r in results if r["match"] == "✗"]
    print(f"\nResults: {len(results)} total, {len(mismatches)} mismatches")
    for r in mismatches:
        print(f"  ✗ {r['name']}: linked '{r['linked_title']}' vs suggested '{r['suggested_title']}'")

    print("\nSending email...")
    send_email(md, RECIPIENT)
    print("Done.")


if __name__ == "__main__":
    main()
