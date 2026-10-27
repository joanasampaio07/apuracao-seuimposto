import os

files = ['assets/app.js', 'assets/app.0f00cc4e2b.js']

for fname in files:
    with open(fname, 'r', encoding='utf-8', errors='ignore') as f:
        text = f.read()

    # 1. Fix Ma hostname restriction
    old_ma = 'Ma=Feed.LIVE&&/^(apuracao-2026-staging\\.|localhost$|127\\.0\\.0\\.1$)/.test(location.hostname)'
    new_ma = 'Ma=Feed.LIVE'
    if old_ma in text:
        text = text.replace(old_ma, new_ma)
        print(f"Patched Ma in {fname}")
    else:
        print(f"old_ma not found in {fname}")

    # 2. Fix ql restriction
    old_ql = 'ql=(t,e)=>Ma&&!e&&Feed.LIVE&&te===1&&!!t&&!!t.n&&t.n.status==="segundo-turno"'
    new_ql = 'ql=(t,e)=>!e&&Feed.LIVE'
    if old_ql in text:
        text = text.replace(old_ql, new_ql)
        print(f"Patched ql in {fname}")
    else:
        print(f"old_ql not found in {fname}")

    with open(fname, 'w', encoding='utf-8') as f:
        f.write(text)

print("Done patching app files!")
