import re
import os

js_file = "docs/_app/immutable/nodes/2.BtndxDU6.js"

if not os.path.exists(js_file):
    print(f"Error: {js_file} not found")
    exit(1)

with open(js_file, "r", encoding="utf-8") as f:
    content = f.read()

# Pattern to find the fetch call to Anthropic API
pattern = r"try\{const t=\(await\(await fetch\(\"https://api\.anthropic\.com/v1/messages\".*?JSON\.parse\(t\);xe\.update\(o=>\(\{...o,\[e\]:s\}\)\)\}catch\(d\)\{console\.error\(\"Failed to fetch life:\",d\)\}"

# Replacement string
replacement = 'try{const t=await(await fetch("/12c/content/"+_e[e].name.toLowerCase()+".json")).json();xe.update(o=>({...o,[e]:t}))}catch(d){console.error("Failed to load local life:",d)}'

# Perform replacement
new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)

if new_content == content:
    print("Error: Pattern not found in JS file.")
    # Let's try a simpler pattern just in case
else:
    with open(js_file, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("Successfully patched JS file.")
