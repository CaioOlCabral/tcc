// =================================================
// region VARIAVEIS
// =================================================

// Lista com os 118 elementos (vem do arquivo dados/elementos.js)
const ELEMENTOS = DADOS;

const CASAS_DECIMAIS_MASSA = 12;
const UNIDADE_MASSA = "u.m.a";

// Ícone de cada estado físico (lista de ícones: icons.getbootstrap.com)
const ICONES_ESTADO = {
    "sólido": "bi-square-fill",
    "líquido": "bi-droplet-fill",
    "gasoso": "bi-cloud-fill"
};

// Nome de cada categoria de cor (a cor fica no css/estilo.css)
const NOMES_TIPOS = {
    "hidrogenio": "Hidrogênio",
    "metal": "Metais",
    "ametal": "Ametais",
    "gas-nobre": "Gases nobres"
};

// Posição das séries que ficam separadas embaixo da tabela
const PRIMEIRO_LANTANIDEO = 57;
const PRIMEIRO_ACTINIDEO = 89;
const LINHA_LANTANIDEOS = 9;
const LINHA_ACTINIDEOS = 10;
const COLUNA_SERIES = 3;

// -------------------------------------------------
// end region VARIAVEIS
// -------------------------------------------------



// =================================================
// region ELEMENTOS HTML
// =================================================

const TABELA_PERIODICA = document.getElementById("tabela-periodica");
const LEGENDA_TIPOS = document.getElementById("legenda-tipos");
const LEGENDA_ESTADOS = document.getElementById("legenda-estados");

const CAMPO_PESQUISA = document.getElementById("campo-pesquisa");
const TEXTO_RESULTADO = document.getElementById("texto-resultado");

const POPUP_ELEMENTO = document.getElementById("popup-elemento");
const POPUP_TITULO = document.getElementById("popup-titulo");
const POPUP_CELULA = document.getElementById("popup-celula");
const POPUP_DADOS = document.getElementById("popup-dados");
const BOTAO_FECHAR = document.getElementById("botao-fechar");

// -------------------------------------------------
// end region ELEMENTOS HTML
// -------------------------------------------------



// =================================================
// region FUNCOES
// =================================================

// ---------- Tabela ----------

// Junta as categorias em 4 tipos de cor
function tipoDoElemento(elemento) {
    let tipo = "";

    switch(elemento.categoria) {
        case "hidrogênio":
            tipo = "hidrogenio";
            break;

        case "gás nobre":
            tipo = "gas-nobre";
            break;

        case "ametal":
            tipo = "ametal";
            break;

        default:
            tipo = "metal";
            break;
    }

    return tipo;
}


// Cria a célula (quadradinho) de um elemento
function criarCelula(elemento) {
    let celula = document.createElement("button");
    let tipo = tipoDoElemento(elemento);
    let icone = ICONES_ESTADO[elemento.estado];

    celula.className = `celula-elemento tipo-${tipo}`;
    celula.title = `${elemento.nome} (${elemento.estado})`;

    celula.innerHTML = `
        <span class="numero">${elemento.protons}</span>
        <i class="bi ${icone} icone-estado"></i>
        <span class="simbolo">${elemento.simbolo}</span>
        <span class="nome">${elemento.nome}</span>
    `;

    return celula;
}


// Coloca a célula na linha e coluna certas da grade
function posicionarCelula(celula, elemento) {
    let linha = elemento.periodo;
    let coluna = elemento.familia;

    if(elemento.categoria === "lantanídeo") {
        linha = LINHA_LANTANIDEOS;
        coluna = elemento.protons - PRIMEIRO_LANTANIDEO + COLUNA_SERIES;
    }
    else if(elemento.categoria === "actinídeo") {
        linha = LINHA_ACTINIDEOS;
        coluna = elemento.protons - PRIMEIRO_ACTINIDEO + COLUNA_SERIES;
    }

    celula.style.gridRow = linha;
    celula.style.gridColumn = coluna;
}


// Cria as células "57–71" e "89–103" no lugar das séries
function criarMarcador(texto, linha, coluna) {
    let marcador = document.createElement("div");

    marcador.className = "marcador-serie";
    marcador.textContent = texto;
    marcador.style.gridRow = linha;
    marcador.style.gridColumn = coluna;

    TABELA_PERIODICA.appendChild(marcador);
}


function montarTabela() {
    for(let e of ELEMENTOS) {
        let celula = criarCelula(e);

        celula.id = `elemento-${e.protons}`;
        posicionarCelula(celula, e);

        celula.addEventListener("click", function() {
            abrirPopup(e);
        });

        TABELA_PERIODICA.appendChild(celula);
    }

    criarMarcador("57–71", 6, COLUNA_SERIES);
    criarMarcador("89–103", 7, COLUNA_SERIES);
}


function montarLegenda() {
    for(let tipo in NOMES_TIPOS) {
        LEGENDA_TIPOS.innerHTML += `
            <li class="tipo-${tipo}">
                <span class="amostra-cor"></span>
                ${NOMES_TIPOS[tipo]}
            </li>
        `;
    }

    for(let estado in ICONES_ESTADO) {
        LEGENDA_ESTADOS.innerHTML += `
            <li>
                <i class="bi ${ICONES_ESTADO[estado]}"></i>
                ${estado}
            </li>
        `;
    }
}


// ---------- Popup ----------
function formatarMassa(massa) {
    let opcoes = { maximumFractionDigits: CASAS_DECIMAIS_MASSA };
    let texto = massa.toLocaleString("pt-BR", opcoes);

    return `${texto} ${UNIDADE_MASSA}`;
}


