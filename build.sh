#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "=== Building Frontend (React) ==="
cd frontend/courses-platform
npm install
npm run build
cd ../..

echo "=== Installing Python dependencies ==="
pip install -r backend/requirements.txt

echo "=== Collecting static files ==="
python backend/manage.py collectstatic --no-input

echo "=== Running Database Migrations ==="
python backend/manage.py migrate
