import sys

file_path = "src/pages/AdminDashboard.tsx"
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    # Ignore comments
    if "//" in line:
        line = line.split("//")[0]
    
    # Ignore strings inside double quotes
    # Simplified: count single quotes
    match_count = line.count("'")
    if match_count % 2 != 0:
        # Check if it was escaped
        if line.count("\\'") % 2 != 0:
             # Wait, this is getting complex.
             pass
        print(f"Odd single quotes at {i+1}: {line.strip()}")
