# Lab1 con Quarto: un capitolo, HTML e PDF

Questa cartella è un progetto completo: una breve introduzione e **un capitolo
sulla distribuzione binomiale**, con la simulazione integrata nell'HTML e una
figura statica nel PDF. Gli stessi sorgenti producono entrambi i formati.

## 1. Guarda subito il risultato

Estrai tutto il file ZIP. Nella cartella `lab1_quarto` trovi già:

- `_book/index.html`: la pagina iniziale della dispensa; aprila nel browser;
- `_book/capitoli/binomiale.html`: il capitolo;
- `_book/lab1_dispensa.pdf`: il PDF completo;
- `interattivi/binomiale_lab1.html`: la simulazione completa, apribile da sola.

Per consultare l'HTML conserva tutta la cartella `_book`: contiene anche immagini,
simulazione, stili e script. Per lavorare usa l'anteprima Quarto descritta sotto,
che serve le pagine localmente e consente il corretto funzionamento della ricerca.

## 2. Che cosa fa Quarto

Scrivi il contenuto in file **`.qmd`**: sono normali file di testo con titoli,
paragrafi, formule LaTeX, immagini e riquadri. Quarto li trasforma in pagine HTML
oppure in un PDF impaginato.

Il file **`_quarto.yml`** stabilisce titolo, ordine dei capitoli e formati.
La cartella **`_book`** contiene il risultato generato: non modificarla a mano,
perché una nuova generazione sovrascrive le modifiche.

| Percorso | A che cosa serve |
|---|---|
| `_quarto.yml` | Configurazione e ordine dei capitoli |
| `index.qmd` | Introduzione della dispensa |
| `capitoli/binomiale.qmd` | Testo del primo capitolo: modifica questo file |
| `modelli/capitolo.qmd` | Modello da copiare per un nuovo capitolo |
| `interattivi/binomiale_lab1.html` | Simulazione autonoma |
| `immagini/binomiale_confronto.png` | Figura comune a HTML e PDF |
| `assets/stile.css` | Aspetto della versione HTML |
| `assets/frame-resize.html` | Adattamento dell'altezza della simulazione |
| `assets/pdf.typ`, `assets/typst-show.typ` | Impaginazione del PDF |
| `strumenti/genera_figura.py` | Script facoltativo per rigenerare la figura |
| `FONTI.md`, `LICENSE.txt` | Fonti, modifiche e licenza |

## 3. Installa Quarto

1. Scarica l'installer per il tuo sistema da https://quarto.org/docs/get-started/.
2. Installa Quarto e riapri il Terminale.
3. Controlla l'installazione:

```sh
quarto --version
```

Il progetto è stato verificato con **Quarto 1.11.9**. Usa una versione recente.
Il campo `author` di `_quarto.yml` contiene il segnaposto «Progetto Lab1»:
puoi sostituirlo con il nome da mostrare in copertina.
Non servono Python, R, Jupyter o LaTeX per generare questa dispensa. Per il PDF
usiamo **Typst, incluso in Quarto**: `typst` è il nome del formato da indicare nel
comando, ma il risultato è un normale file `.pdf`.

Per modificare i file puoi usare un editor di testo, per esempio VS Code.
L'estensione Quarto per VS Code è comoda ma non obbligatoria. Evita Word e i file
di testo formattato: i sorgenti devono rimanere testo semplice UTF-8.

## 4. Apri il progetto e avvia l'anteprima

Apri il Terminale e spostati nella cartella estratta. Per esempio, su macOS se
si trova in Download:

```sh
cd ~/Downloads/lab1_quarto
```

Adatta il percorso alla posizione effettiva. Su macOS puoi anche digitare `cd `
(con uno spazio), trascinare la cartella dal Finder nel Terminale e premere Invio.
Tutti i comandi seguenti vanno eseguiti dalla cartella che contiene `_quarto.yml`.

Avvia l'anteprima:

```sh
quarto preview --to html
```

Quarto apre il browser. Modifica `capitoli/binomiale.qmd`, salva e guarda
l'anteprima aggiornarsi. Il Terminale deve rimanere aperto mentre lavori.
Per fermare l'anteprima premi **Ctrl+C** nel Terminale (anche su Mac).
Non è una pubblicazione online: l'anteprima è sul tuo computer.

## 5. Genera i file da distribuire

Per generare la versione HTML:

```sh
quarto render --to html
```

Il punto di ingresso è `_book/index.html`. Per consegnare o pubblicare il sito,
distribuisci tutta la cartella `_book`, non il solo `index.html`.

Per generare il PDF:

