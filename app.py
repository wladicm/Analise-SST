import os
import tempfile
import uuid
from functools import wraps

from flask import Flask, render_template, request, jsonify, session, send_file, redirect, url_for

from services import docx_extractor, docx_formatter, gemini_service

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "troque-esta-chave-em-producao")

APP_PASSWORD = os.environ.get("APP_PASSWORD", "")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")

PASTA_TEMP = tempfile.gettempdir()


def login_requerido(f):
    @wraps(f)
    def decorado(*args, **kwargs):
        if not session.get("autenticado"):
            return redirect(url_for("login"))
        return f(*args, **kwargs)
    return decorado


@app.route("/login", methods=["GET", "POST"])
def login():
    erro = None
    if request.method == "POST":
        senha = request.form.get("senha", "")
        if APP_PASSWORD and senha == APP_PASSWORD:
            session["autenticado"] = True
            return redirect(url_for("index"))
        erro = "Senha incorreta."
    return render_template("login.html", erro=erro)


@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))


@app.route("/")
@login_requerido
def index():
    return render_template("index.html")


@app.route("/api/analisar", methods=["POST"])
@login_requerido
def api_analisar():
    if not GEMINI_API_KEY:
        return jsonify({"erro": "Chave da API do Gemini não configurada no servidor."}), 500

    arquivo = request.files.get("documento")
    tipo_documento = request.form.get("tipo_documento", "PGR")
    contexto = request.form.get("contexto", "")

    if not arquivo:
        return jsonify({"erro": "Nenhum documento enviado."}), 400

    caminho_temp = os.path.join(PASTA_TEMP, f"{uuid.uuid4()}.docx")
    arquivo.save(caminho_temp)

    try:
        texto = docx_extractor.extrair_texto(caminho_temp)

        fotos = []
        for foto in request.files.getlist("fotos"):
            if foto and foto.filename:
                fotos.append((foto.filename, foto.read()))

        resultado = gemini_service.analisar_documento(
            GEMINI_API_KEY, tipo_documento, texto, contexto, fotos
        )
        return jsonify(resultado)
    except gemini_service.ErroApiGemini as e:
        return jsonify({"erro": str(e)}), 502
    except Exception as e:
        return jsonify({"erro": f"Falha ao processar: {e}"}), 500
    finally:
        if os.path.exists(caminho_temp):
            os.remove(caminho_temp)


@app.route("/api/formatar", methods=["POST"])
@login_requerido
def api_formatar():
    arquivo = request.files.get("documento")
    if not arquivo:
        return jsonify({"erro": "Nenhum documento enviado."}), 400

    opcoes = {
        "quebra_pagina_titulos": request.form.get("quebra_pagina") == "true",
        "justificar_corpo": request.form.get("justificar") == "true",
        "centralizar_titulos": request.form.get("centralizar_titulos") == "true",
        "padronizar_tabelas": request.form.get("padronizar_tabelas") == "true",
        "aplicar_abnt": request.form.get("aplicar_abnt") == "true",
    }

    caminho_origem = os.path.join(PASTA_TEMP, f"{uuid.uuid4()}.docx")
    caminho_destino = os.path.join(PASTA_TEMP, f"{uuid.uuid4()}_formatado.docx")
    arquivo.save(caminho_origem)

    try:
        docx_formatter.formatar(caminho_origem, caminho_destino, opcoes)
        nome_saida = os.path.splitext(arquivo.filename)[0] + "_formatado.docx"

        # Lê o conteúdo pra memória antes de apagar os temporários, pra não
        # correr risco de apagar o arquivo antes do Flask terminar de enviá-lo.
        with open(caminho_destino, "rb") as f:
            conteudo = f.read()

        import io
        return send_file(
            io.BytesIO(conteudo),
            as_attachment=True,
            download_name=nome_saida,
            mimetype="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        )
    except Exception as e:
        return jsonify({"erro": f"Falha ao formatar: {e}"}), 500
    finally:
        for caminho in (caminho_origem, caminho_destino):
            if os.path.exists(caminho):
                os.remove(caminho)


if __name__ == "__main__":
    app.run(debug=True, port=5000)
