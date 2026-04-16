import re

file_path = "src/pages/AdminDashboard.tsx"
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix Product Results closure
content = re.sub(r'(\n\s+)\)\)\)\}(\s+<TableBody>)', r'\1))}\2', content)

# Fix Lifecycle closure
pattern = r'(\n\s+<div>)\s+(\n\s+<span[\s\S]*?</span>)\s+(\n\s+</div>)\s+(\n\s+</div>)\s+(\n\s+</div>)\s+(\n\s+\)\)\))'
# Wait, my lifecycle block is currently:
# 3771: </div>
# 3772: </div>
# 3773: </div>
# 3774: )))}

# So:
content = re.sub(r'</div>\s+</div>\s+</div>\s+\)\)\)\}', r'</div>\n                                            )}\n                                        </div>\n                                    </div>\n                                ))))}', content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
