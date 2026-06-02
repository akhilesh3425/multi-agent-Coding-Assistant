import markdown
from fpdf import FPDF
import sys
import os

md_file = sys.argv[1]
pdf_file = sys.argv[2]

with open(md_file, "r", encoding="utf-8") as f:
    md_text = f.read()

# Remove mermaid block because fpdf doesn't support it
lines = md_text.split('\n')
clean_lines = []
in_mermaid = False
for line in lines:
    if line.strip() == "```mermaid":
        in_mermaid = True
        continue
    if in_mermaid and line.strip() == "```":
        in_mermaid = False
        continue
    if not in_mermaid:
        clean_lines.append(line)

md_text = "\n".join(clean_lines)

html_text = markdown.markdown(md_text, extensions=['tables'])

class PDF(FPDF):
    pass

pdf = PDF()
pdf.add_page()
pdf.set_font("helvetica", size=12)

# Very basic HTML parsing for FPDF
try:
    pdf.write_html(html_text)
except Exception as e:
    # Fallback to plain text if HTML parsing fails
    pdf.multi_cell(0, 10, md_text.encode('latin-1', 'replace').decode('latin-1'))

pdf.output(pdf_file)
print(f"Generated {pdf_file}")
