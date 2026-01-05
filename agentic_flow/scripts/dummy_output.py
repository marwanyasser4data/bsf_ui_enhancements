import time

def generate_response(human_message: str, session_key: dict):
<<<<<<< HEAD
    # time.sleep(1) # Reduced delay for testing
=======
    time.sleep(120)
>>>>>>> c246036aed8941c43a9b1565584aabf71651f10a
    for i in range(600):
        if i%20 == 0:
            yield str(' ')
        if i%100 == 0:
            yield str('\n')
        yield str(i)
        time.sleep(0.02)