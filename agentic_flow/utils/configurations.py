from agentic_flow import config_file_path
from datetime import datetime
import yaml



def is_tadawul_update_required():
    with open(config_file_path, "r") as f:
        config = yaml.safe_load(f)
    last_update = datetime.strptime(config["TADAWUL_DATA_LAST_UPDATE"], "%Y-%m-%d %H:%M:%S")
    elapsed_days = (datetime.now() - last_update).days
    return elapsed_days >= config["TADAWUL_DATA_UPDATE_FREQ_DAYS"]

def update_tadawul_last_update():
    with open(config_file_path, "r") as f:
        config = yaml.safe_load(f)
    config["TADAWUL_DATA_LAST_UPDATE"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(config_file_path, "w") as f:
        yaml.dump(config, f)
