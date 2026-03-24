import re
import os

js_file = "docs/_app/immutable/nodes/2.BtndxDU6.js"

with open(js_file, "r", encoding="utf-8") as f:
    content = f.read()

# New replacement with logging
replacement = 'try{console.log("Fetching life for index:", e); const t=await(await fetch("/12c/content/"+_e[e].name.toLowerCase()+".json")).json(); console.log("Fetched data:", t); xe.update(o=>({...o,[e]:t})); console.log("Store updated");}catch(d){console.error("Failed to load local life:",d)}'

# Pattern to find our previously patched code (or the original)
# A more generic pattern might be better
pattern = r"try\{const t=await\(await fetch\(\"/12c/content/\"\+.*?\.json\"\)\)\.json\(\);xe\.update\(o=>\(\{...o,\[e\]:t\}\)\)\}catch\(d\)\{console\.error\(\"Failed to load local life:\",d\)\}"

new_content = re.sub(pattern, replacement, content)

if new_content == content:
    # Try finding the original again if we already messed up or something
    print("Could not find previously patched pattern, trying original...")
    pattern_orig = r"try\{const t=\(await\(await fetch\(\"https://api\.anthropic\.com/v1/messages\".*?JSON\.parse\(t\);xe\.update\(o=>\(\{...o,\[e\]:s\}\)\)\}catch\(d\)\{console\.error\(\"Failed to fetch life:\",d\)\}"
    new_content = re.sub(pattern_orig, replacement, content, flags=re.DOTALL)

if new_content != content:
    with open(js_file, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("Successfully patched JS file with logging.")
else:
    print("Error: Could not patch JS file.")
