import os
os.environ["PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION"] = "python"
import uvicorn

if __name__ == "__main__":
    uvicorn.run("backend.main:app", port=8000)
