import sys

file_path = "src/pages/AdminDashboard.tsx"
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Line numbers from view_file are 1-indexed.
# Line 2967 is index 2966.
# Let's verify it first to be safe.
if "]] }" in lines[2966] or "]]}" in lines[2966] or lines[2966].strip() == "))}":
    lines[2966] = "                                                )}\n"
else:
    print(f"Line 2967 is: '{lines[2966]}'")

# Line 3775 is index 3774.
if lines[3774].strip() == "))}":
    lines[3774] = "                                ))}\n"
else:
    print(f"Line 3775 is: '{lines[3774]}'")

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(lines)
