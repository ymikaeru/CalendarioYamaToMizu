// --- ESTADO GLOBAL ---
let state = {
    mes: new Date().getMonth(),
    ano: new Date().getFullYear(),
    poesiaSelecionada: 0,
    temaFiltro: 'Todos',
    poesiasEscolhidas: Array(12).fill(null),
    todasPoesias: TODAS_POESIAS,
    compromissos: {}, // Formato: "YYYY-M-D": [{ desc: "...", cor: "..." }]
    layout: 'vertical' // ou 'square'
};

// --- FUNÇÕES ---

function carregarJSON(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const json = JSON.parse(e.target.result);

            let poesias = [];
            if (json.calendario) {
                // Formato do JSON que criamos (brasileiro)
                poesias = json.calendario.map(item => ({
                    title: item.poesia.titulo,
                    original: item.poesia.original,
                    translation: item.poesia.traducao,
                    leitura: item.poesia.leitura,
                    kigo: item.estacao_brasil,
                    month: item.mes // mes em português (1-12)
                }));
            } else if (Array.isArray(json)) {
                poesias = json;
            } else if (json.poesias || json.poems) {
                poesias = json.poesias || json.poems;
            }

            if (poesias.length > 0) {
                state.todasPoesias = poesias;
                state.poesiaSelecionada = 0;
                state.temaFiltro = 'Todos';

                // Se houver função atualizarSelects (não parece ser usada no código original, mas mantendo compatibilidade se existir)
                if (typeof atualizarSelects === 'function') atualizarSelects();

                atualizarCalendario();

                const statusEl = document.getElementById('json-status');
                if (statusEl) statusEl.textContent = `✅ ${poesias.length} poesias carregadas`;

                alert(`✅ ${poesias.length} poesias carregadas com sucesso!`);
            } else {
                alert('❌ Formato de JSON inválido.');
            }
        } catch (error) {
            alert('❌ Erro ao ler o arquivo JSON: ' + error.message);
        }
    };
    reader.readAsText(file);
}

function randomizarPoesia() {
    // Filtra poesias que são apropriadas para o mês atual
    const mesAtual = state.mes + 1;
    const poesiasDoMes = state.todasPoesias.filter(p => p.meses && p.meses.includes(mesAtual));

    if (poesiasDoMes.length === 0) {
        alert('Não há poesias disponíveis para este mês.');
        return;
    }

    // Identifica índices usados em OUTROS meses para evitar colisão
    const indicesUsadosOutrosMeses = new Set();
    state.poesiasEscolhidas.forEach((idx, m) => {
        if (m !== state.mes && idx !== null) {
            indicesUsadosOutrosMeses.add(idx);
        }
    });

    // Cria pool de candidatos excluindo os já usados
    let candidatos = poesiasDoMes.filter(p => {
        const realIndex = state.todasPoesias.indexOf(p);
        return !indicesUsadosOutrosMeses.has(realIndex);
    });

    // Se não sobrar opções únicas (muito raro), libera todas do mês
    if (candidatos.length === 0) {
        candidatos = poesiasDoMes;
    }

    // Escolhe uma nova aleatória
    const escolhida = candidatos[Math.floor(Math.random() * candidatos.length)];
    const indexReal = state.todasPoesias.indexOf(escolhida);

    // Salva na memória persistente
    state.poesiasEscolhidas[state.mes] = indexReal;

    // Atualiza visualização
    atualizarCalendario();
}

// Função para garantir que cada mês tenha uma poesia única ao iniciar
function inicializarPoesiasUnicas() {
    const novasEscolhas = Array(12).fill(null);
    const indicesUsados = new Set();

    for (let m = 0; m < 12; m++) {
        // Filtra poesias válidas para o mês (estação correta)
        // Nota: nossos dados usam 1-12 para meses
        const mesesValidos = state.todasPoesias.filter(p => p.meses && p.meses.includes(m + 1));

        // Remove as que já foram escolhidas para meses anteriores
        let candidatos = mesesValidos.filter(p => !indicesUsados.has(state.todasPoesias.indexOf(p)));

        // Se não sobrar nenhuma (caso raro), recicla as do mês mesmo que repetidas
        if (candidatos.length === 0) {
            candidatos = mesesValidos;
        }

        if (candidatos.length > 0) {
            // Escolhe aleatoriamente
            const escolhida = candidatos[Math.floor(Math.random() * candidatos.length)];
            const indexReal = state.todasPoesias.indexOf(escolhida);

            novasEscolhas[m] = indexReal;
            indicesUsados.add(indexReal);
        }
    }

    state.poesiasEscolhidas = novasEscolhas;
    console.log("Poesias inicializadas:", state.poesiasEscolhidas);
}

function randomizarAnoCompleto() {
    // Reutiliza a lógica de inicialização qu é robusta
    inicializarPoesiasUnicas();

    // Atualiza a visualização
    if (isGridView) {
        const gridView = document.getElementById('grid-view');
        gerarGradeAnual(gridView);
    } else {
        atualizarCalendario();
    }

    alert(`✅ Ano ${state.ano} randomizado com sucesso!\n\nCada mês recebeu uma poesia única (sem repetições).`);
}

