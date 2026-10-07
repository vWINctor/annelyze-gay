/* ===== Utilitários e sessão (localStorage) ===== */
const $ = (id) => document.getElementById(id);

const Sessao = {
  usuarios: () => JSON.parse(localStorage.getItem("usuarios") || "[]"),
  salvarUsuarios: (lista) => localStorage.setItem("usuarios", JSON.stringify(lista)),
  atual: () => JSON.parse(localStorage.getItem("usuarioAtual") || "null"),
  entrar: (usuario) => localStorage.setItem("usuarioAtual", JSON.stringify(usuario)),
  sair: () => localStorage.removeItem("usuarioAtual"),
};

/* ===== Mensagem central ===== */
function mostrarAviso(texto) {
  document.querySelector(".toast")?.remove();
  const aviso = document.createElement("div");
  aviso.className = "toast";
  aviso.textContent = texto;
  document.body.appendChild(aviso);
  setTimeout(() => aviso.remove(), 1800);
}

/* ===== Função para baixar arquivo TXT ===== */
function baixarArquivoTxt(nomeArquivo, conteudo) {
  const blob = new Blob([conteudo], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomeArquivo;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ===== Footer: data atual ===== */
function iniciarFooter() {
  const elemData = $("dataAtual");
  if (elemData) {
    elemData.textContent = new Date().toLocaleDateString("pt-BR", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
  }
}

/* ===== Dados de informações ===== */
const DADOS_INFO = {
  empresa: {
    titulo: "Empresa",
    conteudo: "<p><strong>Empresa:</strong> Diários online</p><p style='margin-top:0.5rem; color:var(--cinza-300);'>Sua plataforma privada para guardar momentos com segurança.</p>"
  },
  clientes: {
    titulo: "Clientes",
    conteudo: "<p><strong>Clientes:</strong> Estudantes, professores e demais usuários.</p>"
  },
  telefones: {
    titulo: "Telefones",
    conteudo: "<p><strong>Telefones:</strong> 32 99999-9999</p>"
  },
  email: {
    titulo: "Email",
    conteudo: "<p><strong>Email:</strong> diario@gmail.com</p>"
  }
};

/* ===== Janela Modal Central ===== */
function abrirModal(html) {
  const modal = $("modal");
  const modalConteudo = $("modalConteudo");
  if (modal && modalConteudo) {
    modalConteudo.innerHTML = html;
    modal.hidden = false;
  }
}

function fecharModal() {
  const modal = $("modal");
  if (modal) {
    modal.hidden = true;
  }
}

/* ===== Menu e Sidebar Lateral ===== */
function iniciarMenu() {
  const btnSobre = $("btn-sobre");
  const btnContato = $("btn-contato");
  const sidebarLeft = $("sidebarLeft");
  const sidebarOverlay = $("sidebarOverlay");
  const sidebarFechar = $("sidebarFechar");

  function abrirSidebar(secao) {
    if (sidebarLeft && sidebarOverlay) {
      sidebarLeft.classList.add("active");
      sidebarOverlay.classList.add("active");

      const elSecao = $(`sidebar-secao-${secao}`);
      if (elSecao) elSecao.scrollIntoView({ behavior: "smooth" });
    }
  }

  function fecharSidebar() {
    if (sidebarLeft && sidebarOverlay) {
      sidebarLeft.classList.remove("active");
      sidebarOverlay.classList.remove("active");
    }
  }

  if (btnSobre) {
    btnSobre.addEventListener("click", (e) => {
      e.preventDefault();
      abrirSidebar("sobre");
    });
  }

  if (btnContato) {
    btnContato.addEventListener("click", (e) => {
      e.preventDefault();
      abrirSidebar("contato");
    });
  }

  if (sidebarFechar) sidebarFechar.addEventListener("click", fecharSidebar);
  if (sidebarOverlay) sidebarOverlay.addEventListener("click", fecharSidebar);

  // Clicks nos links da sidebar exibem conteúdo no centro (modal)
  document.querySelectorAll("[data-info]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const chave = link.dataset.info;
      const info = DADOS_INFO[chave];
      if (info) {
        fecharSidebar();
        abrirModal(`<h2>${info.titulo}</h2><div style="margin-top: 1rem;">${info.conteudo}</div>`);
      }
    });
  });

  const btnModalFechar = $("modalFechar");
  if (btnModalFechar) btnModalFechar.addEventListener("click", fecharModal);

  const modal = $("modal");
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) fecharModal();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      fecharSidebar();
      fecharModal();
    }
  });
}