```sh
quarto render --to typst
```

Il risultato è `_book/lab1_dispensa.pdf`. Puoi distribuire questo file da solo.

Per generare entrambi:

```sh
quarto render --to all
```

I sorgenti restano gli stessi. Dopo ogni modifica, rigenera i formati che vuoi
distribuire. Il PDF non dipende da una stampa della pagina web.

## 6. Modifica il testo

In `capitoli/binomiale.qmd` trovi questa sintassi:

```markdown
# Titolo del capitolo

## Titolo della sezione

Un paragrafo con una parola **importante**.

La media è $\mu=np$.

$$
\sigma=\sqrt{np(1-p)}.
$$

::: {.callout-note title="Da ricordare" icon=false}
Il risultato essenziale, con il suo significato e le condizioni di validità.
:::
```

`#` indica il capitolo, `##` una sezione, `###` una sottosezione. Quarto gestisce
la numerazione. `$...$` inserisce una formula nel testo e `$$...$$` una formula
su una riga separata. Non occorre scrivere una struttura LaTeX completa.

Per iniziare, cambia una frase, salva e controlla l'anteprima. I riquadri seguono
sempre la stessa struttura: obiettivi, risultati essenziali, errori frequenti,
attività e approfondimento facoltativo.

## 7. Aggiungi un secondo capitolo

1. Copia `modelli/capitolo.qmd` in `capitoli/poisson.qmd`.
2. Cambia il titolo, il testo e l'identificatore `{#sec-nuovo-capitolo}`: ogni
   identificatore deve essere unico nel libro.
3. Aggiungi il file all'elenco `chapters` in `_quarto.yml`:

```yaml
book:
  title: "Lab1: misure e statistica"
  # Mantieni le altre opzioni già presenti.
  chapters:
    - index.qmd
    - capitoli/binomiale.qmd
    - capitoli/poisson.qmd
```

Questo è un estratto: modifica l'elenco esistente, senza aggiungere un secondo
blocco `book`. In YAML l'indentazione conta: usa spazi, non tabulazioni.
Riavvia l'anteprima dopo aver cambiato la configurazione del progetto.

## 8. Come funziona la parte interattiva

Nel capitolo, la simulazione è contenuta in una cornice HTML (`iframe`).
Il parametro `?embed=1` mostra solo la parte sperimentale, evitando di ripetere
il testo del capitolo. Il collegamento sopra la cornice apre la pagina completa,
che comprende anche il calcolo dell'efficienza.

Quarto include la cornice soltanto nell'HTML. Nel PDF compare invece una nota
che rimanda alla versione HTML e alla figura statica. I comandi di selezione sono:

```markdown
::: {.content-visible when-format="html"}
Contenuto riservato al browser.
:::

::: {.content-visible unless-format="html"}
Contenuto per il PDF.
:::
```

Qui il PDF è generato con Typst: per questa alternativa usa `unless-format="html"`,
come nel capitolo, e non `when-format="pdf"`.

La figura è già inclusa: non devi eseguire codice per ricrearla. Lo script
`strumenti/genera_figura.py` è fornito per eventuali modifiche future e richiede
Python con matplotlib. Le formule dell'HTML usano MathML, supportato dai browser
moderni, senza scaricare librerie matematiche da servizi esterni.

## 9. Se qualcosa non funziona

- **“quarto: command not found”**: installa Quarto e riapri il Terminale.
- **Il capitolo non compare**: controlla il percorso nell'elenco `chapters`.
- **Errore nel file YAML**: controlla spazi e allineamento; riparti dalla copia
  originale dello ZIP se necessario.
- **La simulazione non appare**: usa `quarto preview --to html` e verifica che
  la cartella `interattivi` sia rimasta nel progetto.
- **Il PDF non si genera**: verifica `quarto --version` e aggiorna Quarto.
  Il comando previsto è `quarto render --to typst`.
- **Una modifica scompare**: verifica di avere modificato un `.qmd`, non un
  file generato dentro `_book`.

Il progetto si può successivamente mettere in un nuovo repository Git e
pubblicare su GitHub Pages. Questa cartella non configura ancora una pubblicazione
automatica. `.gitignore` esclude `_book` e la cache `.quarto` dai futuri commit:
la copia già generata nello ZIP serve soltanto per consultare subito il risultato.

## Fonti e riuso

Il capitolo rielabora le dispense `unipi-physics-labs/lab1-notes`, mantenendo
l'attribuzione e la licenza CC BY-SA 4.0. Vedi `FONTI.md` per autori, revisione
consultata e descrizione delle modifiche.