function atualizarCalendario() {
    const mesSelect = document.getElementById('mesSelect');
    const anoInput = document.getElementById('anoInput');

    if (mesSelect) state.mes = parseInt(mesSelect.value);
    if (anoInput) state.ano = parseInt(anoInput.value);

    // PRIORIDADE: Usar a poesia já escolhida para este mês (persistencia)
    let indexPoesia = state.poesiasEscolhidas[state.mes];

    // Fallback de segurança: se por algum motivo for null, escolhe uma agora
    if (indexPoesia === null || indexPoesia === undefined || !state.todasPoesias[indexPoesia]) {
        const mesAtual = state.mes + 1;
        const possiveis = state.todasPoesias.findIndex(p => p.meses && p.meses.includes(mesAtual));
        indexPoesia = possiveis !== -1 ? possiveis : 0;

        // Salva para não perder
        state.poesiasEscolhidas[state.mes] = indexPoesia;
    }

    state.poesiaSelecionada = indexPoesia;
    let poesiaAtual = state.todasPoesias[state.poesiaSelecionada];

    // Fallback se poesiaAtual for undefined
    if (!poesiaAtual) {
        poesiaAtual = state.todasPoesias[0];
    }

    const fasesLua = obterDiasFasesLua(state.mes, state.ano);
    const dias = gerarCalendario(state.mes, state.ano);

    renderizarCalendario(poesiaAtual, fasesLua, dias);

    // Se estiver no modo Grade Anual, atualiza ela também
    if (typeof isGridView !== 'undefined' && isGridView) {
        const gridView = document.getElementById('grid-view');
        if (gridView) gerarGradeAnual(gridView);
    }
}

function gerarCalendario(mes, ano) {
    const primeiroDia = new Date(ano, mes, 1).getDay();
    const ultimoDia = new Date(ano, mes + 1, 0).getDate();

    const dias = [];

    for (let i = 0; i < primeiroDia; i++) {
        dias.push({ dia: '', mesAtual: false });
    }

    for (let i = 1; i <= ultimoDia; i++) {
        dias.push({ dia: i, mesAtual: true });
    }

    const diasRestantes = 42 - dias.length;
    for (let i = 0; i < diasRestantes; i++) {
        dias.push({ dia: '', mesAtual: false });
    }

    return dias;
}

function calcularPascoa(ano) {
    const a = ano % 19;
    const b = Math.floor(ano / 100);
    const c = ano % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const mesPascoa = Math.floor((h + l - 7 * m + 114) / 31);
    const diaPascoa = ((h + l - 7 * m + 114) % 31) + 1;

    return new Date(ano, mesPascoa - 1, diaPascoa);
}

function ehFeriado(dia, mes, ano) {
    // Força bruta para garantir o Natal
    if (mes === 11 && dia === 25) return 'Natal';

    const feriadoFixo = FERIADOS_BRASILEIROS[mes]?.find(f => f.dia === dia);
    if (feriadoFixo) return feriadoFixo.nome;

    const pascoa = calcularPascoa(ano);

    const carnaval = new Date(pascoa);
    carnaval.setDate(pascoa.getDate() - 47);
    if (mes === carnaval.getMonth() && dia === carnaval.getDate()) return 'Carnaval';

    const sextaSanta = new Date(pascoa);
    sextaSanta.setDate(pascoa.getDate() - 2);
    if (mes === sextaSanta.getMonth() && dia === sextaSanta.getDate()) return 'Sexta-feira Santa';

    const corpus = new Date(pascoa);
    corpus.setDate(pascoa.getDate() + 60);
    if (mes === corpus.getMonth() && dia === corpus.getDate()) return 'Corpus Christi';

    return null;
}

function obterDiasFasesLua(mes, ano) {
    const ultimoDia = new Date(ano, mes + 1, 0).getDate();
    const fases = { nova: null, crescente: null, cheia: null, minguante: null };

    for (let dia = 1; dia <= ultimoDia; dia++) {
        const data = new Date(ano, mes, dia);
        const conhecidaLuaNova = new Date(2000, 0, 6);
        const cicleLunar = 29.53058867;
        const diasDesde = (data - conhecidaLuaNova) / (1000 * 60 * 60 * 24);
        const fase = ((diasDesde % cicleLunar) + cicleLunar) % cicleLunar;

        if (fase < 1.5 && fases.nova === null) fases.nova = dia;
        else if (fase >= 6.5 && fase < 8.5 && fases.crescente === null) fases.crescente = dia;
        else if (fase >= 13.5 && fase < 15.5 && fases.cheia === null) fases.cheia = dia;
        else if (fase >= 20.5 && fase < 22.5 && fases.minguante === null) fases.minguante = dia;
    }

    return fases;
}