/* ===== Cabeçalho ===== */
function iniciarCabecalho() {
  const usuario = Sessao.atual();
  const pagina = document.body.dataset.page;
  if (pagina === "diario" && usuario) {
    const userName = $("userName");
    if (userName) userName.textContent = usuario.nome;
    const linkInicio = $("linkInicio");
    if (linkInicio) linkInicio.href = "final.html";
    
    const itemLogin = $("itemLogin");
    if (itemLogin) {
      const sair = itemLogin.querySelector("a");
      if (sair) {
        sair.textContent = "Sair";
        sair.href = "index.html";
        sair.addEventListener("click", () => Sessao.sair());
      }
    }
  }
}

/* ===== Formulários ===== */
function campoVazio(...ids) {
  return ids.some((id) => {
    const el = $(id);
    return !el || !el.value.trim();
  });
}

function iniciarLogin() {
  const form = $("formLogin");
  if (!form) return;
  
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const msg = $("mensagem");

    if (campoVazio("email", "senha")) {
      if (msg) msg.textContent = "Preencha todos os campos.";
      return;
    }

    const email = $("email").value.trim().toLowerCase();
    const senha = $("senha").value;
    const usuarios = Sessao.usuarios();
    const cadastrado = usuarios.find((u) => u.email === email);

    if (cadastrado && cadastrado.senha && cadastrado.senha !== senha) {
      if (msg) msg.textContent = "Senha incorreta.";
      return;
    }

    const usuarioAtual = {
      nome: cadastrado ? cadastrado.nome : email.split("@")[0],
      email: email
    };

    Sessao.entrar(usuarioAtual);
    window.location.href = "final.html";
  });
}

function iniciarCadastro() {
  const form = $("formCadastro");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const msg = $("mensagem");

    if (campoVazio("nome", "email", "senha")) {
      if (msg) msg.textContent = "Preencha os campos obrigatórios.";
      return;
    }

    const usuario = {
      nome: $("nome").value.trim(),
      email: $("email").value.trim().toLowerCase(),
      senha: $("senha").value,
      cpf: $("cpf") ? $("cpf").value.trim() : "",
      endereco: $("endereco") ? $("endereco").value.trim() : ""
    };

    const lista = Sessao.usuarios().filter((u) => u.email !== usuario.email);
    lista.push(usuario);
    Sessao.salvarUsuarios(lista);

    // Formata o conteúdo do arquivo TXT exatamente como solicitado
    const conteudoTxt = `Nome: ${usuario.nome}\nCPF:  ${usuario.cpf}\nEndereço: ${usuario.endereco}\nEmail: ${usuario.email}\nSenha: ${usuario.senha}`;

    // Dispara o download do arquivo .txt
    baixarArquivoTxt(`cadastro_${usuario.nome.replace(/\s+/g, "_").toLowerCase()}.txt`, conteudoTxt);

    Sessao.entrar({ nome: usuario.nome, email: usuario.email });

    // Aguarda meio segundo para o navegador concluir o download antes de mudar de página
    setTimeout(() => {
      window.location.href = "final.html";
    }, 500);
  });
}

