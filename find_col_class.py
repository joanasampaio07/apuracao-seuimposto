import re

with open('assets/app.js', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

for m in re.finditer(r'class="col [^"]*"', text):
    start = max(0, m.start() - 100)
    end = min(len(text), m.end() + 200)
    print("--- Found col class ---")
    print(text[start:end])