// Função auxiliar para dividir poema em 3 partes
function dividirPoemaEm3(texto) {
    if (!texto) return ['', '', ''];
    // Remove espaços extras e divide por espaços japoneses ou regulares
    const partes = texto.replace(/　/g, ' ').split(' ').filter(p => p.trim());
    const total = partes.length;

    if (total <= 3) {
        return partes.concat(['', '', '']).slice(0, 3);
    }

    // Divide em 3 grupos aproximadamente iguais
    const tamanho = Math.ceil(total / 3);
    return [
        partes.slice(0, tamanho).join(''),
        partes.slice(tamanho, tamanho * 2).join(''),
        partes.slice(tamanho * 2).join('')
    ];
}

// Função para gerar mini calendário (visão compacta)
function gerarMiniCalendario(mes, ano) {
    const primeiroDia = new Date(ano, mes, 1).getDay();
    const ultimoDia = new Date(ano, mes + 1, 0).getDate();

    // Map dos dias da semana usando a global
    const diasJp = DIAS_DA_SEMANA_COM_KANJI.map(d => d.jp);

    let html = `<div class="mini-cal">
        <div class="mini-cal-header">${mes + 1}</div>
        <div class="mini-cal-days">
            ${diasJp.map((d, i) =>
        `<span class="${i === 0 ? 'sun' : (i === 6 ? 'sat' : '')}">${d}</span>`
    ).join('')}
    `;

    // Espaços vazios antes do dia 1
    for (let i = 0; i < primeiroDia; i++) {
        html += '<span></span>';
    }

    // Dias do mês (com feriados em vermelho)
    for (let d = 1; d <= ultimoDia; d++) {
        const diaSemana = (primeiroDia + d - 1) % 7;
        const feriado = ehFeriado(d, mes, ano);
        let classe = '';

        if (feriado || diaSemana === 0) {
            classe = 'sun'; // Vermelho para domingos e feriados
        } else if (diaSemana === 6) {
            classe = 'sat'; // Azul para sábados
        }

        html += `<span class="${classe}">${d}</span>`;
    }

    html += '</div></div>';
    return html;
}