/* ===== Diário ===== */
function iniciarDiario() {
  const u = Sessao.atual();
  if (!u) return;
  const chave = "notas_" + u.email;
  let humor = "";

  const lerNotas = () => JSON.parse(localStorage.getItem(chave) || "[]");

  function desenharNotas() {
    const lista = $("listaNotas");
    if (!lista) return;
    lista.innerHTML = "";
    const notas = lerNotas();
    if (!notas.length) {
      lista.innerHTML = "<li>Nenhuma nota ainda. Escreva a primeira acima.</li>";
      return;
    }
    notas.slice().reverse().forEach((n) => {
      const li = document.createElement("li");
      const data = document.createElement("small");
      data.textContent = `${n.humor} ${n.data}`;
      const texto = document.createElement("p");
      texto.textContent = n.texto;
      li.append(data, texto);
      lista.appendChild(li);
    });
  }

  const moods = $("moods");
  if (moods) {
    moods.addEventListener("click", (e) => {
      const botao = e.target.closest(".mood");
      if (!botao) return;
      humor = botao.dataset.mood;
      document.querySelectorAll(".mood").forEach((b) => b.classList.toggle("ativo", b === botao));
    });
  }

  const btnSalvar = $("btnSalvar");
  if (btnSalvar) {
    btnSalvar.addEventListener("click", () => {
      const notaElem = $("nota");
      const msg = $("mensagem");
      const texto = notaElem ? notaElem.value.trim() : "";
      if (!humor || !texto) {
        if (msg) msg.textContent = "Escolha um humor e escreva sua nota.";
        return;
      }
      const notas = lerNotas();
      notas.push({ humor, texto, data: new Date().toLocaleString("pt-BR") });
      localStorage.setItem(chave, JSON.stringify(notas));
      if (notaElem) notaElem.value = "";
      if (msg) msg.textContent = "";
      mostrarAviso("Nota salva!");
      desenharNotas();
    });
  }

  desenharNotas();
}

/* ===== Tema ===== */
function aplicarTema() {
  document.body.classList.toggle("tema-claro", localStorage.getItem("tema") === "claro");
}

function notasDoUsuario() {
  const u = Sessao.atual();
  if (!u) return [];
  return JSON.parse(localStorage.getItem("notas_" + u.email) || "[]");
}

/* ===== Configurações, Calendário e Estatísticas ===== */
function abrirConfiguracoes() {
  const claro = localStorage.getItem("tema") === "claro";
  abrirModal(`
    <h2>Configurações</h2>
    <label>Cor do site</label>
    <button type="button" class="btn" id="btnTema">${claro ? "Voltar para o site escuro" : "Mudar site para branco"}</button>
    <label for="selIdioma">Idioma</label>
    <select id="selIdioma">
      <option>Português</option>
      <option>English</option>
      <option>Español</option>
    </select>`);

  const btnTema = $("btnTema");
  if (btnTema) {
    btnTema.addEventListener("click", () => {
      localStorage.setItem("tema", document.body.classList.contains("tema-claro") ? "escuro" : "claro");
      aplicarTema();
      abrirConfiguracoes();
    });
  }
}

const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
               "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
let calAno, calMes;

function abrirCalendario() {
  const hoje = new Date();
  calAno = hoje.getFullYear();
  calMes = hoje.getMonth();
  desenharCalendario();
}

