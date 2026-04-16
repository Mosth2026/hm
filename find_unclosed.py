import sys

file_path = "src/pages/AdminDashboard.tsx"
with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

in_single = False
in_double = False
in_template = False
in_comment = False
in_multiline_comment = False

for i, char in enumerate(text):
    if in_multiline_comment:
        if text[i:i+2] == "*/":
            in_multiline_comment = False
            # We skip the * in the next step
        continue
    if in_comment:
        if char == "\n":
            in_comment = False
        continue
    if in_single:
        if char == "'" and text[i-1] != "\\":
            in_single = False
        continue
    if in_double:
        if char == '"' and text[i-1] != "\\":
            in_double = False
        continue
    if in_template:
        if char == "`" and text[i-1] != "\\":
            in_template = False
        continue
    
    # Check for starters
    if text[i:i+2] == "//":
        in_comment = True
        continue
    if text[i:i+2] == "/*":
        in_multiline_comment = True
        continue
    if char == "'":
        in_single = True
        start_pos = i
    elif char == '"':
        in_double = True
    elif char == "`":
        in_template = True

if in_single:
    line = text.count('\n', 0, start_pos) + 1
    print(f"Unclosed single quote starting at line {line}")
elif in_double:
    print("Unclosed double quote")
elif in_template:
    print("Unclosed template literal")
else:
    print("All quotes balanced!")
