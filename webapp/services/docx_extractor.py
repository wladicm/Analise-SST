"""Extração de texto de documentos .docx, incluindo tabelas."""
from docx import Document


def extrair_texto(caminho_arquivo: str) -> str:
    doc = Document(caminho_arquivo)
    partes = []

    for elemento in doc.element.body:
        tag = elemento.tag.split('}')[-1]

        if tag == 'p':
            from docx.text.paragraph import Paragraph
            paragrafo = Paragraph(elemento, doc)
            texto = paragrafo.text.strip()
            if texto:
                estilo = paragrafo.style.name if paragrafo.style else ""
                if "Heading" in estilo or "Título" in estilo:
                    partes.append(f"\n## {texto}")
                else:
                    partes.append(texto)

        elif tag == 'tbl':
            from docx.table import Table
            tabela = Table(elemento, doc)
            partes.append("\n[TABELA]")
            for linha in tabela.rows:
                celulas = [c.text.strip() for c in linha.cells]
                partes.append(" | ".join(celulas))
            partes.append("[/TABELA]\n")

    return "\n".join(partes)
