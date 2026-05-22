const CATEGORIE = [
    { id: "fascia_5",    nome: "0 – 5 €",        emoji: "🪙", descrizione: "Spese minime quotidiane" },
    { id: "fascia_50",   nome: "5 – 50 €",        emoji: "💵", descrizione: "Acquisti della settimana" },
    { id: "fascia_200",  nome: "50 – 200 €",      emoji: "💳", descrizione: "Spese significative" },
    { id: "fascia_1000", nome: "200 – 1.000 €",   emoji: "🛍️", descrizione: "Grandi acquisti" },
    { id: "fascia_max",  nome: "Oltre 1.000 €",   emoji: "💎", descrizione: "Spese importanti" }
];

const LISTE_SPESE = {
    "fascia_5": [
        "Un caffè espresso","Un cornetto o brioche","Una bottiglietta d'acqua (0,5 L)","Un trancio di pizza al taglio",
        "Una lattina di bibita","Un pacchetto di gomme da masticare","Un gelato artigianale (coppetta)","Un pacchetto di patatine",
        "Una birra in bottiglia (supermercato)","Un caffè al ginseng","Un chilo di pasta","Una bottiglia di passata di pomodoro",
        "Un filone di pane fresco","Una scatola di biscotti","Un litro di latte","Un pezzo di parmigiano (piccolo)",
        "Due vasetti di yogurt","Una tavoletta di cioccolato","Un cespo di insalata fresca","Una confezione da 6 uova",
        "Un flacone di bagnoschiuma","Un tubetto di dentifricio","Uno spazzolino da denti","Una saponetta solida",
        "Un pacco scorta di fazzoletti","Un deodorante spray","Una maschera viso monouso","Un burrocacao",
        "Una confezione di cotton fioc","Un pacco di salviettine umidificate","Una penna a sfera","Un quaderno a spirale",
        "Un set matita e gomma","Un evidenziatore","Un blocchetto di post-it","Una cartellina portadocumenti",
        "Un rotolo di nastro adesivo","Una mini-spillatrice","Una scatolina di graffette","Un temperamatite",
        "Una confezione di spugne per piatti","Un detersivo per piatti","Un rotolo di carta assorbente","Un rotolo di sacchetti per immondizia",
        "Un panno in microfibra","Una candela profumata piccola","Un deodorante per ambienti","Un pacco di mollette per i panni",
        "Una confezione di fiammiferi","Una bottiglia di candeggina","Un mese di cloud base (50GB)","Noleggio digitale di un film",
        "Acquisto di una canzone digitale","Download di un'app a pagamento","Commissione per un bonifico","Stampa di 10 fotografie",
        "Un caffè sospeso (donazione)","Abbonamento mensile news premium","Attivazione di una SIM in promo","Micro-transazione in un videogioco",
        "Un biglietto dell'autobus","Un'ora di parcheggio (strisce blu)","Sblocco di un monopattino in sharing","Biglietto del treno (tratta breve)",
        "Due litri di benzina","Pedaggio autostradale (tratta breve)","Un gettone autolavaggio self-service","Un profumatore per l'auto",
        "Canone mensile base del Telepass","Una mappa cartacea della città","Un paio di calzini in cotone","Una confezione di forcine",
        "Un elastico per capelli (scrunchie)","Un paio di lacci per scarpe","Una borsa shopper in tela","Delle solette semplici per scarpe",
        "Un pettine in plastica","Una confezione di spille da balia","Un pacco di guanti usa e getta","Una toppa termoadesiva",
        "Una scatoletta di cibo per gatti/cani","Un osso da masticare per cani","Un tubetto di colla a presa rapida","Una piantina grassa piccola",
        "Una bustina di semi da piantare","Un cacciavite piccolo","Una rivista in edicola","Un quotidiano cartaceo",
        "Una confezione da 4 pile stilo","Un mazzo di carte da gioco","Un accendino","Una scatola di caramelle in latta",
        "Una bustina di figurine","Un Gratta e Vinci da 2 euro","Un biglietto d'auguri in cartoncino","L'affrancatura per una lettera",
        "Un laccio portachiavi da collo","Una calamita da frigorifero","Cartine e filtri per tabacco","Un portachiavi ad anello semplice"
    ],
    "fascia_50": [
        "Un abbonamento mensile a Netflix (Premium)","Una bottiglia di vino di buona qualità","Due pizze a domicilio con birra",
        "Un power bank ad alta capacità","Un biglietto per il cinema 3D","Un mese di palestra (offerta base)",
        "Un taglio di capelli dal barbiere/parrucchiere","Un libro bestseller in copertina rigida","Una maglietta di marca in saldo",
        "Una cover per smartphone resistente","Scorta mensile di caffè in capsule","Un ombrello pieghevole antivento",
        "Una crema viso idratante in farmacia","Un bouquet di fiori freschi","Un biglietto del treno (tratta media)",
        "Abbonamento mensile ai mezzi pubblici","Un set di calici da vino","Un gioco da tavolo compatto",
        "Una borraccia termica in acciaio","Un caricabatterie rapido originale","Una visita guidata in un museo",
        "Un flacone di integratori vitaminici (mese)","Un cuscino ergonomico in memory foam","Una pianta da interni (es. Monstera)",
        "Un set di padelle antiaderenti base","Un mouse wireless di buona marca","Una chiavetta USB da 128GB",
        "Un ingresso alle terme (solo piscina)","Un pranzo di lavoro al ristorante","Una custodia imbottita per laptop",
        "Un abbonamento mensile a Spotify Duo","Un mazzo di carte collezionabili (Pokémon/Magic)","Una sveglia digitale con ricarica wireless",
        "Un portafoglio in pelle sintetica","Un set di asciugamani in spugna","Una lampada da scrivania a LED",
        "Un coltello da cucina professionale","Un supporto smartphone per l'auto","Una caffettiera Moka Bialetti",
        "Un costume da bagno","Un cappello invernale in lana","Una cintura di pelle",
        "Un set di pennelli da trucco","Una cassa Bluetooth portatile","Un ingresso in discoteca con consumazione",
        "Una maxi scorta di detersivi","Un rasoio manuale con testine di ricambio","Un abbonamento annuale a una rivista",
        "Un set di candele profumate grandi","Una donazione a un'associazione benefica"
    ],
    "fascia_200": [
        "La bolletta della luce bimestrale","Un biglietto per il concerto del tuo artista preferito","Un paio di scarpe da ginnastica di tendenza",
        "Una seduta di igiene dentale","Un volo andata e ritorno per una capitale europea","Una giacca a vento impermeabile",
        "Un profumo di alta profumeria","Una cena di coppia in un bel ristorante","L'abbonamento annuale ad Amazon Prime",
        "Un e-reader (es. Kindle)","Un paio di auricolari wireless di marca","Il tagliando base dell'auto",
        "Una macchina del caffè a capsule","Un paio di jeans firmati","Una notte in un B&B con colazione",
        "Un ingresso in una Spa per due persone","Uno zaino o borsa a tracolla di marca","Uno smartwatch entry-level",
        "La spesa alimentare per una settimana","Una poltrona da ufficio ergonomica","Un frullatore o estrattore di succo",
        "Un trapano avvitatore a batteria","Una visita medica specialistica privata","Un set di lenzuola matrimoniali di pregio",
        "Un mese di lezioni di lingua straniera","Un hard disk esterno da 2TB","Una tastiera meccanica da gaming",
        "Un paio di occhiali da sole di marca","Un orologio analogico elegante","Una piastra per capelli professionale",
        "Un purificatore d'aria per la stanza","Una friggitrice ad aria","L'abbonamento mensile a un parcheggio",
        "Un videogioco al lancio (Edizione Deluxe)","Un bagaglio a mano rigido di qualità","Una degustazione di vini per due",
        "L'ingresso a un parco divertimenti (famiglia)","Un cappotto invernale","Un regolabarba di fascia alta",
        "Una fornitura semestrale di lenti a contatto","Un passeggino leggero","Una tenda da campeggio",
        "Un tappeto grande per il salotto","Una scrivania per il PC","Un forno a microonde",
        "Una cena sushi 'All You Can Eat' per 4","Un set di pentole in acciaio inox","Un'assicurazione viaggio annuale",
        "Un abbonamento a teatro (4 spettacoli)","Il pagamento di una multa stradale"
    ],
    "fascia_1000": [
        "L'assicurazione annuale dell'auto (RCA)","Un weekend a Londra o Parigi (volo + hotel)","Un nuovo smartphone di fascia medio-alta",
        "Una Smart TV 4K da 55 pollici","Una lavatrice di classe energetica A","L'abbonamento annuale in una palestra premium",
        "Il conguaglio della bolletta del gas","Un tablet di ultima generazione","Una console per videogiochi (PS5 / Xbox)",
        "Un robot aspirapolvere lavapavimenti","Un corso di formazione professionale","Un paio di occhiali da vista completi",
        "Una bicicletta da città o mountain bike","Un abito da cerimonia o tailleur elegante","Un set di pneumatici nuovi per l'auto",
        "Un monopattino elettrico di buona qualità","Una fotocamera mirrorless entry-level","Un divano a due posti",
        "Un letto matrimoniale con contenitore","Un materasso matrimoniale in memory foam","Il noleggio auto per due settimane",
        "Una soundbar con subwoofer","Un condizionatore split (installazione esclusa)","La tassa sui rifiuti (TARI) annuale",
        "Un computer portatile per ufficio/studio","Un anello di fidanzamento (fascia base)","Un drone con telecamera 4K",
        "L'iscrizione alla scuola guida (Patente B)","Il rifacimento dell'impianto frenante dell'auto","Una settimana in un villaggio turistico",
        "Una borsa firmata iconica","Una giacca in vera pelle","Un mese di asilo nido privato",
        "Un frigorifero combinato no-frost","Una stufa a pellet","Un proiettore home theater",
        "Uno smartwatch top di gamma","Una sedia ergonomica Herman Miller (ricondizionata)","L'abbonamento stagionale allo stadio",
        "Un intervento del dentista (devitalizzazione)","Un corso per diventare sommelier","Una macchina da caffè espresso manuale",
        "Un box doccia nuovo in cristallo","Un tapis roulant pieghevole","Una chitarra acustica di liuteria",
        "La prima rata delle tasse universitarie","Il traghetto con auto per la Sardegna/Sicilia","Un set di mobili da giardino",
        "Un pacchetto di 10 sedute dal fisioterapista","Una spesa medica veterinaria imprevista"
    ],
    "fascia_max": [
        "L'affitto mensile di un trilocale in città","Una vacanza di due settimane alle Maldive","L'acquisto di un'utilitaria usata",
        "Un laptop di fascia altissima (es. MacBook Pro)","Il rifacimento completo del bagno","L'anticipo per l'acquisto di una casa",
        "Un impianto fotovoltaico per il tetto","Un orologio di lusso svizzero","Un intervento di chirurgia estetica",
        "Il catering per il proprio matrimonio","Un PC da gaming assemblato di altissimo livello","L'installazione di una cucina componibile",
        "Uno scooter o moto di media cilindrata","Un anno in un'università privata","Il pagamento delle tasse universitarie annuali",
        "Un televisore OLED 8K da 75 pollici","Una crociera nel Mediterraneo per due","Un sistema di allarme e videosorveglianza",
        "La sostituzione della caldaia con una a condensazione","L'acquisto di infissi nuovi per la casa","Un master post-laurea",
        "Un viaggio coast-to-coast negli Stati Uniti","L'arredamento completo del salotto","Una bicicletta elettrica (e-bike) di alta gamma",
        "Un fondo di emergenza in banca","Le spese condominiali annuali (riscaldamento incluso)","Un volo intercontinentale in Business Class",
        "Un divano in vera pelle di grande formato","L'impianto di climatizzazione canalizzato","Un intervento odontoiatrico complesso",
        "Riparazione del motore dell'auto (guarnizione testata)","Una borsa di lusso in edizione limitata","Una fotocamera professionale full-frame con obiettivo",
        "L'imbiancatura e ristrutturazione leggera di casa","L'acquisto di un box auto","Un anno di assicurazione sanitaria privata",
        "Una piscina fuori terra di grandi dimensioni","Un camper usato (modello entry-level)","La quota condominiale per il rifacimento della facciata",
        "Un sistema audio hi-fi per audiofili","Un pianoforte a mezza coda","Una stampante 3D professionale",
        "L'acquisto di un pacchetto di azioni/fondi","Un safari fotografico in Africa","Un viaggio in Giappone di 15 giorni per due",
        "Attrezzatura da palestra professionale completa","Un armadio a muro su misura","La parcella dell'avvocato per una causa civile",
        "Un macchinario per l'epilazione laser professionale","La sostituzione completa del pavimento di casa"
    ]
};

let SPESE = [];
let idCounter = 1;
for (let fascia in LISTE_SPESE) {
    LISTE_SPESE[fascia].forEach(nome => {
        SPESE.push({ id: idCounter++, nome, categoria: fascia });
    });
}