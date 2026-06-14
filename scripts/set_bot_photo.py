import json, urllib.request, uuid, io, os, sys

# Read token from env
token = os.environ.get('TG_BOT_TOKEN', '')
if not token:
    print("ERROR: TG_BOT_TOKEN not set")
    sys.exit(1)

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
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read())

# Read the logo
logo_path = '/home/ralph/agentbus/public/images/logo.png'
if os.path.exists(logo_path):
    with open(logo_path, 'rb') as f:
        logo_data = f.read()
    print(f"Logo size: {len(logo_data)} bytes")
    
    # Set profile photo using setUserPhoto for bot's own photo
    # Actually for bot profile pic we need to use setMyPhoto but that's for chat photos
    # For bot avatar, we need to use the BotFather flow or the setMyProfilePhoto API
    # Let's try the direct API endpoint
    print("\n=== Setting bot profile photo ===")
    try:
        r = call_api('setMyProfilePhoto', files={'photo': ('logo.png', logo_data, 'image/png')})
        print(r)
    except Exception as e:
        print(f"setMyProfilePhoto failed: {e}")
        # Try alternative: upload via setUserPhoto  
        print("\nTrying alternative method...")
        # The bot can't set its own avatar via API - must use BotFather
        print("Bot avatar must be set via @BotFather /setuserpic command")
else:
    print(f"Logo not found at {logo_path}")
    print("Available images:")
    img_dir = '/home/ralph/agentbus/public/images/'
    if os.path.exists(img_dir):
        for f in os.listdir(img_dir):
            print(f"  {f}")

print("\nDone!")
