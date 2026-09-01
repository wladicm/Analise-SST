// ---------- Ícones SVG (inline) ----------
const SVG = {
  alerta: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  alertaTri: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  circulo: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>',
  banco: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l7 3v5a7 7 0 0 1-7 8 7 7 0 0 1-7-8V5l7-3z"/></svg>',
  ok: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>',
  x: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
  info: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
  lei: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>',
  lupa: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
  recomendacao: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>',
  spinner: '<span class="spinner" role="status" aria-hidden="true"></span>',
  spinnerEscuro: '<span class="spinner spinner--escuro" role="status" aria-hidden="true"></span>'
};

const SEV = {
  critica: { rotulo: "Crítica", cor: "#b91c1c", ico: SVG.alertaTri },
  alta:    { rotulo: "Alta",    cor: "#c2410c", ico: SVG.alertaTri },
  media:   { rotulo: "Média",   cor: "#b45309", ico: SVG.alerta },
  baixa:   { rotulo: "Baixa",   cor: "#15803d", ico: SVG.circulo }
};

// ---------- Toasts ----------
const contToasts = document.getElementById("toasts");

function toast(mensagem, tipo) {
  tipo = tipo || "info";
  const el = document.createElement("div");
  el.className = "toast toast--" + tipo;
  el.innerHTML =
    (tipo === "ok" ? SVG.ok : tipo === "erro" ? SVG.x : tipo === "aviso" ? SVG.alerta : SVG.info) +
    "<div>" + mensagem + "</div>";
  contToasts.appendChild(el);
  setTimeout(() => {
    el.classList.add("fechando");
    setTimeout(() => el.remove(), 220);
  }, 5200);
}

// ---------- Navegação entre abas ----------
const botoesAba = document.querySelectorAll(".aba-btn");
botoesAba.forEach(btn => {
  btn.addEventListener("click", () => {
    botoesAba.forEach(b => {
      b.classList.toggle("ativa", b === btn);
      b.setAttribute("aria-selected", b === btn ? "true" : "false");
    });
    document.querySelectorAll(".conteudo-aba").forEach(c => c.classList.remove("ativa"));
    document.getElementById("aba-" + btn.dataset.aba).classList.add("ativa");
  });
});

// ---------- Dropzone genérico ----------
function configurarDropzone(zone, input, aoMudar) {
  const rotuloArquivo = zone.querySelector(".dz-arquivo");
  const titulo = zone.querySelector(".dz-titulo");

  zone.addEventListener("click", () => input.click());

  zone.addEventListener("dragenter", e => { e.preventDefault(); zone.classList.add("arrastando"); });
  zone.addEventListener("dragover", e => { e.preventDefault(); zone.classList.add("arrastando"); });
  zone.addEventListener("dragleave", e => {
    if (!zone.contains(e.relatedTarget)) zone.classList.remove("arrastando");
  });
  zone.addEventListener("drop", e => {
    e.preventDefault();
    zone.classList.remove("arrastando");
    input.files = e.dataTransfer.files;
    input.dispatchEvent(new Event("change"));
  });

  input.addEventListener("change", () => {
    const arquivos = Array.from(input.files);
    const tem = arquivos.length > 0;
    zone.classList.toggle("tem-arquivo", tem);

    if (tem) {
      const nome = arquivos.map(f => f.name).join(", ");
      rotuloArquivo.textContent = nome;
      rotuloArquivo.hidden = false;
      titulo.textContent = arquivos.length > 1 ? arquivos.length + " arquivos selecionados" : "Arquivo selecionado";
    } else {
      rotuloArquivo.hidden = true;
      titulo.textContent = zone.dataset.titulo || "";
    }
    if (aoMudar) aoMudar(arquivos);
  });
}

// ---------- ABA 1: Análise ----------
const arquivoAnalise = document.getElementById("arquivoAnalise");
const btnAnalisar = document.getElementById("btnAnalisar");
const statusAnalise = document.getElementById("statusAnalise");
const contextoEmpresa = document.getElementById("contextoEmpresa");
const fotosEmpresa = document.getElementById("fotosEmpresa");
const miniaturas = document.getElementById("miniaturas");
const resultadoAnalise = document.getElementById("resultadoAnalise");
const dzAnalise = document.getElementById("dzAnalise");
const dzFotos = document.getElementById("dzFotos");

