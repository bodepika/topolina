// =====================================================
//  EDITE AQUI — tudo que aparece no site vem deste arquivo
// =====================================================
window.CONFIG = {
  // Quem fez e para quem é
  nome1: "Topolino",
  nome2: "Topolina",

  // Dia em que se reencontraram (AAAA-MM-DD)
  dataInicio: "2026-07-12",
  textoDesde: "desde que nos reencontramos,",

  // Apelidos que flutuam no fundo e giram no topo
  apelidos: ["ratinha", "pirikita", "topolino", "topolina", "minha princesa", "meu dragãozinho"],

  // Frases que se revelam palavra por palavra conforme ela rola a página.
  // Coloque *asteriscos* em volta de uma palavra para destacá-la em rosa.
  // Para textos longos, use { texto: `...`, lang: "it" } e quebre linhas normalmente.
  frases: [
    "Eu amo cada *pedacinho* seu, minha *topolina*.",
    "Você está em *todos* os meus pensamentos.",
    {
      lang: "it",
      texto: `Ti desidero come se ti avessi sognato per *mille* anni — come qualcuno che accende candele in segreto,
sussurrando il tuo nome nell’oscurità.

Ti desidero nella febbre e nel silenzio,
ti desidero tra le lenzuola e agli angoli delle strade,
nei sorsi che bruciano,
nelle preghiere sussurrate a denti stretti,
nel sudore sulla pelle che si trasforma in una promessa.

Mi abiti con la delicatezza di un *miracolo*, eppure mi prendi con la forza di una *tempesta*.

È come se il mio corpo conoscesse la strada verso il tuo,
e il mio nome avesse senso solo se pronunciato dalle tue labbra.

*Amami*, finché il desiderio non si perde nell’eco del tuo tocco. Lascio il mio cuore spalancato, perché sia tuo, *completamente*.`,
    },
  ],

  // Texto da carta dentro do envelope
  carta: `Meu amor,

Sinto que em todos esses dias que te amei (desde o começo kkkk), tive o prazer de viver apreciando mais a vida, com o mundo tendo mais cores. Você melhora sempre os meus dias e a minha vida como um todo.`,
  assinatura: "Com todo o meu amor,\nseu Topolino ♥",

  // Frase que aparece no final, depois que ela segura o coração
  fraseFinal: "Eu te amo",

  // Música opcional (coloque um .mp3 na pasta e escreva o nome, ex.: "musica.mp3")
  musica: "",

  // Foto em destaque, numa seção separada, com a frase embaixo
  destaque: {
    arquivo: "fotos/foto-01.jpg",
    frase: "Sempre estarei aqui para medir sua *pressão*.",
  },

  // Fotos da galeria (pasta "fotos/"). "legenda" é opcional.
  fotos: Array.from({ length: 16 }, (_, i) => ({
    arquivo: `fotos/foto-${String(i + 2).padStart(2, "0")}.jpg`,
    legenda: "",
  })),
};
