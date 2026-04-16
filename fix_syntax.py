import sys

file_path = "src/pages/AdminDashboard.tsx"
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 1: Product Table closure
content = content.replace(")))}", "))}")
# Fix 2: Lifecycle Timeline closure
# Reconstruct the broken area
old_block = """                                                </div>
                                        </div>
                                    </div>
                                )))}"""
new_block = """                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))))}"""

if old_block in content:
    content = content.replace(old_block, new_block)
else:
    print("Old block not found!")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
