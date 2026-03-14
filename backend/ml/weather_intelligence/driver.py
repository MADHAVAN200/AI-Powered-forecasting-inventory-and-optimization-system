import subprocess
import os
import json
import time

dir_path = os.path.dirname(os.path.realpath(__file__))
notebook_path = os.path.join(dir_path, "train_weather.ipynb")
report_path = os.path.join(dir_path, "training_report.json")

print(f"Executing {notebook_path}...")
try:
    subprocess.run(["jupyter", "nbconvert", "--to", "notebook", "--execute", "--inplace", notebook_path], check=True)
    print("Notebook execution successful.")
    
    if os.path.exists(report_path):
        with open(report_path, 'r') as f:
            report = json.load(f)
        report["last_trained"] = time.strftime("%Y-%m-%d %H:%M:%S")
        report["status"] = "Federated Local Ready"
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=4)
        print("Updated Weather Intelligence training report with latest timestamp and accuracy.")
except Exception as e:
    print(f"Failed to execute Weather notebook: {e}")
    exit(1)