function desenharCalendario() {
  const humorDoDia = {};
  notasDoUsuario().forEach((n) => {
    const m = n.data.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (m && Number(m[2]) - 1 === calMes && Number(m[3]) === calAno) humorDoDia[Number(m[1])] = n.humor;
  });

  const hoje = new Date();
  const primeiroDia = new Date(calAno, calMes, 1).getDay();
  const totalDias = new Date(calAno, calMes + 1, 0).getDate();

  let linhas = "<tr>" + "<td></td>".repeat(primeiroDia);
  for (let d = 1; d <= totalDias; d++) {
    const ehHoje = d === hoje.getDate() && calMes === hoje.getMonth() && calAno === hoje.getFullYear();
    const emoji = humorDoDia[d] ? `<small>${humorDoDia[d]}</small>` : "";
    linhas += `<td class="${ehHoje ? "hoje" : ""}">${d}${emoji}</td>`;
    if ((primeiroDia + d) % 7 === 0 && d < totalDias) linhas += "</tr><tr>";
  }
  linhas += "</tr>";

  abrirModal(`
    <h2>Calendário</h2>
    <p class="cal-ano">${calAno}</p>
    <p class="cal-mes">${MESES[calMes]}</p>
    <div class="cal-nav">
      <button type="button" class="btn" data-nav="-1">‹ Anterior</button>
      <button type="button" class="btn" data-nav="1">Próximo ›</button>
    </div>
    <table class="cal">
      <thead><tr>${DIAS_SEMANA.map((s) => `<th>${s}</th>`).join("")}</tr></thead>
      <tbody>${linhas}</tbody>
    </table>`);
}

const PESO_HUMOR = { "😄": 5, "🙂": 4, "😐": 3, "😔": 2, "😡": 1 };

function abrirEstatisticas() {
  const notas = notasDoUsuario();
  if (!notas.length) {
    abrirModal("<h2>Estatísticas</h2><p>Nenhuma nota ainda. Salve uma nota com humor para ver a média.</p>");
    return;
  }
  const contagem = {};
  Object.keys(PESO_HUMOR).forEach((e) => (contagem[e] = 0));
  let soma = 0;
  notas.forEach((n) => { contagem[n.humor]++; soma += PESO_HUMOR[n.humor]; });

  const media = soma / notas.length;
  const emojiMedio = Object.keys(PESO_HUMOR).reduce((a, b) =>
    Math.abs(PESO_HUMOR[a] - media) < Math.abs(PESO_HUMOR[b] - media) ? a : b);

  const barras = Object.keys(contagem).map((e) => `
    <div class="barra-linha">
      <span>${e}</span>
      <div class="barra"><span style="width:${(contagem[e] / notas.length) * 100}%"></span></div>
      <span>${contagem[e]}</span>
    </div>`).join("");

  abrirModal(`
    <h2>Estatísticas</h2>
    <p class="media">Humor médio: <strong>${media.toFixed(1)} / 5</strong> ${emojiMedio}</p>
    <p class="media">Dias registrados: <strong>${notas.length}</strong></p>
    ${barras}`);
}

function iniciarPaineis() {
  if ($("btnConfig")) $("btnConfig").addEventListener("click", abrirConfiguracoes);
  if ($("btnCalendario")) $("btnCalendario").addEventListener("click", abrirCalendario);
  if ($("btnEstatisticas")) $("btnEstatisticas").addEventListener("click", abrirEstatisticas);

  const modalConteudo = $("modalConteudo");
  if (modalConteudo) {
    modalConteudo.addEventListener("click", (e) => {
      const botao = e.target.closest("[data-nav]");
      if (!botao) return;
      calMes += Number(botao.dataset.nav);
      if (calMes < 0) { calMes = 11; calAno--; }
      if (calMes > 11) { calMes = 0; calAno++; }
      desenharCalendario();
    });
  }
}

function iniciarImagens() {
  document.querySelectorAll(".img-slot img").forEach((img) => {
    const remover = () => img.remove();
    img.addEventListener("error", remover);
    if (img.complete && img.naturalWidth === 0) remover();
  });
}

/* ===== Inicialização principal (após carregar o DOM) ===== */
document.addEventListener("DOMContentLoaded", () => {
  const pagina = document.body.dataset.page;

  if (pagina === "diario" && !Sessao.atual()) {
    window.location.href = "login.html";
    return;
  }

  aplicarTema();
  iniciarFooter();
  iniciarMenu();
  iniciarCabecalho();

  if (pagina === "home") iniciarImagens();
  if (pagina === "login") iniciarLogin();
  if (pagina === "cadastro") iniciarCadastro();
  if (pagina === "diario") {
    iniciarDiario();
    iniciarPaineis();
  }
});