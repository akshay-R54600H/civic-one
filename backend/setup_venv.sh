#!/bin/bash
# Recreate the virtual environment if venv/bin/python is broken.
# Run: ./setup_venv.sh
cd "$(dirname "$0")"
echo "Removing old venv..."
rm -rf venv
echo "Creating new venv..."
python3 -m venv venv
echo "Installing dependencies..."
venv/bin/pip install -r requirements.txt
echo "Done. Run: ./run.sh or venv/bin/python app.py"
