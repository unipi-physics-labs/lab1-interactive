// Personalizza il modello libro incluso in Quarto.
// Il testo dei capitoli resta nei file .qmd.
#import "@preview/orange-book:0.7.1": book, part, chapter, appendices

#show: book.with(
  title: [$title$],
  subtitle: [$subtitle$],
  author: "$for(by-author)$$it.name.literal$$sep$, $endfor$",
  lang: "$lang$",
  paper-size: "$papersize$",
  font-size: $fontsize$,
  main-color: rgb("#1c6580"),
  margin: (x: 2.2cm, top: 2.2cm, bottom: 2.2cm),
  outline-depth: $toc-depth$,
  heading-style: 1,
  first-line-indent: false,
  padded-heading-number: false,
  copyright: none,
  supplement-chapter: "Capitolo",
  supplement-part: "Parte",
)
