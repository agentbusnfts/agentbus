import os

env_path = os.path.expanduser("~/.hermes/profiles/agentbus/.env")
os.makedirs(os.path.dirname(env_path), exist_ok=True)

lines = [
    "TELEGRAM_BOT_TOKEN=***",
    "TELEGRAM_ALLOWED_USERS=1345174905",
]

with open(env_path, 'w') as f:
    f.write('\n'.join(lines) + '\n')

print("Done!")
with open(env_path) as f:
    print(f.read())
