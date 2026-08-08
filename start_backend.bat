@echo off
set PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION=python
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
