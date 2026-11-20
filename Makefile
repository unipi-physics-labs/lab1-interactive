# Esegui make nella cartella che contiene _quarto.yml.
QUARTO ?= quarto
GHP_IMPORT ?= ghp-import

.PHONY: render publish

# Il comando make, senza argomenti, genera soltanto i file locali.
render:
	$(QUARTO) render --to html

# Pubblica il laboratorio HTML su origin/pages, ricreando la history di quel branch.
publish: render
	test -s _book/index.html
	$(GHP_IMPORT) -n -o -f -p -b pages _book
