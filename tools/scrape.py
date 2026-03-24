import requests
from bs4 import BeautifulSoup
import os
import time
import re

CAESARS = [
    "Julius", "Augustus", "Tiberius", "Caligula",
    "Claudius", "Nero", "Galba", "Otho",
    "Vitellius", "Vespasian", "Titus", "Domitian"
]

LANGS = {
    "E": "en",
    "L": "la"
}

BASE_URL = "https://penelope.uchicago.edu/Thayer/{lang}/Roman/Texts/Suetonius/12Caesars/{name}*.html"

def process_soup(soup):
    # Replace markers with text delimiters
    for a in soup.find_all("a", class_="chapter"):
        val = a.get_text(strip=True)
        if val:
            a.replace_with(f" [[CHAPTER {val}]] ")
            
    for a in soup.find_all("a", class_="sec"):
        val = a.get_text(strip=True)
        if val:
            a.replace_with(f" [[SECTION {val}]] ")
            
    for span in soup.find_all("span", class_="pagenum"):
        val = span.get_text(strip=True)
        if val:
            span.replace_with(f" [[PAGE {val}]] ")

    # Identify and decompose navigation
    for table in soup.find_all("table"):
        if any(keyword in table.text.lower() for keyword in ["previous", "next", "contents"]):
            table.decompose()
            
    # Keep editorial notes at the end but maybe mark them
    # Thayer's notes are often in a table or list at the end
    
    # We want the narrative text
    text_content = []
    
    # Process main tags
    for tag in soup.find_all(["p", "h1", "h2", "h3", "h4", "div"]):
        # Skip tags that are purely navigation or boilerplate
        txt = tag.get_text(" ", strip=True)
        if any(keyword in txt for keyword in ["bit.ly", "Short URL", "Much of my site", "Clicca hic", "Faire clic"]):
            continue
            
        # If it's a div, only take it if it doesn't have a broad class like 'navigation'
        if tag.name == "div" and tag.get("class") and "navigation" in tag.get("class"):
            continue
            
        if txt:
            text_content.append(txt)
            
    return "\n\n".join(text_content)

def main():
    output_dir = "suetonius_texts"
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        
    for i, name in enumerate(CAESARS, 1):
        for lang_code, lang_ext in LANGS.items():
            url = BASE_URL.format(lang=lang_code, name=name)
            filename = f"{output_dir}/{i:02d}_{name.lower()}_{lang_ext}.txt"
            
            print(f"Scraping {name} ({lang_ext}) from {url}...")
            try:
                response = requests.get(url)
                response.raise_for_status()
                soup = BeautifulSoup(response.content, "html.parser")
                
                text = process_soup(soup)
                
                with open(filename, "w", encoding="utf-8") as f:
                    f.write(text)
                print(f"  Saved to {filename}")
                
            except Exception as e:
                print(f"  Error scraping {url}: {e}")
            
            time.sleep(1)

if __name__ == "__main__":
    main()
