#!/bin/bash
# Start the Flask app. Uses venv if present, otherwise system python3.
cd "$(dirname "$0")"
if [ -f venv/bin/python ]; then
    exec venv/bin/python app.py "$@"
else
    exec python3 app.py "$@"
fi
