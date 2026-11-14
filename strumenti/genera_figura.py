"""Rigenera la figura statica. Facoltativo: richiede matplotlib.

Dal progetto: python3 strumenti/genera_figura.py
Non serve eseguire questo script per generare HTML e PDF con Quarto.
"""
from pathlib import Path
from math import comb
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

ROOT = Path(__file__).resolve().parents[1]
plt.rcParams.update({"font.size": 11, "axes.titlesize": 12,
                     "axes.spines.top": False, "axes.spines.right": False,
                     "axes.edgecolor": "#9ca9b8", "text.color": "#18344b",
                     "axes.labelcolor": "#18344b"})
fig, axes = plt.subplots(1, 2, figsize=(10.6, 3.8), layout="constrained")
for ax, n, p, xmax, title, xlabel in [
    (axes[0], 4, .5, 4, "Moneta equa · n = 4", "k = numero di teste"),
    (axes[1], 100, 1/6, 40, "Dado equo · n = 100", "k = numero di uscite di 1"),
]:
    x = list(range(xmax + 1))
    probability = [comb(n, k) * p**k * (1-p)**(n-k) for k in x]
    ax.bar(x, probability, width=.72, color="#3676b6", zorder=3)
    ax.axvline(n*p, color="#007b73", ls="--", lw=1.7, label="Media μ", zorder=4)
    ax.set(title=title, xlabel=xlabel, ylabel="Probabilità B(k; n, p)")
    ax.set_ylim(bottom=0)
    ax.grid(axis="y", color="#e2e8ed", zorder=0)
    ax.set_axisbelow(True)
    ax.set_xticks(range(5) if n == 4 else range(0, 41, 10))
    ax.legend(frameon=False, fontsize=10)
fig.savefig(ROOT / "immagini/binomiale_confronto.png", dpi=220, facecolor="white")
plt.close(fig)
