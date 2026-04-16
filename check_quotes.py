import sys

file_path = "src/pages/AdminDashboard.tsx"
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    # Only check outside of comments (very basic check)
    if "//" in line:
        code_part = line.split("//")[0]
    else:
        code_part = line
        
    s_count = code_part.count("'")
    d_count = code_part.count('"')
    if s_count % 2 != 0:
        print(f"Unbalanced single quote at line {i+1}: {line.strip()}")
    if d_count % 2 != 0:
        # Double quotes are more common in JSX
        pass