// Coloca como expoente o número depois de s, p, d ou f
// Exemplo: "2p6" vira "2p<sup>6</sup>"
function formatarDistribuicao(texto) {
    return texto.replace(/([spdf])(\d+)/g, "$1<sup>$2</sup>");
}


function formatarQuanticos(quanticos) {
    return `
        n = ${quanticos.n},<br>
        l = ${quanticos.l},<br>
        m = ${quanticos.m},<br>
        s = ${quanticos.s}
    `;
}


function mostrarDados(elemento) {
    let distribuicao = elemento.configuracaoEletronica;
    let resumida = elemento.configuracaoEletronicaNaSerneDosGasesNobres;

    // Em um átomo neutro: elétrons = prótons = número atômico
    let dados = {
        "Nome": capitalizar(elemento.nome),
        "Símbolo": elemento.simbolo,
        "Número atômico": elemento.protons,
        "Prótons": elemento.protons,
        "Nêutrons": elemento.neutrons,
        "Elétrons": elemento.protons,
        "Massa atômica": formatarMassa(elemento.massaAtomica),
        "Categoria": capitalizar(elemento.categoria),
        "Estado (CATP)": capitalizar(elemento.estado),
        "Distribuição eletrônica": formatarDistribuicao(distribuicao),
        "Distribuição eletrônica na serne dos gases nobres": formatarDistribuicao(resumida),
        "Números quânticos": formatarQuanticos(elemento.numerosQuanticosPrincipais)
    };

    POPUP_DADOS.innerHTML = "";

    for(let rotulo in dados) {
        POPUP_DADOS.innerHTML += `
            <tr>
                <th>${rotulo}</th>
                <td>${dados[rotulo]}</td>
            </tr>
        `;
    }
}


function abrirPopup(elemento) {
    let celula = criarCelula(elemento);
    celula.classList.add("celula-grande");
    celula.tabIndex = -1;

    POPUP_TITULO.textContent = elemento.nome;
    POPUP_CELULA.innerHTML = "";
    POPUP_CELULA.appendChild(celula);

    mostrarDados(elemento);
    POPUP_ELEMENTO.showModal();
}


function fecharPopup() {
    POPUP_ELEMENTO.close();
}


// Clicar no fundo escuro também fecha o popup.
// Esse clique acontece no próprio <dialog>, fora do conteúdo.
function fecharAoClicarFora(evento) {
    if(evento.target === POPUP_ELEMENTO) {
        fecharPopup();
    }
}


// ---------- Pesquisa ----------

// Tira os acentos: "hélio" vira "helio"
function semAcento(texto) {
    let separado = texto.normalize("NFD");
    return separado.replace(/[\u0300-\u036f]/g, "");
}

// Primeira letra em maiúscula
function capitalizar(texto) {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
}


function combinaComPesquisa(elemento, busca) {
    let nome = semAcento(elemento.nome).toLowerCase();
    let simbolo = elemento.simbolo.toLowerCase();
    let distribuicao = elemento.configuracaoEletronica.toLowerCase();
    let resumida = elemento.configuracaoEletronicaNaSerneDosGasesNobres.toLowerCase();

    // Alguns valores começam com * (distribuição prevista). Tiramos o * para comparar.
    resumida = resumida.replace("*", "");

    if(!isNaN(busca)) {
        // A busca é só um número: compara com o número atômico
        return elemento.protons === Number(busca);
    }
    else {
        let achouNome = nome.includes(busca);
        let achouSimbolo = simbolo === busca;

        // endsWith = "termina com". Acha pelo último subnível ("2p6")
        // e também pela distribuição inteira ("1s2 2s2 2p6").
        let achouDistribuicao = distribuicao.endsWith(busca);

        // A forma resumida só acha se for escrita inteira ("[He] 2s2 2p6")
        let achouResumida = resumida === busca;

        return achouNome || achouSimbolo || achouDistribuicao || achouResumida;
    }
}


function mostrarResultado(busca, encontrados) {
    if(busca === "") {
        TEXTO_RESULTADO.textContent = "";
    }
    else if(encontrados === 0) {
        TEXTO_RESULTADO.textContent = "Nenhum elemento encontrado. Tente nome, símbolo, número ou distribuição.";
    }
    else if(encontrados === 1) {
        TEXTO_RESULTADO.textContent = "1 elemento encontrado.";
    }
    else {
        TEXTO_RESULTADO.textContent = `${encontrados} elementos encontrados.`;
    }
}


function pesquisar() {
    let texto = CAMPO_PESQUISA.value.trim();
    let busca = semAcento(texto).toLowerCase();
    let encontrados = 0;

    for(let e of ELEMENTOS) {
        let celula = document.getElementById(`elemento-${e.protons}`);

        if(busca === "" || combinaComPesquisa(e, busca)) {
            celula.classList.remove("apagada");
            encontrados++;
        }
        else {
            celula.classList.add("apagada");
        }
    }

    mostrarResultado(busca, encontrados);
}

// -------------------------------------------------
// end region FUNCOES
// -------------------------------------------------



// =================================================
// region EVENTOS
// =================================================

CAMPO_PESQUISA.addEventListener("input", pesquisar);

BOTAO_FECHAR.addEventListener("click", fecharPopup);
POPUP_ELEMENTO.addEventListener("click", fecharAoClicarFora);

// -------------------------------------------------
// end region EVENTOS
// -------------------------------------------------



// =================================================
// region INICIO
// =================================================

montarLegenda();
montarTabela();

// -------------------------------------------------
// FIM
// -------------------------------------------------
