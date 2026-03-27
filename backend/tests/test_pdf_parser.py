import io

import pytest
from fpdf import FPDF

from app.services.pdf_parser import PDFParser


def make_pdf(pages: list[str]) -> bytes:
    """Create a minimal PDF with one text line per page."""
    pdf = FPDF()
    for text in pages:
        pdf.add_page()
        pdf.set_font("Helvetica", size=12)
        pdf.cell(text=text)
    return bytes(pdf.output())


def test_extract_pages_single_page():
    pdf_bytes = make_pdf(["Hola mundo"])
    parser = PDFParser()
    result = parser.extract_pages(pdf_bytes)
    assert len(result) == 1
    assert result[0]["page_number"] == 1
    assert "Hola" in result[0]["text_content"]


def test_extract_pages_multi_page():
    pdf_bytes = make_pdf(["Primera página", "Segunda página", "Tercera página"])
    parser = PDFParser()
    result = parser.extract_pages(pdf_bytes)
    assert len(result) == 3
    assert result[0]["page_number"] == 1
    assert result[2]["page_number"] == 3


def test_extract_pages_returns_page_numbers_in_order():
    pdf_bytes = make_pdf(["Uno", "Dos"])
    result = PDFParser().extract_pages(pdf_bytes)
    assert [p["page_number"] for p in result] == [1, 2]


def test_is_pdf_valid():
    pdf_bytes = make_pdf(["test"])
    assert PDFParser.is_pdf(pdf_bytes) is True


def test_is_pdf_invalid():
    assert PDFParser.is_pdf(b"not a pdf at all") is False


def test_is_pdf_empty():
    assert PDFParser.is_pdf(b"") is False
