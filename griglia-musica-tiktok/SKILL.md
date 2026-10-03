---
name: griglia-analitica-musica-tiktok
description: Griglia analitica e codebook per codificare la circolazione musicale di una serie TV su TikTok (8 dimensioni su tre livelli, semiotico / pragmatico / algoritmico), per la tesi di Enrico Barsotti. Usala ogni volta che si codifica un video, un audio o un campione TikTok, si scrive o rivede il Codebook (Cap. III, §3.5), si applicano le dimensioni a 'O mar for o Origami all'alba (Cap. IV), si calcola l'accordo tra codificatori, o si discute il design di una dimensione, un valore di codifica o l'unità di analisi. Attivala anche per richieste informali come "codifica questi video", "classifica questi TikTok", "come codifico questo uso del brano", "aggiorna il codebook", "tabella delle dimensioni", anche se non nomina la griglia.
---

# Griglia analitica musica / TikTok

Operazionalizza in uno strumento di codifica le 8 dimensioni della sezione 1.5 del Cap. 1 (V2). Il Cap. 1 non nomina Mare Fuori e non anticipa risultati; questa griglia ne eredita il vincolo: le definizioni sono generali, applicabili a qualsiasi caso di circolazione musicale di una serie. Il caso Mare Fuori compare solo negli esempi e nell'applicazione (Cap. IV).

**Stato: bozza v0.1.** Le 8 dimensioni e i valori elencati per ciascuna vengono dal Cap. 1 V2. Tutto ciò che è marcato `[PROPOSTA]` lo ha aggiunto chi ha scritto questa skill e va validato con Bracciale e Mascio prima di entrare nel Codebook. Tutto ciò che è marcato `[APERTO]` è una decisione che spetta al dottorando. Non trasformare un `[PROPOSTA]` o un `[APERTO]` in un fatto: se serve per procedere, dichiara l'assunzione usata.

## Perché la griglia ha questa forma

Nei commenti del 25 maggio 2026 le supervisor hanno rilevato tre problemi che la griglia deve risolvere, non aggirare:

1. **Unità di analisi non definita.** Senza di essa, ogni conteggio è ambiguo.
2. **Livelli di analisi mescolati.** Le dimensioni 1 (semiotica), 3 e 6 (pratiche sociali) e 7 (metriche algoritmiche) stanno su piani diversi e non vanno sommate in un unico punteggio.
3. **Aspetto tesi-centrico.** Le dimensioni non devono sembrare costruite ad hoc per un caso.

Per questo la procedura sotto parte dall'unità di analisi, tiene separati i livelli e usa definizioni generali.

## Prima di codificare: unità di analisi `[APERTO]`

