"""
run_notebook.py
Executes insurance_eda.ipynb and saves the fully executed notebook.
"""

import nbformat
from nbclient import NotebookClient

print("Reading insurance_eda.ipynb...")
with open('insurance_eda.ipynb', 'r', encoding='utf-8') as f:
    nb = nbformat.read(f, as_version=4)

client = NotebookClient(nb, timeout=300, kernel_name='python3')
print("Executing all notebook cells...")
client.execute()

output_path = 'insurance_eda.ipynb'
with open(output_path, 'w', encoding='utf-8') as f:
    nbformat.write(nb, f)

print(f"Notebook successfully executed and saved to {output_path}!")
