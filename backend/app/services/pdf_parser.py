import io

import pdfplumber


class PDFParser:
    def extract_pages(self, file_bytes: bytes) -> list[dict]:
        """Return list of {"page_number": int, "text_content": str} dicts."""
        pages = []
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for i, page in enumerate(pdf.pages, start=1):
                text = page.extract_text(x_tolerance=3, y_tolerance=3) or ""
                pages.append({"page_number": i, "text_content": text.strip()})
        return pages

    @staticmethod
    def is_pdf(file_bytes: bytes) -> bool:
        """Check magic bytes for PDF signature."""
        return file_bytes[:4] == b"%PDF"
