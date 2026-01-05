import os
from pyngrok import ngrok
from pathlib import Path

ROOT_DIR = Path(__file__).parent.parent.parent
print(ROOT_DIR)
from dotenv import load_dotenv
load_dotenv(ROOT_DIR / ".env")

'''
    Configuring ngrok tunnel
'''
ngrok.set_auth_token(os.getenv('NGROK_AUTH_TOKEN'))

def start_ngrok(port: int = 4998, ):
    # Open an HTTP tunnel on port 4998
    public_url = ngrok.connect(port, "http")
    print(f"🚀 Public ngrok URL: {public_url}")

if __name__ == "__main__":
    start_ngrok()
    
    # Keep the process alive
    input("Press ENTER to stop ngrok...")