dzAnalise.dataset.titulo = "Arraste o documento (.docx) ou clique para escolher";
dzFotos.dataset.titulo = "Adicionar fotos (clique para selecionar)";

configurarDropzone(dzAnalise, arquivoAnalise, () => {
  btnAnalisar.disabled = !arquivoAnalise.files.length;
});

configurarDropzone(dzFotos, fotosEmpresa, arquivos => {
  miniaturas.innerHTML = "";
  arquivos.forEach(foto => {
    const url = URL.createObjectURL(foto);
    const div = document.createElement("div");
    div.className = "miniatura";
    const img = document.createElement("img");
    img.src = url;
    img.alt = foto.name;
    const nome = document.createElement("div");
    nome.className = "miniatura-nome";
    nome.textContent = foto.name;
    div.appendChild(img);
    div.appendChild(nome);
    miniaturas.appendChild(div);
  });
});

btnAnalisar.addEventListener("click", async () => {
  if (!arquivoAnalise.files.length) return;

  btnAnalisar.disabled = true;
  btnAnalisar.dataset.textoOriginal = btnAnalisar.innerHTML;
  btnAnalisar.innerHTML = SVG.spinner + " Analisando...";
  statusAnalise.innerHTML = fotosEmpresa.files.length > 0
    ? SVG.spinnerEscuro + " Analisando documento e fotos com IA (pode levar mais tempo com imagens)..."
    : SVG.spinnerEscuro + " Analisando com IA (pode levar alguns segundos)...";
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
    statusAnalise.textContent = "";
    toast("Análise concluída com sucesso.", "ok");
  } catch (erro) {
    statusAnalise.textContent = "";
    toast("Falha ao analisar o documento: " + erro.message, "erro");
  } finally {
    btnAnalisar.disabled = false;
    btnAnalisar.innerHTML = btnAnalisar.dataset.textoOriginal;
  }
});

function notaGrade(nota) {
  const n = Number(nota) || 0;
  if (n >= 90) return { texto: "Excelente", cor: "#15803d", fundo: "#f0fdf4", borda: "#bbf7d0" };
  if (n >= 75) return { texto: "Boa", cor: "#0f766e", fundo: "#f0fdfa", borda: "#99f6e4" };
  if (n >= 50) return { texto: "Regular", cor: "#b45309", fundo: "#fffbeb", borda: "#fde68a" };
  if (n >= 25) return { texto: "Baixa", cor: "#c2410c", fundo: "#fff7ed", borda: "#fed7aa" };
  return { texto: "Crítica", cor: "#b91c1c", fundo: "#fef2f2", borda: "#fecaca" };
}

function anelNota(nota) {
  const n = Math.max(0, Math.min(100, Number(nota) || 0));
  const cor = notaGrade(n).cor;
  const raio = 46;
  const circunf = 2 * Math.PI * raio;
  const traco = (n / 100) * circunf;

  return `
    <div class="anel-nota" title="Nota de conformidade estimada">
      <svg width="128" height="128" viewBox="0 0 120 120" role="img" aria-label="Nota de conformidade estimada: ${n} de 100">
        <circle class="anel-bg" cx="60" cy="60" r="${raio}"/>
        <circle class="anel-valor" cx="60" cy="60" r="${raio}"
                pathLength="100"
                stroke-dasharray="${n} 100"
                stroke="${cor}"/>
        <text class="nota-num" x="60" y="58" text-anchor="middle" dominant-baseline="middle">${n}</text>
        <text class="nota-rotulo" x="60" y="74" text-anchor="middle">de 100</text>
      </svg>
    </div>`;
}