function gerarHTMLMes(mes, ano, poesia, fasesLua, dias) {
    // Formatar HTML das fases da lua
    const moonSVG = {
        crescente: '<svg viewBox="0 0 24 24" width="20" height="20"><circle cx="12" cy="12" r="10" fill="none" stroke="#555" stroke-width="1.5"/><path d="M12 2a10 10 0 0 1 0 20" fill="#555"/></svg>',
        cheia: '<svg viewBox="0 0 24 24" width="20" height="20"><circle cx="12" cy="12" r="10" fill="none" stroke="#555" stroke-width="1.5"/></svg>',
        minguante: '<svg viewBox="0 0 24 24" width="20" height="20"><circle cx="12" cy="12" r="10" fill="none" stroke="#555" stroke-width="1.5"/><path d="M12 2a10 10 0 0 0 0 20" fill="#555"/></svg>',
        nova: '<svg viewBox="0 0 24 24" width="20" height="20"><circle cx="12" cy="12" r="10" fill="#555"/></svg>'
    };

    const luasHTML = [
        { svg: moonSVG.crescente, dia: fasesLua.crescente },
        { svg: moonSVG.cheia, dia: fasesLua.cheia },
        { svg: moonSVG.minguante, dia: fasesLua.minguante },
        { svg: moonSVG.nova, dia: fasesLua.nova }
    ].filter(f => f.dia).map(f => `
        <div class="moon-phase" >
            <span>${f.svg}</span>
            <span>${f.dia}</span>
        </div>
        `).join('');

    // Filtrar apenas dias válidos do mês atual
    const diasValidos = dias.filter(d => d && d.mesAtual && d.dia);

    // Construir LISTA de Dias
    let listaDiasHTML = diasValidos.map(dia => {
        const feriadoNome = ehFeriado(dia.dia, mes, ano);
        const diaDaSemanaIndex = (new Date(ano, mes, dia.dia)).getDay();
        const diaSemanaInfo = DIAS_DA_SEMANA_COM_KANJI[diaDaSemanaIndex]; // Usa constante

        const isDomingo = diaDaSemanaIndex === 0;
        const isSabado = diaDaSemanaIndex === 6;

        let rowClass = 'day-row';
        if (isDomingo) rowClass += ' sunday-row';
        if (isSabado) rowClass += ' saturday-row';
        if (feriadoNome) rowClass += ' holiday-row';

        // Renderizar Compromissos
        const diaKey = `${ano}-${mes}-${dia.dia}`;
        let compromissosHTML = '';
        if (state.compromissos[diaKey]) {
            compromissosHTML = state.compromissos[diaKey].map((comp, idx) => `
                <div class="compromisso-item" 
                     style="color: ${comp.cor}; font-size: ${comp.tamanho || '10px'}; font-weight: ${comp.negrito ? 'bold' : 'normal'};" 
                     onclick="abrirModalCompromisso(${dia.dia}, ${idx}, event)">
                    • ${comp.descricao}
                </div>
            `).join('');
        }

        return `
        <div class="${rowClass}" onclick="abrirModalCompromisso(${dia.dia})">
                <div class="day-num">${dia.dia}</div>
                <div class="day-weekday-jp">${diaSemanaInfo.jp}</div>
                <div class="day-info-container">
                    <div class="day-feriado">${feriadoNome ? feriadoNome : ''}</div>
                    <div class="compromissos-container">${compromissosHTML}</div>
                </div>
            </div>
        `;
    }).join('');

    // Dividir poema
    const linhasPoema = dividirPoemaEm3(poesia.original);
    const poemHTML = linhasPoema.map(linha =>
        `<div class="poem-line" > ${linha}</div> `
    ).join('');

    // Mini calendários
    const mesAnterior = mes === 0 ? 11 : mes - 1;
    const anoAnterior = mes === 0 ? ano - 1 : ano;
    const mesProximo = mes === 11 ? 0 : mes + 1;
    const anoProximo = mes === 11 ? ano + 1 : ano;

    const miniCalAnterior = gerarMiniCalendario(mesAnterior, anoAnterior);
    const miniCalProximo = gerarMiniCalendario(mesProximo, anoProximo);

    // SE FOR LAYOUT NORDIC (19x15cm)
    if (state.layout === 'nordic') {
        const primeiroDia = new Date(ano, mes, 1).getDay();
        const diasNoMes = new Date(ano, mes + 1, 0).getDate();
        const diasMesAnterior = new Date(ano, mes, 0).getDate();

        // Gera array completo de células do grid (incluindo dias vazios/mes anterior/proximo)
        // Grid 7 colunas x 6 linhas = 42 células fixas ou dinâmico?
        // Vamos usar 6 linhas fixas para estabilidade
        const totalCelulas = 42;
        let celulasHTML = '';

        // Dias do mês anterior
        for (let i = 0; i < primeiroDia; i++) {
            const diaNum = diasMesAnterior - (primeiroDia - 1) + i;
            celulasHTML += `<div class="nordic-day-cell other-month">${diaNum}</div>`;
        }

        // Dias do mês atual
        for (let i = 1; i <= diasNoMes; i++) {
            const diaSemana = (primeiroDia + i - 1) % 7;
            const feriado = ehFeriado(i, mes, ano);
            const isDomingo = diaSemana === 0;
            const isSabado = diaSemana === 6;

            let classes = 'nordic-day-cell';
            if (isDomingo || feriado) classes += ' sunday';
            else if (isSabado) classes += ' saturday';

            // Holiday Name HTML
            let holidayHTML = '';
            if (feriado) {
                holidayHTML = `<div class="nordic-holiday-name">${feriado}</div>`;
            }

            // Compromissos (Text + Dots)
            let apptHTML = '';
            const diaKey = `${ano}-${mes}-${i}`;
            if (state.compromissos[diaKey]) {
                apptHTML = state.compromissos[diaKey].map(c =>
                    `<div class="nordic-appt-item" style="color: ${c.cor}">• ${c.descricao}</div>`
                ).join('');
            }

            celulasHTML += `
                <div class="${classes}" onclick="abrirModalCompromisso(${i})">
                    <div class="nordic-day-num">${i}</div>
                    ${holidayHTML}
                    ${apptHTML}
                </div>`;
        }

        // Dias do próximo mês para completar grid
        const celulasUsadas = primeiroDia + diasNoMes;
        const restantes = totalCelulas - celulasUsadas;
        for (let i = 1; i <= restantes; i++) {
            celulasHTML += `<div class="nordic-day-cell other-month">${i}</div>`;
        }

        const headersDias = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB']
            .map((d, i) => `<div class="nordic-day-head" style="${i === 0 ? 'color:#e74c3c' : (i === 6 ? 'color:#2563eb' : '')}">${d}</div>`)
            .join('');

        return `
            <div class="layout-nordic">
                <!-- PAINEL ESQUERDO: Poesia estilo Square -->
                <div class="nordic-left-panel">
                    <div class="sq-collection-title">POEMAS "YAMA TO MIZU"</div>
                    
                     <div class="sq-poem-text">
                        <div class="sq-poem-wrapper">
                            ${dividirPoemaEm3(poesia.original).map(line => `<div class="poem-line">${line}</div>`).join('')}
                        </div>
                    </div>

                    <div class="sq-translation-block">
                        <div class="sq-trans-title">${poesia.title || poesia.tituloPT || 'Título'}</div>
                        <div class="sq-trans-romaji">${poesia.romaji || poesia.leitura || ''}</div>
                        <div class="sq-trans-text">${poesia.translation || poesia.traducao || 'Tradução...'}</div>
                    </div>
                </div>

                <!-- PAINEL DIREITO: Calendário Grid -->
                <div class="nordic-right-panel">
                    <div class="nordic-header">
                        <div class="nordic-month-year">
                            <div class="nordic-year">${ano}</div>
                            <div class="nordic-month">${MESES_PT[mes]}</div>
                        </div>
                        <div class="nordic-moon-phases">
                           <!-- Reuse SVG logic if needed or simplify -->
                           ${luasHTML}
                        </div>
                    </div>
                    
                    <div class="nordic-grid">
                        <div class="nordic-days-header">
                            ${headersDias}
                        </div>
                        <div class="nordic-days-body">
                            ${celulasHTML}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // SE FOR LAYOUT SQUARE (TIPO MUSEU)
    if (state.layout === 'square') {
        // Dividir dias em 1-16 (Esq) e 17-Fim (Dir)
        // Dias vazios/início do mês não importam tanto na visualização de lista corrida, 
        // mas vamos manter a lógica de dias do mês.

        // Filtra apenas dias reais (1 a 31)
        const diasReais = dias.filter(d => d.mesAtual);

        // Coluna 1: Dias 1 a 16
        const diasCol1 = diasReais.filter(d => d.dia <= 16);
        // Coluna 2: Dias 17 a 31
        const diasCol2 = diasReais.filter(d => d.dia > 16);

        const renderDiaItem = (dia) => {
            const feriadoNome = ehFeriado(dia.dia, mes, ano);
            const dataObj = new Date(ano, mes, dia.dia);
            const diaSemanaIndex = dataObj.getDay();

            // Nomes curtos em inglês ou português? A imagem usa "Sun", "Mon". 
            // Vamos usar EN curto para fidelidade ou manter PT? O usuário pediu layout...
            // O código original usa Kanji. Vamos manter Kanji + EN/PT curto?
            // A imagem mostra: "17 Tue", "18 Wed".
            // Vamos usar array customizado para EN curto se quiser fidelidade, mas vamos usar os dados que temos.

            const DIAS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const nomeDia = DIAS_EN[diaSemanaIndex];

            const isDomingo = diaSemanaIndex === 0;
            const isSabado = diaSemanaIndex === 6;

            let corDia = '#333';
            if (isDomingo || feriadoNome) corDia = '#e74c3c'; // Vermelho
            else if (isSabado) corDia = '#2563eb'; // Azul

            // Renderizar Compromissos (versão mista/compacta)
            const diaKey = `${ano}-${mes}-${dia.dia}`;
            let hasCompromisso = state.compromissos[diaKey] ? 'has-appt' : '';

            // Renderiza pequenos pontos ou contadores para mobile/compact
            let dots = '';
            if (state.compromissos[diaKey]) {
                // Se quiser mostrar bolinhas coloridas
                dots = state.compromissos[diaKey].map(c =>
                    `<span style="color: ${c.cor}">•</span>`
                ).join('');
            }

            return `
            <div class="square-day-row ${hasCompromisso}" onclick="abrirModalCompromisso(${dia.dia})" style="color: ${corDia}">
                <span class="sq-day-weekday">${nomeDia}</span>
                <span class="sq-day-num">${dia.dia} ${dots}</span> 
            </div>
            `;
        };

        const htmlCol1 = diasCol1.map(renderDiaItem).join('');
        const htmlCol2 = diasCol2.map(renderDiaItem).join('');

        return `
            <div class="square-layout-container">
                <div class="sq-header">
                    <div class="sq-year">${ano}</div>
                    <div class="sq-month">${MESES_PT[mes].toUpperCase()}</div>
                </div>
                
                <div class="sq-body">
                    <div class="sq-col-left">
                        ${htmlCol1}
                    </div>
                    <!-- Coluna Central: Poesia -->
            <div class="sq-col-center">
                <!-- Título da Coleção (Estático) -->
                <div class="sq-collection-title">
                    POEMAS "YAMA TO MIZU"
                </div>
                
                <div class="sq-poem-text">
                    <div class="sq-poem-wrapper">
                        ${dividirPoemaEm3(poesia.original).map(line => `<div class="poem-line">${line}</div>`).join('')}
                    </div>
                </div>
                
                <div class="sq-translation-block">
                    <div class="sq-trans-title">${poesia.title || poesia.tituloPT || 'Título'}</div>
                    <div class="sq-trans-romaji">${poesia.romaji || poesia.leitura || ''}</div>
                    <div class="sq-trans-text">${poesia.translation || poesia.traducao || 'Tradução...'}</div>
                </div>
            </div>
                    
                    <div class="sq-col-right">
                        ${htmlCol2}
                    </div>
                </div>
                
                <div class="sq-footer">
                     <!-- Footer limpo ou com assinatura -->
                </div>
            </div>
        `;
    }

    // LAYOUT ORIGINAL (Mantido)
    return `
        <div class="calendar-section" >
            <div class="calendar-header">
                <div class="month-title">
                    ${ano}
                    <br>
                    <span class="month-label">${MESES_PT[mes].toUpperCase()}</span>
                </div>
                <div class="moon-phases">
                    <div class="moon-phases-row">${luasHTML}</div>
                </div>
            </div>
            
            <div class="list-header">
                <span>Dia</span>
                <span class="weekday-jp">曜日</span>
                <span></span>
            </div>

            <div class="calendar-list">
                ${listaDiasHTML}
            </div>
        </div>

        <div class="hero-section">
            <div class="source-header">Poemas de Meishu-sama</div>
            <div class="source-header sub">"Yama to Mizu"</div>
            <div class="poesia-columns">
                ${poemHTML}
            </div>
        </div>

        <div class="calendar-footer">
            <div class="footer-mini-cal">
                ${miniCalAnterior}
            </div>
            <div class="footer-traducao">
                <div class="footer-obra-titulo">${poesia.title || 'Sem Título'}</div>
                <div class="romaji-texto">${poesia.romaji || ''}</div>
                <div class="traducao-texto">${poesia.translation || poesia.traducao}</div>
            </div>
            <div class="footer-mini-cal">
                ${miniCalProximo}
            </div>
        </div>
    `;
}

// Atualiza renderizarCalendario para usar o helper
function renderizarCalendario(poesia, fasesLua, dias) {
    const calendario = document.getElementById('calendario');
    calendario.innerHTML = gerarHTMLMes(state.mes, state.ano, poesia, fasesLua, dias);
}


function imprimirMesAtual() {
    // Esconde o painel de controles
    const controlsCard = document.querySelector('.controls-card');
    const originalDisplay = controlsCard ? controlsCard.style.display : 'block';
    if (controlsCard) controlsCard.style.display = 'none';

    // Remove padding do body temporariamente
    const body = document.body;
    const originalPadding = body.style.padding;
    body.style.padding = '0';

    if (state.layout === 'nordic') {
        body.classList.add('print-nordic');
    }

    // Imprime
    window.print();

    // Restaura após impressão (com delay para garantir que o diálogo fechou)
    setTimeout(() => {
        if (controlsCard) controlsCard.style.display = originalDisplay;
        body.style.padding = originalPadding;
    }, 100);
}

// --- Refatoração: Separa a geração do container da ação de imprimir ---

function gerarContainerAnoCompleto() {
    // 1. Cria container se não existir (ou limpa anterior)
    let printContainer = document.getElementById('print-container');
    if (printContainer) {
        printContainer.remove();
    }

    printContainer = document.createElement('div');
    printContainer.id = 'print-container';

    // 2. Gera os 12 meses
    for (let m = 0; m < 12; m++) {
        const indicePoesia = state.poesiasEscolhidas[m];
        let poesiaDoMes = state.todasPoesias[indicePoesia];

        // Fallback
        if (!poesiaDoMes) {
            poesiaDoMes = state.todasPoesias.find(p => p.meses && p.meses.includes(m + 1)) || state.todasPoesias[0];
        }

        const fasesLua = obterDiasFasesLua(m, state.ano);
        const dias = gerarCalendario(m, state.ano);

        const htmlMes = gerarHTMLMes(m, state.ano, poesiaDoMes, fasesLua, dias);

        const pagina = document.createElement('div');
        pagina.className = 'pagina print-mode'; // Adiciona print-mode para ativar estilos V3
        pagina.innerHTML = htmlMes;
        printContainer.appendChild(pagina);
    }

    return printContainer;
}

function imprimirAnoCompleto() {
    const printContainer = gerarContainerAnoCompleto();
    document.body.appendChild(printContainer);

    // 3. Ativa modo de impressão de ano completo (classe no body)
    document.body.classList.add('printing-year');

    // 4. Imprime
    setTimeout(() => {
        window.print();

        // Limpeza após impressão
        const cleanUp = () => {
            document.body.classList.remove('printing-year');
            if (printContainer && printContainer.parentNode) {
                printContainer.parentNode.removeChild(printContainer);
            }
        };

        window.addEventListener('afterprint', cleanUp, { once: true });

        // Fallback (caso afterprint não dispare em alguns browsers/cenários)
        setTimeout(cleanUp, 1000);
    }, 500);
}



// --- GRADE ANUAL (GRID VIEW) ---
let isGridView = false;

function alternarGradeAnual() {
    isGridView = !isGridView;
    const calendario = document.getElementById('calendario');
    const gridView = document.getElementById('grid-view');
    const btn = document.querySelector('button[onclick="alternarGradeAnual()"]');

    if (isGridView) {
        // Ativa Grid
        calendario.style.display = 'none';
        gridView.style.display = 'grid'; // CSS Grid
        btn.innerHTML = '🔙 Voltar para Mês Único';
        btn.style.backgroundColor = '#7f8c8d';

        gerarGradeAnual(gridView);
    } else {
        // Volta para Mês Único
        gridView.style.display = 'none';
        calendario.style.display = 'flex'; // ou block, dependendo do CSS original
        btn.innerHTML = '📅 Ver Grade Anual';
        btn.style.backgroundColor = '#8e44ad';
    }
}

function gerarGradeAnual(container) {
    container.innerHTML = ''; // Limpa anterior

    for (let m = 0; m < 12; m++) {
        // Encontra dados do mês
        let indicePoesia = state.poesiasEscolhidas[m];
        let poesiaDoMes = state.todasPoesias[indicePoesia];
        if (!poesiaDoMes) {
            poesiaDoMes = state.todasPoesias.find(p => p.meses && p.meses.includes(m + 1)) || state.todasPoesias[0];
        }

        const fasesLua = obterDiasFasesLua(m, state.ano);
        const dias = gerarCalendario(m, state.ano);

        // Gera HTML interno usando a mesma função do print
        const htmlMes = gerarHTMLMes(m, state.ano, poesiaDoMes, fasesLua, dias);

        // Cria Wrapper da Grade
        const wrapper = document.createElement('div');
        wrapper.className = 'month-card-wrapper';
        wrapper.title = 'Clique para trocar a poesia deste mês';
        wrapper.onclick = () => abrirSeletorPoesia(m); // Adiciona click

        // Cria Container de Conteúdo (que será escalado)
        const content = document.createElement('div');
        content.className = 'month-card-content print-mode'; // Adiciona classe print-mode
        content.innerHTML = htmlMes;

        wrapper.appendChild(content);
        container.appendChild(wrapper);

        // AJUSTE DE ESCALA DINÂMICO
        // Precisamos esperar renderizar para calcular a escala correta
        // Mas como layout é fixo (210mm x 297mm), podemos calcular baseado na largura do wrapper
        requestAnimationFrame(() => {
            const scale = wrapper.clientWidth / content.offsetWidth;
            content.style.transform = `scale(${scale})`;
            // Garante que altura do wrapper bata com altura escalada? 
            // Já usamos aspect-ratio no CSS, então wrapper deve estar ok.
        });
    }

    // Resize Observer para ajustar escala se janela mudar de tamanho
    const ro = new ResizeObserver(entries => {
        entries.forEach(entry => {
            const wrapper = entry.target;
            const content = wrapper.querySelector('.month-card-content');
            if (content) {
                const scale = wrapper.clientWidth / 210 / 3.7795275591; // mm to px approx or just use offsetWidth
                // Melhor usar offsetWidth fixo do content (que é 210mm convertido em px pelo browser)
                const scalePreciso = wrapper.clientWidth / content.offsetWidth;
                content.style.transform = `scale(${scalePreciso})`;
            }
        });
    });

    document.querySelectorAll('.month-card-wrapper').forEach(el => ro.observe(el));
}

// --- LOGICA DO MODAL DE SELEÇÃO ---

let tempMesSelecionado = null;

function abrirSeletorPoesia(mesIndex) {
    tempMesSelecionado = mesIndex;
    const nomeMes = MESES_PT[mesIndex];
    document.getElementById('modal-titulo').textContent = `Escolher Poesia para ${nomeMes}`;

    // Mostra modal
    document.getElementById('modal-poesia').style.display = 'flex';

    // Reseta checkbox para filtrado por padrão
    document.getElementById('check-mostrar-todos').checked = false;

    atualizarListaModal();
}

function fecharModalPoesia() {
    document.getElementById('modal-poesia').style.display = 'none';
    tempMesSelecionado = null;
}

function atualizarListaModal() {
    const mostrarTodos = document.getElementById('check-mostrar-todos').checked;
    const listaContainer = document.getElementById('lista-poesias');
    listaContainer.innerHTML = '';

    const mesAlvo = tempMesSelecionado + 1; // 1-12
    const poesiaAtualIndex = state.poesiasEscolhidas[tempMesSelecionado];

    state.todasPoesias.forEach((poesia, index) => {
        // Lógica de filtro
        const pertenceAoMes = poesia.meses && poesia.meses.includes(mesAlvo);

        if (!mostrarTodos && !pertenceAoMes) {
            return; // Pula se não for do mês e filtro estiver ativo
        }

        // Cria item da lista
        const item = document.createElement('div');
        item.className = 'poem-item';
        if (index === poesiaAtualIndex) item.classList.add('selected');

        const textoPoesia = poesia.translation || poesia.original;

        // Visualização com Título Restaurado
        item.innerHTML = `
            <div class="poem-item-title">
                ${poesia.title || 'Poesia ' + (index + 1)}
            </div>
            <div class="poem-item-preview">
                "${textoPoesia.substring(0, 100) + (textoPoesia.length > 100 ? '...' : '')}"
            </div>
        `;

        item.onclick = () => selecionarPoesia(index);

        listaContainer.appendChild(item);
    });
}

function selecionarPoesia(index) {
    if (tempMesSelecionado === null) return;

    // Atualiza estado
    state.poesiasEscolhidas[tempMesSelecionado] = index;

    // Feedback visual e fecha
    fecharModalPoesia();

    // Atualiza a View
    // Se estiver no modo Grid:
    if (isGridView) {
        const gridView = document.getElementById('grid-view');
        gerarGradeAnual(gridView);
    } else {
        // Se estiver no modo Single (caso adicionemos suporte no futuro, já atualiza state)
        // Se quiser suportar clique no modo single, precisa adicionar onclick lá também.
        // Mas o pedido foi focado no grid. De qualquer forma, atualiza calendario se mes bater.
        if (state.mes === tempMesSelecionado) {
            atualizarCalendario();
        }
    }
}


// --- LÓGICA DE COMPROMISSOS ---

let dataCompromissoSelecionada = null; // Guardará o dia do mês atual
let corSelecionada = '#e74c3c'; // Padrão
let indexEdicao = null; // Se !== null, estamos editando

function abrirModalCompromisso(dia, index = null, event = null) {
    if (event) event.stopPropagation();

    dataCompromissoSelecionada = dia;
    indexEdicao = index;

    document.getElementById('modal-compromisso').style.display = 'flex';

    // Título
    document.getElementById('modal-compromisso-titulo').textContent =
        (index !== null ? 'Editar Compromisso' : 'Adicionar Compromisso') + ` - Dia ${dia}`;

    // Reset ou Pre-fill
    if (index !== null) {
        // Modo EDIÇÃO
        const diaKey = `${state.ano}-${state.mes}-${dia}`;
        const item = state.compromissos[diaKey][index];

        document.getElementById('input-compromisso').value = item.descricao;
        document.getElementById('input-tamanho').value = item.tamanho || '10px';
        document.getElementById('input-negrito').checked = !!item.negrito;

        // Selecionar cor visualmente
        let cor = item.cor || '#e74c3c';
        const corDiv = document.querySelector(`.color-option[data-color="${cor}"]`);
        if (corDiv) selecionarCor(corDiv);

        // Mostrar botão excluir
        document.getElementById('btn-excluir-compromisso').style.display = 'block';
    } else {
        // Modo NOVO POEMA
        document.getElementById('input-compromisso').value = '';
        document.getElementById('input-tamanho').value = '10px';
        document.getElementById('input-negrito').checked = false;

        // Reset cor para primeira (vermelho)
        const firstColor = document.querySelector('.color-option');
        if (firstColor) selecionarCor(firstColor);

        // Esconder botão excluir
        document.getElementById('btn-excluir-compromisso').style.display = 'none';
    }

    document.getElementById('input-compromisso').focus();
}

function fecharModalCompromisso() {
    document.getElementById('modal-compromisso').style.display = 'none';
    dataCompromissoSelecionada = null;
    indexEdicao = null;
}

function selecionarCor(elemento) {
    // Remove classe selected de todos
    document.querySelectorAll('.color-option').forEach(el => el.classList.remove('selected'));
    // Adiciona ao clicado
    elemento.classList.add('selected');
    corSelecionada = elemento.getAttribute('data-color');
}

function salvarCompromisso() {
    const descricao = document.getElementById('input-compromisso').value.trim();
    const tamanho = document.getElementById('input-tamanho').value;
    const negrito = document.getElementById('input-negrito').checked;

    if (!descricao) {
        alert('Digite uma descrição!');
        return;
    }

    if (dataCompromissoSelecionada === null) return;

    const diaKey = `${state.ano}-${state.mes}-${dataCompromissoSelecionada}`;

    if (!state.compromissos[diaKey]) {
        state.compromissos[diaKey] = [];
    }

    const novoItem = {
        descricao: descricao,
        cor: corSelecionada,
        tamanho: tamanho,
        negrito: negrito
    };

    if (indexEdicao !== null) {
        // Atualiza existente
        state.compromissos[diaKey][indexEdicao] = novoItem;
    } else {
        // Adiciona novo
        state.compromissos[diaKey].push(novoItem);
    }

    salvarCompromissosLocais();
    fecharModalCompromisso();
    atualizarCalendario();
}

// Nova função de excluir chamada pelo botão do modal
function excluirCompromissoAtual() {
    if (indexEdicao === null || dataCompromissoSelecionada === null) return;

    const diaKey = `${state.ano}-${state.mes}-${dataCompromissoSelecionada}`;

    if (confirm('Tem certeza que deseja excluir este compromisso?')) {
        removerCompromisso(diaKey, indexEdicao);
        fecharModalCompromisso();
    }
}

function removerCompromisso(diaKey, index, event) {
    if (event) event.stopPropagation(); // Evita abrir o modal de adicionar ao clicar para remover

    if (state.compromissos[diaKey]) {
        state.compromissos[diaKey].splice(index, 1);
        if (state.compromissos[diaKey].length === 0) {
            delete state.compromissos[diaKey];
        }
        salvarCompromissosLocais();
        atualizarCalendario();
    }
}

function salvarCompromissosLocais() {
    localStorage.setItem('yama_compromissos', JSON.stringify(state.compromissos));
}

function carregarCompromissos() {
    const salvos = localStorage.getItem('yama_compromissos');
    if (salvos) {
        try {
            state.compromissos = JSON.parse(salvos);
        } catch (e) {
            console.error('Erro ao carregar compromissos', e);
        }
    }
}

// --- LÓGICA DE LAYOUT ---

function alterarLayout() {
    const select = document.getElementById('layoutSelect');
    state.layout = select.value;

    const calendario = document.getElementById('calendario');

    if (state.layout === 'square') {
        calendario.classList.add('layout-square');
    } else {
        calendario.classList.remove('layout-square');
    }

    // Força re-renderização completa do HTML
    atualizarCalendario();
}

// ---Inicialização---
document.addEventListener('DOMContentLoaded', () => {
    // Inicializa campos
    const mesSelect = document.getElementById('mesSelect');
    const anoInput = document.getElementById('anoInput');

    if (mesSelect) mesSelect.value = state.mes;
    if (anoInput) anoInput.value = state.ano;

    // Inicializa poesias únicas
    inicializarPoesiasUnicas();

    // Carrega compromissos salvos
    carregarCompromissos();

    // Renderiza primeira vez
    atualizarCalendario();
});
