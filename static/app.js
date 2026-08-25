// ---------- Navegação entre abas ----------
document.querySelectorAll(".aba-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".aba-btn").forEach(b => b.classList.remove("ativa"));
        document.querySelectorAll(".conteudo-aba").forEach(c => c.classList.remove("ativa"));
        btn.classList.add("ativa");
        document.getElementById("aba-" + btn.dataset.aba).classList.add("ativa");
    });
});

// ---------- ABA 1: Análise ----------
const arquivoAnalise = document.getElementById("arquivoAnalise");
const btnAnalisar = document.getElementById("btnAnalisar");
const statusAnalise = document.getElementById("statusAnalise");
const contextoEmpresa = document.getElementById("contextoEmpresa");
const fotosEmpresa = document.getElementById("fotosEmpresa");
const miniaturas = document.getElementById("miniaturas");
const resultadoAnalise = document.getElementById("resultadoAnalise");

arquivoAnalise.addEventListener("change", () => {
    btnAnalisar.disabled = !arquivoAnalise.files.length;
});

fotosEmpresa.addEventListener("change", () => {
    miniaturas.innerHTML = "";
    Array.from(fotosEmpresa.files).forEach(foto => {
        const url = URL.createObjectURL(foto);
        const div = document.createElement("div");
        div.className = "miniatura";
        div.innerHTML = `<img src="${url}"><div>${foto.name}</div>`;
        miniaturas.appendChild(div);
    });
});

btnAnalisar.addEventListener("click", async () => {
    if (!arquivoAnalise.files.length) return;

    btnAnalisar.disabled = true;
    statusAnalise.textContent = fotosEmpresa.files.length > 0
        ? "Analisando documento e fotos com IA (pode levar mais tempo com imagens)..."
        : "Analisando com IA (pode levar alguns segundos)...";
    resultadoAnalise.innerHTML = "";

    const dados = new FormData();
    dados.append("documento", arquivoAnalise.files[0]);
    dados.append("tipo_documento", document.getElementById("tipoDocumento").value);
    dados.append("contexto", contextoEmpresa.value);
    Array.from(fotosEmpresa.files).forEach(f => dados.append("fotos", f));

    try {
        const resposta = await fetch("/api/analisar", { method: "POST", body: dados });
        const json = await resposta.json();

        if (!resposta.ok) {
            throw new Error(json.erro || "Erro desconhecido");
        }

        exibirResultado(json);
        statusAnalise.textContent = "Análise concluída.";
        document.getElementById("btnFormatar").disabled = false;
    } catch (erro) {
        statusAnalise.textContent = "Erro na análise.";
        alert("Falha ao analisar o documento:\n\n" + erro.message);
    } finally {
        btnAnalisar.disabled = false;
    }
});

function exibirResultado(resultado) {
    resultadoAnalise.innerHTML = "";

    const resumo = document.createElement("div");
    resumo.className = "resumo-analise";
    resumo.textContent = `Resumo geral: ${resultado.resumo_geral} — Nota de conformidade estimada: ${resultado.nota_conformidade}/100`;
    resultadoAnalise.appendChild(resumo);

    const ordem = { critica: 0, alta: 1, media: 2, baixa: 3 };
    const achados = [...(resultado.achados || [])].sort(
        (a, b) => (ordem[normalizar(a.severidade)] ?? 4) - (ordem[normalizar(b.severidade)] ?? 4)
    );

    achados.forEach(achado => {
        const sev = normalizar(achado.severidade);
        const div = document.createElement("div");
        div.className = "achado " + sev;
        div.innerHTML = `
            <div>
                <div class="achado-titulo">[${(achado.severidade || "").toUpperCase()}] ${escapeHtml(achado.titulo || "")}</div>
                ${achado.base_legal ? `<div class="achado-base-legal">Base legal: ${escapeHtml(achado.base_legal)}</div>` : ""}
                <div>Problema: ${escapeHtml(achado.problema || "")}</div>
                <div class="achado-recomendacao">Recomendação: ${escapeHtml(achado.recomendacao || "")}</div>
            </div>`;
        resultadoAnalise.appendChild(div);
    });
}

function normalizar(sev) {
    return (sev || "").toLowerCase().replace("í", "i");
}

function escapeHtml(texto) {
    const div = document.createElement("div");
    div.textContent = texto;
    return div.innerHTML;
}

// ---------- ABA 2: Formatação ----------
const arquivoFormatacao = document.getElementById("arquivoFormatacao");
const btnFormatar = document.getElementById("btnFormatar");
const statusFormatacao = document.getElementById("statusFormatacao");

arquivoFormatacao.addEventListener("change", () => {
    btnFormatar.disabled = !arquivoFormatacao.files.length;
});

btnFormatar.addEventListener("click", async () => {
    if (!arquivoFormatacao.files.length) return;

    btnFormatar.disabled = true;
    statusFormatacao.textContent = "Formatando...";

    const dados = new FormData();
    dados.append("documento", arquivoFormatacao.files[0]);
    dados.append("quebra_pagina", document.getElementById("chkQuebraPagina").checked);
    dados.append("justificar", document.getElementById("chkJustificar").checked);
    dados.append("centralizar_titulos", document.getElementById("chkCentralizarTitulos").checked);
    dados.append("padronizar_tabelas", document.getElementById("chkPadronizarTabelas").checked);
    dados.append("aplicar_abnt", document.getElementById("chkAbnt").checked);

    try {
        const resposta = await fetch("/api/formatar", { method: "POST", body: dados });

        if (!resposta.ok) {
            const json = await resposta.json();
            throw new Error(json.erro || "Erro desconhecido");
        }

        const blob = await resposta.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;

        const disposicao = resposta.headers.get("Content-Disposition") || "";
        const match = disposicao.match(/filename="?([^"]+)"?/);
        a.download = match ? match[1] : "documento_formatado.docx";

        document.body.appendChild(a);
        a.click();
        a.remove();

        statusFormatacao.textContent = "Documento formatado baixado com sucesso.";
    } catch (erro) {
        statusFormatacao.textContent = "Erro ao formatar.";
        alert("Falha ao formatar o documento:\n\n" + erro.message);
    } finally {
        btnFormatar.disabled = false;
    }
});
