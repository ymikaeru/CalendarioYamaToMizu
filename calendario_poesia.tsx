  const imprimirCalendario = () => {
    const conteudo = calendarioRef.current;
    const janelaImpressao = window.open('', '', 'height=1000,width=1400');
    
    janelaImpressao.document.write(`
      <html>
        <head>
          <title>Calendário ${mesesPt[mes]} ${ano}</title>
          <style>
            @media print {
              @page { size: A3 landscape; margin: 15mm; }
              body { margin: 0; padding: 0; }
            }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
              background: white;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              padding: 20px;
            }
            @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@300;400&display=swap');
          </style>
        </head>
        <body>
          ${conteudo.innerHTML}
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.onafterprint = function() {
                  window.close();
                };
              }, 250);
            };
          </script>
        </body>
      </html>
    `);
    
    janelaImpressao.document.close();
  };import React, { useState, useRef } from 'react';
import { Download, Calendar } from 'lucide-react';

const CalendarioPoesia = () => {
  const [mes, setMes] = useState(new Date().getMonth());
  const [ano, setAno] = useState(new Date().getFullYear());
  const [poesiaSelecionada, setPoesiaSelecionada] = useState(0);
  const [jsonCarregado, setJsonCarregado] = useState(false);
  const calendarioRef = useRef(null);
  const fileInputRef = useRef(null);

  const [temaFiltro, setTemaFiltro] = useState('Todos');
  const [todasPoesias, setTodasPoesias] = useState([
    {
      title: "Chuva e Musgo",
      original: "雨はれて　露もしとどの篁の　下かげ青く苔の花咲く",
      translation: "A chuva cessou. No bambuzal ainda denso de orvalho, Sob a sombra fresca e úmida, O musgo floresce em verde profundo.",
      kigo: "Primavera/Verão",
      month: 5
    },
    {
      title: "A Rã e a Chuva",
      original: "青あおし　ばしょうのひろはにあおがえる　さゆるぎもせであめにぬれおり",
      translation: "Verde sobre verde... Na larga folha da bananeira, a rã Repousa imóvel, Entregue serenamente à chuva que cai.",
      kigo: "Verão",
      month: 6
    },
    {
      title: "O Arco-Íris de Maio",
      original: "五月雨の　霽るると見れば遠方に　雲の峯並みうすら虹見ゆ",
      translation: "Ao dissipar-se a longa chuva de maio, Vislumbro ao longe picos de nuvens E um tênue arco-íris a surgir.",
      kigo: "Verão",
      month: 5
    },
    {
      title: "Lírios na Penumbra",
      original: "茂り合ふ　木の下闇にほの白く　山百合の花いくつか浮ける",
      translation: "Na penumbra do bosque onde as árvores se entrelaçam, Flutuam, alvos e sutis, Alguns lírios da montanha.",
      kigo: "Verão",
      month: 7
    },
    {
      title: "Canção do Plantio",
      original: "田植歌　のどかにきこえ野の家の　どこも人気の見えぬ真昼間",
      translation: "Ouve-se, serena, a canção do plantio; Nas casas do campo, Em pleno meio-dia, não se avista vivalma.",
      kigo: "Verão",
      month: 6
    }
  ]);
  
  const carregarJSON = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        
        // Verifica se é um array ou objeto com poesias
        const poesias = Array.isArray(json) ? json : json.poesias || json.poems || [];
        
        if (poesias.length > 0) {
          setTodasPoesias(poesias);
          setJsonCarregado(true);
          setPoesiaSelecionada(0);
          setTemaFiltro('Todos');
          alert(`✅ ${poesias.length} poesias carregadas com sucesso!`);
        } else {
          alert('❌ Formato de JSON inválido. Certifique-se de que contém um array de poesias.');
        }
      } catch (error) {
        alert('❌ Erro ao ler o arquivo JSON: ' + error.message);
      }
    };
    reader.readAsText(file);
  };
  
  const poesiasFiltradas = temaFiltro === 'Todos' 
    ? todasPoesias 
    : todasPoesias.filter(p => p.kigo?.includes(temaFiltro));
  
  const temas = ['Todos', ...new Set(todasPoesias.map(p => p.kigo).filter(Boolean))];

  const mesesPt = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Feriados Nacionais + SP Capital
  const feriadosBrasileiros = {
    0: [
      { dia: 1, nome: 'Ano Novo' },
      { dia: 25, nome: 'Aniversário de SP' }
    ],
    3: [{ dia: 21, nome: 'Tiradentes' }],
    4: [{ dia: 1, nome: 'Dia do Trabalho' }],
    6: [{ dia: 9, nome: 'Revolução Constitucionalista' }],
    8: [{ dia: 7, nome: 'Independência do Brasil' }],
    9: [{ dia: 12, nome: 'Nossa Senhora Aparecida' }],
    10: [
      { dia: 2, nome: 'Finados' },
      { dia: 15, nome: 'Proclamação da República' },
      { dia: 20, nome: 'Consciência Negra' }
    ],
    11: [{ dia: 25, nome: 'Natal' }]
  };

  const feriadosMoveis = {
    carnaval: 'Carnaval',
    sextaSanta: 'Sexta-feira Santa',
    corpusChristi: 'Corpus Christi'
  };

  const calcularCarnaval = (ano) => {
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
    
    const pascoa = new Date(ano, mesPascoa - 1, diaPascoa);
    const carnaval = new Date(pascoa);
    carnaval.setDate(pascoa.getDate() - 47);
    
    return { mes: carnaval.getMonth(), dia: carnaval.getDate() };
  };

  const calcularSextaSanta = (ano) => {
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
    
    const pascoa = new Date(ano, mesPascoa - 1, diaPascoa);
    const sextaSanta = new Date(pascoa);
    sextaSanta.setDate(pascoa.getDate() - 2);
    
    return { mes: sextaSanta.getMonth(), dia: sextaSanta.getDate() };
  };

  const calcularCorpusChristi = (ano) => {
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
    
    const pascoa = new Date(ano, mesPascoa - 1, diaPascoa);
    const corpus = new Date(pascoa);
    corpus.setDate(pascoa.getDate() + 60);
    
    return { mes: corpus.getMonth(), dia: corpus.getDate() };
  };

  const ehFeriado = (dia, mes, ano) => {
    // Verifica feriados fixos
    const feriadoFixo = feriadosBrasileiros[mes]?.find(f => f.dia === dia);
    if (feriadoFixo) return feriadoFixo.nome;
    
    // Verifica feriados móveis
    const carnaval = calcularCarnaval(ano);
    if (mes === carnaval.mes && dia === carnaval.dia) return feriadosMoveis.carnaval;
    
    const sextaSanta = calcularSextaSanta(ano);
    if (mes === sextaSanta.mes && dia === sextaSanta.dia) return feriadosMoveis.sextaSanta;
    
    const corpus = calcularCorpusChristi(ano);
    if (mes === corpus.mes && dia === corpus.dia) return feriadosMoveis.corpusChristi;
    
    return null;
  };

  const obterDiasFasesLua = (mes, ano) => {
    const ultimoDia = new Date(ano, mes + 1, 0).getDate();
    const fases = { nova: null, crescente: null, cheia: null, minguante: null };
    
    for (let dia = 1; dia <= ultimoDia; dia++) {
      const data = new Date(ano, mes, dia);
      const conhecidaLuaNova = new Date(2000, 0, 6);
      const cicleLunar = 29.53058867;
      const diasDesde = (data - conhecidaLuaNova) / (1000 * 60 * 60 * 24);
      const fase = ((diasDesde % cicleLunar) + cicleLunar) % cicleLunar;
      
      // Captura apenas o primeiro dia de cada fase
      if (fase < 1.5 && fases.nova === null) fases.nova = dia;
      else if (fase >= 6.5 && fase < 8.5 && fases.crescente === null) fases.crescente = dia;
      else if (fase >= 13.5 && fase < 15.5 && fases.cheia === null) fases.cheia = dia;
      else if (fase >= 20.5 && fase < 22.5 && fases.minguante === null) fases.minguante = dia;
    }
    
    return fases;
  };

  const gerarCalendario = () => {
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
  };

  const imprimirAnoCompleto = () => {
    const janelaImpressao = window.open('', '', 'height=1200,width=1400');
    
    let htmlCompleto = `
      <html>
        <head>
          <title>Calendário ${ano} - Ano Completo</title>
          <style>
            @media print {
              @page { size: A3 landscape; margin: 15mm; }
              body { margin: 0; padding: 0; }
              .pagina { page-break-after: always; }
              .pagina:last-child { page-break-after: auto; }
            }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
              background: white;
            }
            @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@300;400&display=swap');
          </style>
        </head>
        <body>
    `;

    // Gera calendário para cada mês
    for (let m = 0; m < 12; m++) {
      // Tenta encontrar poesia específica para o mês, senão usa rotação
      const poesiaDoMes = todasPoesias.find(p => p.month === m + 1) || 
                          todasPoesias[m % todasPoesias.length];
      const fasesLuaMes = obterDiasFasesLua(m, ano);
      const diasMes = gerarCalendarioParaMes(m, ano);
      
      htmlCompleto += `
        <div class="pagina" style="width: 1050px; margin: 0 auto; background: #ffffff; padding: 0; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
          <div style="padding: 90px 60px; backgroundColor: #f8f8f8; marginBottom: 0; textAlign: center; borderBottom: 1px solid #e5e5e5; minHeight: 450px; display: flex; flexDirection: column; justifyContent: center;">
            <div style="fontSize: 42px; lineHeight: 1.9; color: #1a1a1a; marginBottom: 20px; fontWeight: 300; letterSpacing: 2px; fontFamily: 'Noto Serif JP', 'Yu Mincho', 'MS Mincho', serif;">
              ${poesiaDoMes.original}
            </div>
            <div style="fontSize: 16px; lineHeight: 1.9; color: #666; marginTop: 30px; fontWeight: 300; maxWidth: 700px; margin: 30px auto 0 auto;">
              ${poesiaDoMes.translation}
            </div>
          </div>
          
          <div style="padding: 60px;">
            <div style="display: flex; justifyContent: space-between; alignItems: center; marginBottom: 30px;">
              <div style="fontSize: 22px; color: #1a1a1a; fontWeight: 300; letterSpacing: 1px;">
                ${mesesPt[m]}
              </div>
              <div style="backgroundColor: #fafafa; border: 1px solid #e5e5e5; padding: 12px 20px; borderRadius: 2px;">
                <div style="fontSize: 10px; fontWeight: 400; color: #666; marginBottom: 8px; textAlign: center; letterSpacing: 0.8px; textTransform: uppercase;">
                  Fases da lua
                </div>
                <div style="display: flex; gap: 6px; alignItems: center; justifyContent: center; fontSize: 12px; color: #333; fontWeight: 300;">
                  <span style="fontSize: 16px;">◐</span>
                  <span>${fasesLuaMes.crescente || '-'}</span>
                  <span style="fontSize: 16px; marginLeft: 4px;">○</span>
                  <span>${fasesLuaMes.cheia || '-'}</span>
                  <span style="fontSize: 16px; marginLeft: 4px;">◑</span>
                  <span>${fasesLuaMes.minguante || '-'}</span>
                  <span style="fontSize: 16px; marginLeft: 4px;">●</span>
                  <span>${fasesLuaMes.nova || '-'}</span>
                </div>
              </div>
            </div>
            
            <div style="display: grid; gridTemplateColumns: repeat(7, 1fr); gap: 0; border: 1px solid #e5e5e5;">
              ${diasSemana.map((dia, i) => `
                <div style="padding: 14px 8px; textAlign: center; fontSize: 10px; color: #666; fontWeight: 400; letterSpacing: 0.5px; textTransform: uppercase; borderBottom: 1px solid #e5e5e5; borderRight: ${i < 6 ? '1px solid #e5e5e5' : 'none'}; backgroundColor: #fafafa;">
                  ${dia}
                </div>
              `).join('')}
              
              ${diasMes.map((d, i) => {
                const nomeFeriado = d.mesAtual && d.dia ? ehFeriado(d.dia, m, ano) : null;
                const isDomingo = i % 7 === 0;
                return `
                  <div style="padding: 10px 8px; minHeight: 80px; backgroundColor: ${d.mesAtual ? '#ffffff' : '#fafafa'}; borderBottom: ${Math.floor(i / 7) < 5 ? '1px solid #e5e5e5' : 'none'}; borderRight: ${i % 7 < 6 ? '1px solid #e5e5e5' : 'none'}; position: relative; display: flex; flexDirection: column;">
                    ${d.dia ? `
                      <div style="fontSize: 16px; color: ${nomeFeriado || isDomingo ? '#dc2626' : (d.mesAtual ? '#1a1a1a' : '#bbb')}; fontWeight: ${nomeFeriado ? '500' : '300'}; letterSpacing: 0.3px; marginBottom: 5px;">
                        ${d.dia}
                      </div>
                      ${nomeFeriado ? `<div style="fontSize: 8px; color: #dc2626; lineHeight: 1.3; fontWeight: 400; letterSpacing: 0.2px;">${nomeFeriado}</div>` : ''}
                    ` : ''}
                  </div>
                `;
              }).join('')}
            </div>
            
            <div style="marginTop: 30px; textAlign: right; fontSize: 32px; color: #1a1a1a; fontWeight: 300; letterSpacing: 2px;">
              ${ano}
            </div>
          </div>
        </div>
      `;
    }
    
    htmlCompleto += `
        </body>
      </html>
    `;
    
    janelaImpressao.document.write(htmlCompleto);
    janelaImpressao.document.close();
    
    setTimeout(() => {
      janelaImpressao.print();
      janelaImpressao.onafterprint = () => janelaImpressao.close();
    }, 500);
  };

  const gerarCalendarioParaMes = (mes, ano) => {
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
  };

  const dias = gerarCalendario();
  const poesiaAtual = poesiasFiltradas[poesiaSelecionada] || poesiasFiltradas[0];
  const fasesLua = obterDiasFasesLua(mes, ano);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-xl font-normal text-gray-800 mb-6 flex items-center gap-3">
          <Calendar className="w-5 h-5 text-gray-600" />
          Gerador de Calendário
        </h1>

        {/* Botão Carregar JSON */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-blue-900 mb-1">
                📁 Carregar Poesias do JSON
              </h3>
              <p className="text-xs text-blue-700">
                {jsonCarregado 
                  ? `✅ ${todasPoesias.length} poesias carregadas` 
                  : 'Carregue um arquivo JSON com suas poesias organizadas por mês'}
              </p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
            >
              {jsonCarregado ? 'Trocar JSON' : 'Selecionar JSON'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={carregarJSON}
              className="hidden"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-gray-600 mb-2 text-sm font-normal">Mês</label>
            <select 
              value={mes}
              onChange={(e) => setMes(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:border-gray-400 bg-white"
            >
              {mesesPt.map((m, i) => (
                <option key={i} value={i}>{m}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-gray-600 mb-2 text-sm font-normal">Ano</label>
            <input 
              type="number"
              value={ano}
              onChange={(e) => setAno(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:border-gray-400 bg-white"
            />
          </div>
          
          <div>
            <label className="block text-gray-600 mb-2 text-sm font-normal">Tema</label>
            <select 
              value={temaFiltro}
              onChange={(e) => {
                setTemaFiltro(e.target.value);
                setPoesiaSelecionada(0);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:border-gray-400 bg-white"
            >
              {temas.map((tema, i) => (
                <option key={i} value={tema}>{tema}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-gray-600 mb-2 text-sm font-normal">Poesia</label>
            <select 
              value={poesiaSelecionada}
              onChange={(e) => setPoesiaSelecionada(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:border-gray-400 bg-white"
            >
              {poesiasFiltradas.map((p, i) => (
                <option key={i} value={i}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={imprimirCalendario}
            className="px-6 py-2.5 bg-gray-800 hover:bg-gray-900 text-white rounded-lg flex items-center justify-center gap-2 transition-colors text-sm font-normal"
          >
            <Download className="w-4 h-4" />
            Imprimir Mês
          </button>
          
          <button 
            onClick={imprimirAnoCompleto}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors text-sm font-normal"
          >
            <Calendar className="w-4 h-4" />
            Imprimir Ano Completo (12 meses)
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div ref={calendarioRef} style={{width: '1050px', margin: '0 auto'}}>
          <div style={{
            backgroundColor: '#ffffff',
            padding: '0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
          }}>
            {/* Área da Poesia - HERO */}
            <div style={{
              padding: '90px 60px',
              backgroundColor: '#f8f8f8',
              marginBottom: '0',
              textAlign: 'center',
              borderBottom: '1px solid #e5e5e5',
              minHeight: '450px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <div style={{
                fontSize: '42px',
                lineHeight: '1.9',
                color: '#1a1a1a',
                marginBottom: '20px',
                fontWeight: '300',
                letterSpacing: '2px',
                fontFamily: "'Noto Serif JP', 'Yu Mincho', 'MS Mincho', serif"
              }}>
                {poesiaAtual.original}
              </div>
              <div style={{
                fontSize: '16px',
                lineHeight: '1.9',
                color: '#666',
                marginTop: '30px',
                fontWeight: '300',
                maxWidth: '700px',
                margin: '30px auto 0 auto'
              }}>
                {poesiaAtual.translation}
              </div>
            </div>

            {/* Área do Calendário */}
            <div style={{
              padding: '60px'
            }}>

            {/* Cabeçalho do Calendário */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '30px'
            }}>
              <div style={{
                fontSize: '22px',
                color: '#1a1a1a',
                fontWeight: '300',
                letterSpacing: '1px'
              }}>
                {mesesPt[mes]}
              </div>
              
              {/* Fases da Lua */}
              <div style={{
                backgroundColor: '#fafafa',
                border: '1px solid #e5e5e5',
                padding: '12px 20px',
                borderRadius: '2px'
              }}>
                <div style={{
                  fontSize: '10px',
                  fontWeight: '400',
                  color: '#666',
                  marginBottom: '8px',
                  textAlign: 'center',
                  letterSpacing: '0.8px',
                  textTransform: 'uppercase'
                }}>
                  Fases da lua
                </div>
                <div style={{
                  display: 'flex',
                  gap: '6px',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  color: '#333',
                  fontWeight: '300'
                }}>
                  <span style={{fontSize: '16px'}}>◐</span>
                  <span>{fasesLua.crescente || '-'}</span>
                  <span style={{fontSize: '16px', marginLeft: '4px'}}>○</span>
                  <span>{fasesLua.cheia || '-'}</span>
                  <span style={{fontSize: '16px', marginLeft: '4px'}}>◑</span>
                  <span>{fasesLua.minguante || '-'}</span>
                  <span style={{fontSize: '16px', marginLeft: '4px'}}>●</span>
                  <span>{fasesLua.nova || '-'}</span>
                </div>
              </div>
            </div>

            {/* Grid do Calendário */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '0',
              border: '1px solid #e5e5e5'
            }}>
              {/* Cabeçalhos dos dias */}
              {diasSemana.map((dia, i) => (
                <div key={i} style={{
                  padding: '14px 8px',
                  textAlign: 'center',
                  fontSize: '10px',
                  color: '#666',
                  fontWeight: '400',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  borderBottom: '1px solid #e5e5e5',
                  borderRight: i < 6 ? '1px solid #e5e5e5' : 'none',
                  backgroundColor: '#fafafa'
                }}>
                  {dia}
                </div>
              ))}
              
              {/* Dias do mês */}
              {dias.map((d, i) => {
                const nomeFeriado = d.mesAtual && d.dia ? ehFeriado(d.dia, mes, ano) : null;
                const isDomingo = i % 7 === 0;
                
                return (
                  <div key={i} style={{
                    padding: '10px 8px',
                    minHeight: '80px',
                    backgroundColor: d.mesAtual ? '#ffffff' : '#fafafa',
                    borderBottom: Math.floor(i / 7) < 5 ? '1px solid #e5e5e5' : 'none',
                    borderRight: i % 7 < 6 ? '1px solid #e5e5e5' : 'none',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    {d.dia && (
                      <>
                        <div style={{
                          fontSize: '16px',
                          color: nomeFeriado || isDomingo ? '#dc2626' : (d.mesAtual ? '#1a1a1a' : '#bbb'),
                          fontWeight: nomeFeriado ? '500' : '300',
                          letterSpacing: '0.3px',
                          marginBottom: '5px'
                        }}>
                          {d.dia}
                        </div>
                        {nomeFeriado && (
                          <div style={{
                            fontSize: '8px',
                            color: '#dc2626',
                            lineHeight: '1.3',
                            fontWeight: '400',
                            letterSpacing: '0.2px'
                          }}>
                            {nomeFeriado}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
            {/* Ano no rodapé */}
            <div style={{
              marginTop: '30px',
              textAlign: 'right',
              fontSize: '32px',
              color: '#1a1a1a',
              fontWeight: '300',
              letterSpacing: '2px'
            }}>
              {ano}
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarioPoesia;