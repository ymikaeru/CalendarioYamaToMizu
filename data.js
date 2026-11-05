// --- DADOS ESTÁTICOS ---

// Dias da semana com Kanji
const DIAS_DA_SEMANA_COM_KANJI = [
    { pt: 'Dom', jp: '日' },
    { pt: 'Seg', jp: '月' },
    { pt: 'Ter', jp: '火' },
    { pt: 'Qua', jp: '水' },
    { pt: 'Qui', jp: '木' },
    { pt: 'Sex', jp: '金' },
    { pt: 'Sáb', jp: '土' }
];

const MESES_PT = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const FERIADOS_BRASILEIROS = {
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

const TODAS_POESIAS = [
    // JANEIRO - Verão
    {
        title: "O Perfume da Maré",
        original: "松かげの　汀の砂に潮の香を　したしみながら少時やすらう",
        romaji: "Matsukage no / migiwa no suna ni / shio no ka o / shitashiminagara / shibashi yasurau",
        translation: "À sombra dos pinheiros,\nna areia à beira-mar,\nsaboreando o aroma da maré,\nrepouso um instante.",
        kigo: "Verão",
        meses: [1]
    },
    // FEVEREIRO - Verão
    {
        title: "O Arco-íris Súbito",
        original: "木々の葉を　鳴らしてゆきし白雨の　はや美しき虹となりけり",
        romaji: "Kiginoha o / narashite yukishi shirasame no / haya uruwashiki niji to narikeri",
        translation: "Aquele aguaceiro que passou,\nfazendo soar as folhas das árvores,\njá se fez\num belo arco-íris.",
        kigo: "Verão",
        meses: [2]
    },
    // MARÇO - Outono
    {
        title: "A Correnteza Subterrânea",
        original: "いまだしも　暑さのこれどその底に　秋のけはいのうすら流るる",
        romaji: "Imadashimo / atsusa nokoredo sono soko ni / aki no kehai no usura nagaruru",
        translation: "Persiste ainda o calor;\nmas em seu fundo\nflui, tênue,\na presença do outono.",
        kigo: "Outono",
        meses: [3]
    },
    // ABRIL - Outono
    {
        title: "Pássaros Migratórios",
        original: "秋空の　かがやかしげよ渡り鳥　羽いそがしげに三つ四つゆくも",
        romaji: "Akizora no / kagayakashige yo wataridori / hane isogashige ni mitsu yotsu yuku mo",
        translation: "Quão resplandecente é o céu de outono!\nAves migratórias, três ou quatro,\npassam, batendo as asas\nem diligente pressa.",
        kigo: "Outono",
        meses: [4]
    },
    // MAIO - Outono
    {
        title: "Os Caquis Maduros",
        original: "みな黄ばむ　山裾村に幾本の　柿の木みえてみな熟れ赤き",
        romaji: "Mina kibamu / yamasuso mura ni / ikuhon no / kaki no ki miete / mina ureakaki",
        translation: "Na vila ao pé da montanha, onde tudo amarelece,\nveem-se alguns caquizeiros,\nde frutos todos maduros e rubros.",
        kigo: "Outono",
        meses: [5]
    },
    // JUNHO - Inverno
    {
        title: "O Som da Cozinha no Crepúsculo",
        original: "みぢか日に　はや小暗かり厨べに　夕餉の仕度か物の音する",
        romaji: "Mijikabi ni / haya ogurakari kuriyabe ni / yūge no shitaku ka mono no oto suru",
        translation: "No dia breve, já cai a penumbra;\nda cozinha vem um rumor:\nserá o preparo do jantar?",
        kigo: "Inverno",
        meses: [6]
    },
    // JULHO - Inverno
    {
        title: "Pardais na Geada",
        original: "霜ふかき　朝なりけり寒雀　うらさやがしく小庭とびちる",
        romaji: "Shimo fukaki / ashita narikeri / kansuzume / urasayagashiku / saniwa tobichiru",
        translation: "Manhã de geada densa.\nOs pardais do frio,\nem leve alvoroço,\ndispersam-se em voo pelo pequeno jardim.",
        kigo: "Inverno",
        meses: [7]
    },
    // AGOSTO - Inverno
    {
        title: "A Flor Secreta da Nespereira",
        original: "夕まけて　冬陽のとどく庭隅に　いとひそけくもびわの花咲く",
        romaji: "Yūmakete / fuyubi no todoku niwasumi ni / ito hisokeku mo biwa no hana saku",
        translation: "Ao declinar da tarde,\nno canto do jardim que o sol de inverno alcança,\ntão silenciosa,\nabre-se a flor da nespereira.",
        kigo: "Inverno",
        meses: [8]
    },
    // SETEMBRO - Primavera
    {
        title: "A Primavera Interior",
        original: "春は先づ　人の心に立ちそむか　昨日と同じ寒風ふけども",
        romaji: "Haru wa mazu / hito no kokoro ni tachisomu ka / kinō to onaji samukaze fukedomo",
        translation: "A primavera desponta primeiro\nno coração humano?\nSopra, porém, o mesmo\nvento frio de ontem.",
        kigo: "Primavera",
        meses: [9]
    },
    // OUTUBRO - Primavera
    {
        title: "A Contemplação da Borboleta",
        original: "蝶一つ　わが辺をすぎぬひらひらと　花にかくらうまでを立ちにつ",
        romaji: "Chō hitotsu / waga he o suginu / hirahira to / hana ni kakurau / made o tachinitsu",
        translation: "Uma borboleta passou por mim, esvoaçando;\naté que se ocultasse entre as flores,\nali permaneci de pé.",
        kigo: "Primavera",
        meses: [10]
    },
    // NOVEMBRO - Primavera
    {
        title: "O Verde que Arde",
        original: "うららけき　日條に雨後の草の原　緑さやかに萌えたぎろえる",
        romaji: "Urarakeki / hisuji ni ugo no kusanohara / midori sayaka ni moetagiroeru",
        translation: "Aos serenos raios de sol,\no campo de relva, depois da chuva,\nem límpido verde,\nbrota e fervilha.",
        kigo: "Primavera",
        meses: [11]
    },
    // DEZEMBRO - Verão
    {
        title: "Expansão da Alma",
        original: "風薫り　青葉光れる初夏の　庭に下りたてば胸のひろぎぬ",
        romaji: "Kaze kaori / aoba hikareru / hatsunatsu no / niwa ni oritateba / mune no hiroginu",
        translation: "Perfumado o vento, resplandecem as folhas verdes;\nao descer ao jardim, neste início de verão,\nmeu peito se expande.",
        kigo: "Verão",
        meses: [12]
    }
];