function exibirResultado(resultado) {
  resultadoAnalise.innerHTML = "";
  const achados = resultado.achados || [];

  const grade = notaGrade(resultado.nota_conformidade);
  const resumo = document.createElement("div");
  resumo.className = "card resumo-analise";
  resumo.innerHTML =
    anelNota(resultado.nota_conformidade) +
    `<div class="resumo-texto">
       <h3>Resumo geral</h3>
       <p>${escapeHtml(resultado.resumo_geral || "Sem resumo disponível.")}</p>
       <span class="resumo-grade" style="color:${grade.cor}; background:${grade.fundo}; border:1px solid ${grade.borda};">
         Conformidade ${grade.texto}
       </span>
     </div>`;
  resultadoAnalise.appendChild(resumo);

  if (achados.length) {
    const contagens = { critica: 0, alta: 0, media: 0, baixa: 0 };
    const ordem = { critica: 0, alta: 1, media: 2, baixa: 3 };

    achados.forEach(a => {
      const sev = normalizar(a.severidade);
      if (contagens[sev] !== undefined) contagens[sev]++;
    });

    const contadores = document.createElement("div");
    contadores.className = "contadores";
    Object.keys(contagens).forEach(sev => {
      const n = contagens[sev];
      if (n === 0) return;
      const div = document.createElement("div");
      div.className = "contador contador--" + sev;
      div.innerHTML = `<span class="n">${n}</span><span class="l">${SEV[sev].rotulo}</span>`;
      contadores.appendChild(div);
    });
    resultadoAnalise.appendChild(contadores);

    const ordenados = [...achados].sort(
      (a, b) => (ordem[normalizar(a.severidade)] ?? 4) - (ordem[normalizar(b.severidade)] ?? 4)
    );

    ordenados.forEach(achado => {
      const sev = normalizar(achado.severidade);
      const meta = SEV[sev] || SEV.media;
      const titulo = achado.titulo || "Achado sem título";

      const div = document.createElement("article");
      div.className = "achado " + sev;
      div.innerHTML = `
        <div class="achado-corpo">
          <div class="achado-cabecalho">
            <span class="sev-chip">${meta.ico} ${meta.rotulo}</span>
            <h4 class="achado-titulo">${escapeHtml(titulo)}</h4>
          </div>
          ${achado.base_legal
            ? `<div class="achado-bloco">
                 <span class="b-rotulo">${SVG.lei} Base legal</span>
                 <div><span class="b-texto base-legal">${escapeHtml(achado.base_legal)}</span></div>
               </div>`
            : ""}
          ${achado.problema
            ? `<div class="achado-bloco">
                 <span class="b-rotulo">${SVG.lupa} Problema identificado</span>
                 <p class="b-texto" style="margin:0;">${escapeHtml(achado.problema)}</p>
               </div>`
            : ""}
          ${achado.recomendacao
            ? `<div class="achado-bloco achado-recomendacao">
                 <span class="b-rotulo">${SVG.recomendacao} Recomendação</span>
                 <p class="b-texto" style="margin:0;">${escapeHtml(achado.recomendacao)}</p>
               </div>`
            : ""}
        </div>`;
      resultadoAnalise.appendChild(div);
    });
  } else {
    const vazio = document.createElement("div");
    vazio.className = "card achado-vazio";
    vazio.innerHTML = `<p style="margin:0 0 6px;">${SVG.ok} <strong>Nenhum achado registrado.</strong></p>
      <p style="margin:0; font-size:13px;">Revise o conteúdo manualmente antes do uso oficial.</p>`;
    resultadoAnalise.appendChild(vazio);
  }
}

function normalizar(sev) {
  return (sev || "").toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
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
const dzFormatacao = document.getElementById("dzFormatacao");

dzFormatacao.dataset.titulo = "Arraste o documento (.docx) ou clique para escolher";

configurarDropzone(dzFormatacao, arquivoFormatacao, () => {
  btnFormatar.disabled = !arquivoFormatacao.files.length;
});

btnFormatar.addEventListener("click", async () => {
  if (!arquivoFormatacao.files.length) return;

  btnFormatar.disabled = true;
  btnFormatar.dataset.textoOriginal = btnFormatar.innerHTML;
  btnFormatar.innerHTML = SVG.spinner + " Formatando...";
  statusFormatacao.innerHTML = SVG.spinnerEscuro + " Aplicando formatação...";

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

    statusFormatacao.textContent = "";
    toast("Documento formatado baixado com sucesso.", "ok");
  } catch (erro) {
    statusFormatacao.textContent = "";
    toast("Falha ao formatar o documento: " + erro.message, "erro");
  } finally {
    btnFormatar.disabled = false;
    btnFormatar.innerHTML = btnFormatar.dataset.textoOriginal;
  }
});
