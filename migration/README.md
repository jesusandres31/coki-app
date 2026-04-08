# from project root (c:\Users\jesus\projects\mine\coki-app)
cd .\restore

# create venv
python -m venv .venv

# activate venv (PowerShell)
.\.venv\Scripts\Activate.ps1

# if activation is blocked once, run this, then activate again
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# install pyodbc
python -m pip install --upgrade pip
python -m pip install pyodbc

# run exporter
python .\export.py

# run loader
python .\load.py --dry-run
python .\load.py --pb-url http://127.0.0.1:8090 --csv-dir .\csv
