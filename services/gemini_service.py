"""Integração com a API do Gemini: análise técnica com texto, contexto e fotos."""
import base64
import json
import time
import mimetypes
import requests

from . import prompts

MODEL = "gemini-3.6-flash"
ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"

MIME_PERMITIDOS = {"image/jpeg", "image/png", "image/webp"}


class ErroApiGemini(Exception):
    pass


def _mime_type(nome_arquivo: str) -> str | None:
    tipo, _ = mimetypes.guess_type(nome_arquivo)
    return tipo if tipo in MIME_PERMITIDOS else None


def analisar_documento(api_key: str, tipo_documento: str, texto_documento: str,
                        contexto_empresa: str | None = None,
                        fotos: list[tuple[str, bytes]] | None = None) -> dict:
    """
    fotos: lista de tuplas (nome_arquivo, bytes_da_imagem)
    """
    system_prompt = prompts.para_tipo(tipo_documento)

    texto_usuario = f"Analise o seguinte documento ({tipo_documento}):\n\n{texto_documento}"
    if contexto_empresa and contexto_empresa.strip():
        texto_usuario += (
            "\n\n---\nCONTEXTO ADICIONAL FORNECIDO PELO TÉCNICO SOBRE O AMBIENTE DA EMPRESA:\n"
            + contexto_empresa
        )

    partes = [{"text": texto_usuario}]

    fotos = fotos or []
    if fotos:
        partes.append({
            "text": (
                "\n---\nAs imagens a seguir são fotos reais do ambiente da empresa, fornecidas "
                "para ajudar a identificar riscos visíveis (organização, EPIs em uso, estado de "
                "máquinas/equipamentos, sinalização, condições do local etc.) e cruzar com o que "
                "está descrito no documento e nos riscos apontados."
            )
        })
        for nome, conteudo in fotos:
            mime = _mime_type(nome)
            if not mime:
                continue
            partes.append({
                "inlineData": {
                    "mimeType": mime,
                    "data": base64.b64encode(conteudo).decode("utf-8"),
                }
            })

    payload = {
        "systemInstruction": {"parts": [{"text": system_prompt}]},
        "contents": [{"role": "user", "parts": partes}],
        "generationConfig": {
            "maxOutputTokens": 8000,
            "responseMimeType": "application/json",
        },
    }

    status, body = _enviar_com_retry(api_key, payload)

    if status is None or status >= 400:
        raise ErroApiGemini(f"Erro na API ({status}): {body}")

    resposta = json.loads(body)
    texto_bruto = resposta["candidates"][0]["content"]["parts"][0]["text"].strip()

    if texto_bruto.startswith("```"):
        primeira_quebra = texto_bruto.find("\n")
        ultima_cerca = texto_bruto.rfind("```")
        if 0 <= primeira_quebra < ultima_cerca:
            texto_bruto = texto_bruto[primeira_quebra + 1:ultima_cerca].strip()

    try:
        return json.loads(texto_bruto)
    except json.JSONDecodeError:
        return {
            "resumo_geral": "Não foi possível interpretar a resposta da IA.",
            "nota_conformidade": 0,
            "achados": [],
        }


def _enviar_com_retry(api_key: str, payload: dict, max_tentativas: int = 5):
    """Erros transitórios (500/503) são reenviados com espera crescente.
    Erros como 400/429 não são reenviados, pois tentar de novo não resolve."""
    headers = {"x-goog-api-key": api_key, "Content-Type": "application/json"}

    for tentativa in range(1, max_tentativas + 1):
        resposta = requests.post(ENDPOINT, headers=headers, json=payload, timeout=120)
        transitorio = resposta.status_code in (500, 503)

        if resposta.ok or not transitorio or tentativa == max_tentativas:
            return resposta.status_code, resposta.text

        time.sleep(2.5 * tentativa)

    return None, "Falha desconhecida."
