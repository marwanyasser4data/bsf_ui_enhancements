import time

def generate_response(human_message: str, session_key: dict):
    time.sleep(120)
    for i in range(600):
        if i%20 == 0:
            yield str(' ')
        if i%100 == 0:
            yield str('\n')
        yield str(i)
        time.sleep(0.02)