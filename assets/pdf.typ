// Dispensa da leggere anche a schermo: evita le pagine bianche
// che il modello libro aggiunge per iniziare i capitoli sul recto.
#show pagebreak.where(to: "odd"): it => pagebreak(weak: it.weak)