Non iniziare a codificare finché il dottorando non ha fissato l'unità. Se non l'ha fatto, chiedila (è l'unico blocco vero) e mostra le opzioni con le loro conseguenze:

| Unità | Cosa implica | Dimensioni che regge bene | Rischio |
|---|---|---|---|
| Singolo video | Un caso = un video con l'audio del brano | 3, 4, 6, 7, 8 | Le dimensioni 1, 2 e 5 sono proprietà del brano o del flusso, non del video: vanno ripetute per ogni riga |
| Audio seed (sound ID) | Un caso = un suono con tutti i video che lo usano | 1, 2, 5, 7 (aggregata) | I formati (3) diventano distribuzioni, non valori |
| Struttura a due livelli | Audio seed come livello 2, video come livello 1 | tutte | Più complessa; richiede tabelle collegate |

Nota critica: i valori per le dimensioni 1 e 2 si assegnano una volta per brano (livello seed), le dimensioni 3, 4, 6 si assegnano per video. Una struttura a due livelli lo rende esplicito ed è l'opzione che meglio regge l'obiezione delle supervisor, ma è una mia lettura, non una decisione presa.

## Le 8 dimensioni

Assegnazione ai livelli `[PROPOSTA]` (la distinzione in tre livelli è la richiesta delle supervisor; l'assegnazione di ogni dimensione è mia). Le dimensioni 5 e 8 sono le più ambigue: indicalo quando le usi.

### Livello semiotico (il brano nel testo seriale)

**D1. Statuto testuale del brano nel testo seriale.** Valori: sigla / diegetico / extradiegetico. Fonte: la serie, non TikTok. Codifica il brano nella sua occorrenza prevalente; se compare in più statuti, codifica quello prevalente e annota gli altri. `[PROPOSTA]` aggiungere "non applicabile" per brani estranei alla serie.

**D2. Grado di ancoraggio referenziale.** Valori: esplicito / implicito / assente. Misura quanto il video rimanda in modo riconoscibile alla serie (immagini, hashtag, citazioni, personaggi). `[PROPOSTA]` Definire "esplicito" come presenza di almeno un riferimento verificabile (hashtag di serie, clip o personaggio riconoscibile); "implicito" come riferimento deducibile solo dal contesto d'uso; "assente" quando nessun elemento rimanda alla serie. Il criterio va verificato su un campione pilota.

### Livello pragmatico (le pratiche d'uso)

**D3. Formato UGC.** Valori: lip-sync, edit, coreografia, cover, parodia, commento critico, e altri. `[APERTO]` L'elenco nel Cap. 1 è aperto ("…"): servono valori esaustivi e mutuamente esclusivi. Procedi con uno schema induttivo: sul campione pilota registra i formati osservati, poi proponi una lista chiusa con "altro" come categoria residua e dichiara la procedura. Un video può avere un formato prevalente e uno secondario.

**D4. Grado e tipo di trasformazione del brano.** Valori: integrale / estratto / remix / parodia. Le categorie mescolano due assi (quanto del brano si usa, e come lo si altera): `[PROPOSTA]` considera di separarli in "porzione usata" (integrale / estratto) e "tipo di alterazione" (nessuna / remix / parodia). Segnala l'alternativa invece di scegliere in silenzio.

**D5. Direzione del flusso attenzionale.** Valori: centripeto (verso la serie) / centrifugo (autonomizzazione del brano). È la dimensione con meno osservabili diretti: il flusso non si legge in un video, si inferisce. Codificala solo con evidenze esplicite (rimando alla serie nel testo, nei commenti o negli hashtag per il centripeto; assenza di rimandi con identità propria del contenuto per il centrifugo) e usa "indeterminabile" quando mancano. `[PROPOSTA]` Assegnarla al livello pragmatico come lettura interpretativa e non come misura.

**D6. Funzione comunicativa prevalente.** Valori: promozionale / affettivo-memoriale / identitaria / ludica / critica. Un video ha una funzione prevalente; le altre si annotano come secondarie. `[PROPOSTA]` Distinguere nel codebook promozionale "ufficiale" (profili istituzionali o di produzione) da "organico" (utenti), perché cambia l'interpretazione di D7.

### Livello algoritmico (visibilità e metriche)

**D7. Engagement e visibilità algoritmica.** Valori del Cap. 1: views, likes, commenti, duetti, posizione nel feed. Sono dati, non codifiche: si raccolgono, non si giudicano. Due avvertenze critiche da verificare nella documentazione corrente della Research API prima di promettere queste misure: (a) la posizione nel feed, per quanto ne so, non è un campo restituito; è dipendente dall'utente e dal momento, e probabilmente non è ricostruibile; (b) per duetti e stitch non sono sicuro che esista un campo dedicato. `[APERTO]` Decidere se la dimensione si riduce alle metriche effettivamente raccolte e riformulare nel Cap. 1 di conseguenza.

**D8. Temporalità della circolazione.** Valori: sincrona / diacronica rispetto alla messa in onda. È derivabile dal confronto tra la data di creazione del video e il calendario di messa in onda. `[PROPOSTA]` Definire un criterio numerico (per esempio la finestra di giorni attorno a una puntata o a una stagione) come parametro esplicito del codebook, perché "sincrona" senza soglia non è replicabile.

## Procedura di codifica

1. **Conferma unità e corpus.** Se non fissati, fermati e chiedi. Leggi §3.4 del disegno di ricerca se disponibile.
2. **Campione pilota.** Prima della codifica estesa, prendi un campione piccolo e usalo per chiudere i valori di D3 e per testare le soglie di D2 e D8. Documenta ogni modifica al codebook.
3. **Codifica con evidenza.** Per ogni valore assegnato nelle dimensioni interpretative (D2, D3, D4, D5, D6) riporta una nota di evidenza breve: cosa nel video giustifica il valore (timestamp, testo, hashtag, trascrizione). Il valore senza evidenza non è verificabile.
4. **Valori mancanti.** Usa "non codificabile" o "indeterminabile" quando l'evidenza non basta. Non riempire per completezza: un valore inventato peggiora il dato più di un vuoto.
5. **Accordo tra codificatori.** Per le dimensioni interpretative serve un secondo codificatore umano su un sottocampione; il coefficiente più usato per variabili nominali è l'alpha di Krippendorff. `[PROPOSTA]` Indicare in 3.5 la quota di sottocampione e la soglia accettata. Se Claude è usato come codificatore, la sua codifica va confrontata con quella umana prima di usarla, e non vale come verità: è un supporto, da dichiarare come tale nel capitolo metodologico.
6. **Output.** Una tabella per livello, non un punteggio unico. Usa le colonne di `references/codebook-template.csv`.

## Cosa non fare

- Non sommare né ponderare le dimensioni tra livelli: il commento delle supervisor sui livelli eterogenei lo vieta in sostanza.
- Non descrivere un risultato empirico come se fosse nel Cap. 1: la griglia è lo strumento, i risultati stanno nel Cap. IV.
- Non citare fonti che non sono nella mappa bibliografica della skill `cap1-framework-teorico` senza verificarle; se una definizione richiede un riferimento (per esempio per il concetto di spreadability), prendilo da lì e controlla pagina e anno.
- Non inventare metriche, campi API o valori di codifica non presenti: se manca un dato, dillo.

## Collegamenti con altre parti della tesi

- **Cap. 1 §1.5:** fonte delle dimensioni. Se la griglia cambia, il Cap. 1 va riallineato (e consegnato in track changes).
- **Cap. III §3.5:** il codebook finale deriva da questa griglia.
- **Cap. IV:** l'applicazione ai brani ('O mar for, Origami all'alba) con le stesse dimensioni per rendere confrontabile §4.3.
- Per revisione del testo del capitolo usa `cap1-framework-teorico`; per il controllo delle citazioni usa gli strumenti di verifica bibliografica.

## Formato di consegna

Quando restituisci una codifica, apri con l'unità di analisi usata e le assunzioni `[PROPOSTA]` attive, poi la tabella, poi un elenco di casi dubbi con la ragione del dubbio. Chiudi con ciò che serve decidere al dottorando.
