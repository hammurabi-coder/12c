import re
import os

js_file = "docs/_app/immutable/nodes/2.BtndxDU6.js"

with open(js_file, "r", encoding="utf-8") as f:
    content = f.read()

# Make sure we load the initial state
pattern = r"function na\(e\)\{const r=\(\)=>H"
replacement = "function na(e){Rt(0);const r=()=>H"

new_content = re.sub(pattern, replacement, content)

if new_content != content:
    with open(js_file, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("Successfully patched JS file for initial load.")
else:
    print("Error: Could not find the init function to patch.")
