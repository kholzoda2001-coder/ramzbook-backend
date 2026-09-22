import re

with open('prisma/_de-m12-content.mjs', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace question -> prompt
text = re.sub(r"question: '(.*?)',", r"prompt: '\1',\n        promptTranslated: '\1',", text)

# Replace correctIndex with answer
def repl(m):
    opts = eval(m.group(1))
    idx = int(m.group(2))
    return f"options: {m.group(1)},\n        answer: '{opts[idx]}',"

text = re.sub(r"options:\s*(\[.*?\]),\s*correctIndex:\s*(\d+),", repl, text)

with open('prisma/_de-m12-content.mjs', 'w', encoding='utf-8') as f:
    f.write(text)
