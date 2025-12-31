import os
from pathlib import Path

MAIN_DIR = Path(__file__).parent.parent.parent
LOG_FOLDER = MAIN_DIR / 'logs'

from dotenv import load_dotenv
load_dotenv(os.path.join(MAIN_DIR, '.env'), override=True)

