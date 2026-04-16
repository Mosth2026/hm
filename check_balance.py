import sys

file_path = "src/pages/AdminDashboard.tsx"
with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

stack = []
for i, char in enumerate(text):
    if char == '(':
        stack.append(('(', i))
    elif char == ')':
        if not stack or stack[-1][0] != '(':
             print(f"Extra closing paren at {i}")
        else:
            stack.pop()
    elif char == '{':
        stack.append(('{', i))
    elif char == '}':
        if not stack or stack[-1][0] != '{':
            print(f"Extra closing brace at {i}")
        else:
            stack.pop()

for char, pos in stack:
    line = text.count('\n', 0, pos) + 1
    print(f"Unclosed {char} at line {line}")
