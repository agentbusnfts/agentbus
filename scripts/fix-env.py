#!/usr/bin/env python3
"""Fix VENICE_API_KEY in .env.local"""
import re

KEY = "VENICE_INFERENCE_KEY_pkUOT1cAUt4JHpYDZ5Cz2dQh67p7lgZgTsDlq0Y48H"

with open('.env.local', 'r') as f:
    content = f.read()

# Replace any existing VENICE_API_KEY line
content = re.sub(r'VENICE_API_KEY=.*', f'VENICE_API_KEY={KEY}', content)

with open('.env.local', 'w') as f:
    f.write(content)

# Verify
for line in content.split('\n'):
    if line.startswith('VENICE_API_KEY='):
        val = line.split('=', 1)[1]
        print(f"Key set: {val[:10]}...{val[-5:]} ({len(val)} chars)")
