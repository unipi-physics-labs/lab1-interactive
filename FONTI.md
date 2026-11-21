# Fonti e attribuzione

## Dispense di riferimento

**Luca Baldini, Niccolò Di Lalla, Massimiliano Razzano e Carmelo Sgrò**,
*Introduzione all'analisi dei dati. Per il laboratorio di Fisica*.

- Repository: https://github.com/unipi-physics-labs/lab1-notes
- Licenza: **Creative Commons Attribuzione – Condividi allo stesso modo 4.0
  Internazionale (CC BY-SA 4.0)**, https://creativecommons.org/licenses/by-sa/4.0/.
  La copia della licenza è inclusa in `LICENSE.txt`.

## Contenuti e modifiche

- **Distribuzioni, campioni e stimatori:** nuova sintesi delle definizioni generali
  per variabili discrete e continue con densità; normalizzazione, cumulativa,
  momenti, stimatori e incertezza della media. Quantili e simulazione mediante
  inversa della cumulativa sono presentati come approfondimento.
- **Binomiale:** mantenuti gli esempi e la pagina interattiva della versione
  fornita dall'autrice; sostituita la ripetizione delle definizioni degli
  stimatori con rimandi al capitolo comune. Mantenuta la distinzione fra k/n
  in una serie e media dei conteggi fra M serie.
- **Poissoniana:** sintesi di probabilità, momenti, limite della binomiale e somma
  di conteggi indipendenti. L'esempio dei 500 lanci di tre dadi riprende le dispense.
- **Esponenziale:** collegamento μ = λΔt, derivazione dalla probabilità di zero
  eventi, densità, probabilità, momenti e assenza di memoria. Linea temporale e
  simulazione delle attese residue sono nuove visualizzazioni per il laboratorio.

Non sono state riprodotte immagini del PDF: i nuovi grafici sono generati
nel browser a partire dai modelli e dai dati simulati.

## Simulazioni e figure

`interattivi/binomiale_lab1.html` è la pagina interattiva già preparata per il
progetto, che cita le dispense *statnotes*, versione 6.2.7, §§5.1–5.2,
pp. 109–114. La figura `immagini/binomiale_confronto.png` appartiene alla
precedente versione del progetto.

I nuovi laboratori `interattivi/poisson_lab1.html` ed
`interattivi/esponenziale_lab1.html` condividono stile e funzioni JavaScript.
Il parametro `?embed=1` evita di ripetere l'introduzione quando la simulazione
è incorporata nel capitolo e attiva l'adattamento dell'altezza della cornice.
Aprendo i file senza questo parametro si vede la pagina completa.

Il testo adattato, le figure e il materiale originale di questo progetto sono
distribuiti con licenza CC BY-SA 4.0. Le dipendenze di Quarto incluse nell'HTML
generato mantengono le rispettive licenze. Quarto non è incluso nei sorgenti.

Prima versione del progetto: 14 novembre 2026. Ampliamento con capitolo comune,
Poissoniana ed esponenziale: 21 novembre 2026.
