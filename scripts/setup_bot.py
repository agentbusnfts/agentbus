#!/usr/bin/env python3
"""Set up AgentBus Telegram bot profile photo and verify configuration."""
import json, urllib.request, urllib.parse, uuid, io, os, sys

# Read token from file to avoid shell escaping issues
token_path = os.path.join(os.path.dirname(__file__), '.bot_token')
if os.path.exists(token_path):
    with open(token_path) as f:
        token = f.read().strip()
else:
    # Read from env
    token = os.environ.get('TG_BOT_TOKEN', '')

if not token:
    print("ERROR: No bot token found. Set TG_BOT_TOKEN env var or create .bot_token file")
    sys.exit(1)

print(f"Using token: {token[:10]}...{token[-5:]}")

def call_api(method, params=None, files=None):
    url = f"https://api.telegram.org/bot{token}/{method}"
    if files:
        boundary = uuid.uuid4().hex
        body = io.BytesIO()
        for key, (filename, data, mime) in files.items():
            body.write(f'--{boundary}\r\n'.encode())
            body.write(f'Content-Disposition: form-data; name="{key}"; filename="{filename}"\r\n'.encode())
            body.write(f'Content-Type: {mime}\r\n\r\n'.encode())
            body.write(data)
            body.write(b'\r\n')
        if params:
            for key, val in params.items():
                body.write(f'--{boundary}\r\n'.encode())
                body.write(f'Content-Disposition: form-data; name="{key}"\r\n\r\n'.encode())
                body.write(str(val).encode())
                body.write(b'\r\n')
        body.write(f'--{boundary}--\r\n'.encode())
        data = body.getvalue()
        req = urllib.request.Request(url, data=data, headers={'Content-Type': f'multipart/form-data; boundary={boundary}'})
    elif params:
        data = json.dumps(params).encode()
        req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
    else:
        req = urllib.request.Request(url)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"HTTP Error {e.code}: {body}")
        return {'ok': False, 'error': body}

# Step 1: Verify bot
print("\n=== 1. Verify bot (getMe) ===")
r = call_api('getMe')
print(json.dumps(r, indent=2))

# Step 2: Try to set profile photo
# Note: Bots CANNOT set their own profile photo via Bot API
# This must be done through @BotFather /setuserpic
# But we can try the setMyProfilePhoto endpoint (Bot API 9.4+)
print("\n=== 2. Try setMyProfilePhoto ===")
logo_path = '/home/ralph/agentbus/public/images/logo.png'
if os.path.exists(logo_path):
    with open(logo_path, 'rb') as f:
        logo_data = f.read()
    print(f"Logo: {len(logo_data)} bytes")
    
    # Try the newer API endpoint
    try:
        r = call_api('setMyProfilePhoto', files={'photo': ('logo.png', logo_data, 'image/png')})
        print(json.dumps(r, indent=2))
    except Exception as e:
        print(f"setMyProfilePhoto not available: {e}")
        print("Profile photo must be set via @BotFather → /setuserpic")
else:
    print(f"Logo not found at {logo_path}")

# Step 3: Check current bot info
print("\n=== 3. Current bot info ===")
r = call_api('getMyName')
print(f"Name: {r}")
r = call_api('getMyDescription')
print(f"Description: {r}")
r = call_api('getMyShortDescription')
print(f"Short desc: {r}")
r = call_api('getMyCommands')
print(f"Commands: {json.dumps(r, indent=2)}")

print("\n✅ Bot setup complete!")
print(f"Bot username: @agentbusnfts_bot")
print(f"Bot ID: 8697697194")
print("\n⚠️  Profile photo must be set manually via @BotFather → /setuserpic → send logo.png")
