# Lavorare sul laboratorio Lab1

Il progetto genera un libro **solo HTML**, con tre laboratori interattivi.
Quarto trasforma i file `.qmd` nei capitoli del sito. La cartella `_book/`
contiene il risultato e viene ricreata durante la generazione.

## File da modificare

| File | Contenuto |
|---|---|
| `_quarto.yml` | Titolo, ordine dei capitoli e opzioni HTML |
| `index.qmd` | Presentazione del percorso |
| `capitoli/distribuzioni-stimatori.qmd` | Definizioni comuni e stimatori |
| `capitoli/binomiale.qmd` | Teoria e attività sulla binomiale |
| `capitoli/poisson.qmd` | Teoria e attività sulla Poissoniana |
| `capitoli/esponenziale.qmd` | Teoria e attività sull'esponenziale |
| `interattivi/binomiale_lab1.html` | Laboratorio binomiale esistente, autonomo |
| `interattivi/poisson_lab1.html`, `interattivi/esponenziale_lab1.html` | Struttura dei due nuovi laboratori |
| `interattivi/distribuzioni-lab.js` | Interazioni e grafici dei due nuovi laboratori |
| `interattivi/lab-statistiche.js` | Calcoli numerici e funzioni grafiche comuni |
| `interattivi/lab-distribuzioni.css` | Aspetto dei due nuovi laboratori |
| `assets/stile.css` | Aspetto dei capitoli |
| `assets/frame-resize.html` | Altezza automatica delle simulazioni incorporate |
| `FONTI.md` | Fonti, attribuzione e licenza |

Il laboratorio binomiale conserva la pagina interattiva dell'ultima versione.
La teoria generale sugli stimatori è ora nel capitolo comune; il capitolo
binomiale mantiene il significato specifico di n, p, k e M.

## Generazione e anteprima locale

Serve Quarto; non occorrono LaTeX, Typst o pacchetti Python per generare
questo progetto. Il workflow incluso usa Quarto 1.11.9.

Dalla cartella che contiene `_quarto.yml`:

```bash
make render
```

Il comando esegue `quarto render --to html`. Puoi aprire `_book/index.html`
nel browser. Per modificare il testo e aggiornare automaticamente l'anteprima:

```bash
quarto preview
```

Interrompi l'anteprima con `Ctrl+C`. Le simulazioni sono eseguite nel browser,
non durante la generazione; all'apertura mostrano il modello e un campione vuoto.

Per condividere una copia offline, distribuisci **tutta la cartella `_book/`**:
un solo file di capitolo non contiene le immagini, gli stili e i laboratori.
I collegamenti alle fonti esterne e alcune funzioni del sito, come la ricerca
locale, possono richiedere una connessione o un server; i laboratori non usano CDN.

## Modificare un capitolo

Un `.qmd` contiene Markdown, formule e metadati opzionali. Per esempio:

````markdown
## Una sezione

La media è $\mu$.

$$
\sigma_{\bar{x}}=\frac{\sigma}{\sqrt M}.
$$

<!-- Questo commento non compare nel testo visualizzato. -->

::: {.callout-note title="Da ricordare" icon=false}
Un risultato essenziale.
:::
````

Per un nuovo capitolo, crea un file in `capitoli/` e aggiungilo a
`book.chapters` in `_quarto.yml`. Per i rimandi usa il file `.qmd`, eventualmente
seguito dall'ancora: Quarto genera il collegamento HTML corrispondente.
Non modificare direttamente i file dentro `_book/`.

## Quali file salvare in Git

Nel branch `main` salva i **sorgenti**: `.qmd`, configurazioni, HTML/JS/CSS dei
laboratori, immagini, Makefile, documentazione e workflow. Le pagine autonome
in `interattivi/` sono sorgenti; quelle copiate in `_book/interattivi/` sono output.

Non aggiungere `_book/`, `.quarto/` o `.DS_Store`. Il `.gitignore` del progetto
li esclude. Se `_book/` era già tracciata, `.gitignore` da solo non basta:
per smettere di tracciarla su `main`, mantenendo i file locali, esegui una volta:

```bash
git rm -r --cached _book
git add .gitignore
git commit -m "Non tracciare l'output generato su main"
```

Controlla sempre `git status` prima del commit. Anche `instructions.md` e
`.gitignore` sono file del progetto e vanno salvati in Git.

## Pubblicare su GitHub Pages

Il metodo di pubblicazione resta quello del progetto caricato:

```bash
make publish
```

Il target rigenera l'HTML e usa `ghp-import` per pubblicare **il contenuto di
`_book/` nel branch `pages`** del remoto `origin`. Serve quindi `ghp-import`
installato e l'accesso in scrittura al repository. Il comando completo è:

```bash
ghp-import -n -o -f -p -b pages _book
```

Il branch `pages` è interamente generato: il comando ne sostituisce contenuto
e cronologia. Non modificarlo manualmente. Nelle impostazioni di GitHub Pages
il sorgente del sito deve essere `pages`, cartella `/(root)`.

`make publish` usa i sorgenti locali anche se non sono stati committati o
pubblicati su `main`; **non esegue il commit o il push dei sorgenti**. Per poter
ricostruire la versione pubblicata, conviene prima salvare le modifiche su `main`:

```bash
git status
git add <file-sorgenti-modificati>
git commit -m "Aggiorna i laboratori"
git push origin main
make publish
```

Sostituisci `<file-sorgenti-modificati>` con i file effettivi; non incollare
quel segnaposto come comando.

## GitHub Actions e release

Il workflow `.github/workflows/publish.yml` resta invariato:

- un push su `main` genera l'HTML e salva l'artifact `lab1-html` per 30 giorni;
- un push di un tag genera anche una release con `lab1_html.zip`;
- il workflow non aggiorna il sito Pages: per quello usi `make publish`.

## Note sui nuovi laboratori

- M conta le osservazioni: conteggi nella Poissoniana, tempi nell'esponenziale.
- Cambiare μ o λ azzera i dati; cambiare l'evento richiesto o i bin li conserva.
- Varianza campionaria, deviazione standard e sua stima per la media usano M−1
  e sono definite solo per M ≥ 2. La media campionaria esiste già con M = 1.
- Le probabilità sono calcolate dal modello, non stimate con una simulazione
  separata. Le frequenze usano i dati correnti.
- La Poissoniana usa μ fra 0 e 100; l'esponenziale λ fra 0,05 e 20 s⁻¹.
  Questi sono limiti dell'interfaccia, non delle distribuzioni.
- Il campione ha un limite di 100.000 osservazioni. I CSV includono il parametro
  usato e possono contenere tutti i dati, anche quando a schermo se ne mostra
  soltanto una parte.
- Il grafico Poissoniano non rinormalizza la coda omessa. L'istogramma
  esponenziale include tutti i tempi simulati e normalizza le aree.
- L'esplorazione dell'assenza di memoria seleziona τ > s e studia τ − s;
  i tempi lunghi non vengono scartati durante la generazione.

## Documentazione

- [Quarto](https://quarto.org/docs/get-started/)
- [Libri Quarto](https://quarto.org/docs/books/)
- [ghp-import](https://github.com/c-w/ghp-import)
