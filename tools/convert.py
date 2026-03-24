import json
import os
import re

CAESARS_IN_JS = [
    "Julius Caesar", "Augustus", "Tiberius", "Caligula",
    "Claudius", "Nero", "Galba", "Otho",
    "Vitellius", "Vespasian", "Titus", "Domitian"
]

SCRAPED_NAMES = [
    "julius", "augustus", "tiberius", "caligula",
    "claudius", "nero", "galba", "otho",
    "vitellius", "vespasian", "titus", "domitian"
]

def parse_marked_text(text):
    # Split editorial notes
    parts = re.split(r"The Editor's Notes:|Apparatus Criticus:", text, flags=re.IGNORECASE)
    narrative = parts[0]
    notes_raw = parts[1:] if len(parts) > 1 else []
    
    # Process notes
    notes = {}
    for n_block in notes_raw:
        n_items = re.split(r"❦", n_block)
        for item in n_items:
            item = item.strip()
            if not item: continue
            m = re.match(r"^([a-z0-9]+)\s+(.*)", item, re.DOTALL)
            if m:
                notes[m.group(1)] = m.group(2).strip()

    # Clean narrative from page markers
    narrative = re.sub(r"\[\[PAGE.*?\]\]", "", narrative)
    
    chapters = []
    chap_parts = re.split(r"\[\[CHAPTER\s+(\d+)\]\]", narrative)
    
    for i in range(1, len(chap_parts), 2):
        c_num = chap_parts[i]
        c_content = chap_parts[i+1]
        
        sections = []
        sec_parts = re.split(r"\[\[SECTION\s+([\d\.]+)\]\]", c_content)
        
        for j in range(1, len(sec_parts), 2):
            s_num = sec_parts[j]
            s_text = sec_parts[j+1].strip()
            s_text = re.sub(r"\s+", " ", s_text)
            sections.append({"id": s_num, "text": s_text})
            
        chapters.append({
            "chapter": c_num,
            "sections": sections
        })
        
    return chapters, notes

def main():
    input_dir = "suetonius_texts"
    output_dir = "docs/content"
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        
    # Remove all existing JSONs to avoid confusion
    for f in os.listdir(output_dir):
        if f.endswith(".json"):
            os.remove(os.path.join(output_dir, f))

    for i, (full_name, scraped_name) in enumerate(zip(CAESARS_IN_JS, SCRAPED_NAMES), 1):
        en_file = f"{input_dir}/{i:02d}_{scraped_name}_en.txt"
        la_file = f"{input_dir}/{i:02d}_{scraped_name}_la.txt"
        
        if not os.path.exists(en_file) or not os.path.exists(la_file):
            print(f"Skipping {full_name}")
            continue
            
        with open(en_file, "r", encoding="utf-8") as f:
            en_raw = f.read()
        with open(la_file, "r", encoding="utf-8") as f:
            la_raw = f.read()
            
        en_chapters, en_notes = parse_marked_text(en_raw)
        la_chapters, la_notes = parse_marked_text(la_raw)
        
        en_map = {c["chapter"]: c for c in en_chapters}
        la_map = {c["chapter"]: c for c in la_chapters}
        
        all_chap_nums = sorted(list(set(en_map.keys()) | set(la_map.keys())), key=int)
        
        sections = []
        for c_num in all_chap_nums:
            en_c = en_map.get(c_num, {"sections": []})
            la_c = la_map.get(c_num, {"sections": []})
            
            en_text = "\n\n".join([f"{s['id']} {s['text']}" for s in en_c["sections"]])
            la_text = "\n\n".join([f"{s['id']} {s['text']}" for s in la_c["sections"]])
            
            sections.append({
                "heading": f"Chapter {c_num}",
                "en": en_text,
                "la": la_text
            })
            
        data = {
            "metadata": {
                "name": full_name,
                "source": "LacusCurtius / Loeb Classical Library (1914)"
            },
            "sections": sections,
            "notes": {**en_notes, **la_notes}
        }
        
        # Save with exact name used in JS fetch logic
        output_file = f"{output_dir}/{full_name.lower()}.json"
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        print(f"Created {output_file} with {len(sections)} chapters.")

if __name__ == "__main__":
    main()
