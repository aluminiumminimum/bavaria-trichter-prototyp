# Design-System (verbindliche CI)

Die Gestaltung dieses Produkts ist mit der Geschäftsführung abgestimmt und Teil der
Anforderung, nicht Inspiration. Der Prototyp — live unter
https://aluminiumminimum.github.io/bavaria-trichter-prototyp/ — ist die verbindliche
visuelle Referenz. Was hier beschrieben ist, dient TriniDat als Nachschlagewerk beim
Nachbau; bei Zweifeln entscheidet die Optik im Prototyp, nicht diese Tabelle.

Die Palette trägt den internen Namen „C1 · Petrol & Sand". Sie löst eine ältere,
grünere Optik ab, auf der die Konzeptpräsentation vom Juli 2026 (Grundlage der
Aufwandsabschätzung) noch beruhte — siehe dazu 15-delta.md. Für den Nachbau zählt
ausschließlich diese Datei.

## Farbwerte

Alle Werte sind Hex-Farbwerte bzw. Verlaufs-/Schattendefinitionen, wie sie im
Stylesheet des Prototyps hinterlegt sind. Die Namen in der ersten Spalte sind
technische Bezeichner aus dem Quellcode und historisch gewachsen — an einigen
Stellen weicht der Name von der heutigen Bedeutung ab (z. B. bezeichnet ein Name mit
„sage" heute den Petrol-Jade-Ton, ein Name mit „brass" das Gold). Maßgeblich ist der
Hex-Wert und die Verwendungsspalte, nicht der Name.

| Token-Name | Hex / Wert | Verwendung |
|---|---|---|
| --cream | #F3EFE7 | Ivory-Canvas, Grundfläche der ganzen App |
| --cream2 | #EAE5D9 | Zweiter, etwas dunklerer Ivory-Ton (Verläufe, Trennflächen) |
| --paper | #FAF7F1 | Etiketten-Papier: Grundfläche von Karten |
| --paper2 | #F3EFE7 | Zweiter Papier-Ton (Verläufe auf Karten) |
| --ink | #22302F | Haupttextfarbe (Fließtext, Überschriften) |
| --ink-soft | #47585A | Abgeschwächter Text (Zwischenüberschriften, Nebentext) |
| --muted | #586364 | Gedämpfter Text (Labels, Zeitangaben); gegenüber dem Entwurf leicht abgedunkelt, damit 4,5:1 auf Ivory und Papier sicher erreicht wird |
| --faint | #626F6F | Sehr leiser Text (Fußzeilen, Mikro-Beschriftung) |
| --brass | #C2A87C | Gold als Fläche und Gravur (Ringe, Icons, Zierlinien) — niemals Fließtext auf hellem Grund |
| --brass-deep | #766445 | Gold als Text auf hellem Grund (Zahlen, Links, Akzent-Text); gegenüber dem Entwurf abgedunkelt für 4,5:1-Lesbarkeit |
| --brass-soft | #EFE7D6 | Helle Goldfläche (Icon-Hintergründe) |
| --brass-line | #D7C7A6 | Goldfarbene Trennlinie/Rahmen |
| --hair | rgba(34,48,47,.14) | Kräftigere Haarlinie (Kartenrahmen) |
| --hair2 | rgba(34,48,47,.08) | Feine Haarlinie (Trenner innerhalb von Karten) |
| --sage | #35565A | Mittlerer Petrol-Ton (Icons, sekundäre Flächen) |
| --sage-deep | #223B3E | Petrol-Jade — DER strukturelle Dunkelton der App (Knopf-Grund, dunkle Flächen) |
| --sage-soft | #E3EBEB | Helle Petrol-Fläche (Icon-Hintergründe, ruhige Zustände) |
| --terra | #8F3A22 | Zinnober — Signalfarbe für Eskalation/„stockt"/überfällig, nicht dekorativ |
| --terra-soft | #F2E3DC | Helle Zinnober-Fläche (Warn-Icon-Hintergrund) |
| --espresso-grad | linear-gradient(135deg,#223B3E,#2C4A4D) | Dunkler Verlauf für Petrol-Flächen |
| --brass-grad | linear-gradient(120deg,#B08F5E,#C9B189) | Goldverlauf für Zierflächen |
| --ortho | #766445 | Fachbereichsfarbe Orthopädie |
| --neuro | #4A6478 | Fachbereichsfarbe Neurologie |
| --geri | #3F5F52 | Fachbereichsfarbe Geriatrie |
| --innere | #35565A | Fachbereichsfarbe Innere |
| --saluto | #7A6440 | Fachbereichsfarbe SalutoCare (Premium-Linie) |
| --unklar | #586364 | Fachbereich ungeklärt/nicht zugeordnet |
| --shadow | 0 1px 2px rgba(34,48,47,.05), 0 8px 24px rgba(34,48,47,.08), 0 24px 64px -24px rgba(34,48,47,.14) | Kräftiger Kartenschatten (herausgehobene Karten, Kopfblöcke) |
| --shadow-soft | 0 1px 2px rgba(34,48,47,.05), 0 6px 16px rgba(34,48,47,.07) | Zurückhaltender Kartenschatten (Standardkarten) |
| --amber | #7D6331 | Bernstein-Text (Warnstufe unterhalb von Zinnober) |
| --alert | #8F3A22 | Alarmfarbe, identisch mit Zinnober |
| --raised | #FAF7F1 | Leicht angehobene Fläche, identisch mit Papier |
| --rose | #8E5B54 | Rosé-Ton (untergeordnete Statusfarbe) |
| --rose-soft | #F2E5E1 | Helle Rosé-Fläche |
| --petrol | #35565A | Petrol-Ton, identisch mit --sage |
| --petrol-soft | #E3EBEB | Helle Petrol-Fläche, identisch mit --sage-soft |
| --aurora-grad | linear-gradient(110deg,#223B3E,#35565A 45%,#C2A87C 80%,#846934) | Mehrfarbiger Zierverlauf (Hero-Flächen) |
| --azzurro | #5A7175 | Kühler Nebenton (sekundärer Text/Zierlinie); gegenüber dem Entwurf nachgeschärft für 4,5:1 |
| --slate | #586364 | Schiefer-Grauton, identisch mit --muted |
| --jade-line | #3C5B5E | Jade-Haarlinie im Etiketten-System (Kartenrahmen, äußerer Ring) |
| --jade-hair | rgba(34,59,62,.30) | Jade-Haarlinie, transparente Variante |
| --gold-faint | rgba(194,168,124,.28) | Sehr leiser Gold-Schimmer (Zierflächen) |
| --gold-soft | rgba(194,168,124,.5) | Gold-Innenring auf dunklen Knöpfen |
| --ivory-tx | #EDE8DC | Elfenbein-Text auf dunklem/Lack-Grund (z. B. Schrift auf Petrol-Jade-Knöpfen) |
| --ivory-mut | rgba(237,232,220,.66) | Gedämpftes Elfenbein auf dunklem Grund |
| --glass | rgba(243,239,231,.72) | Halbtransparente Glasfläche (Overlays) |
| --glass-border | rgba(34,48,47,.08) | Rahmen auf Glasflächen |
| --glass-hi | rgba(250,247,241,.85) | Hellere Glasfläche (Lichtreflex-Effekt) |

## Typografie

Drei Schriftfamilien, jede mit einer festen Rolle. Sie werden nicht austauschbar
verwendet — welche Schrift an welcher Stelle steht, ist Teil der Identität:

- **Schibsted Grotesk** — für Zahlen, Kennzahlen, Überschriften und Headlines.
  Trägt die großen Ziffern (Kennzahlkacheln, Prozentanzeigen, Trichterstufen) und
  alle Titelzeilen. Wird auch kursiv für den Begrüßungssatz auf der Startseite
  eingesetzt.
- **Inter** — für den gesamten UI-Text: Fließtext, Beschriftungen, Formularfelder,
  Buttons, Listentexte. Die Grundschrift der App.
- **IBM Plex Mono** — für Etiketten und Kicker: kurze, großgeschriebene
  Mikro-Beschriftungen mit weitem Buchstabenabstand (z. B. Kategorie-Label über
  Karten, Stand-Angaben, technisch anmutende Kennungen). Signalisiert „das ist eine
  Metainformation, kein Inhalt".

Zahlen werden grundsätzlich mit tabellarischen Ziffern (feste Breite je Ziffer)
gesetzt, damit sich Kennzahlen beim Aktualisieren nicht seitlich verschieben.

## Grundformen

- **Karten** sind die durchgängige Baueinheit der Oberfläche: helle Papier-Fläche
  (--paper) auf dem etwas dunkleren Ivory-Grund (--cream), mit einer feinen
  Haarlinie als Rahmen und einem zurückhaltenden Schatten (--shadow-soft), bei
  herausgehobenen Karten dem kräftigeren --shadow.
- **Radien:** Die App arbeitet mit einer kleinen Radius-Familie statt beliebiger
  Werte — kleine Elemente (Buttons, Chips, Icon-Kreise) bekommen kleine Radien
  (im Bereich von 4 px an härteren Kanten bis hin zu vollrunden Chips/Avataren),
  Karten deutlich größere Radien (18–24 px), damit die Fläche weich wirkt, ohne
  verspielt zu sein.
- **Etiketten-Optik:** Hervorgehobene Karten und Kapitelmarkierungen erhalten einen
  Doppelrahmen — eine Jade-Haarlinie außen, einen goldenen Innenring innerhalb der
  Karte — sowie an Hauptkarten goldene Eck-Winkel. Dazu kommen „Kapitel-Siegel":
  kleine runde Marken, bei denen die Signalfarbe (Zinnober) gefüllt und die
  Nebenfarben nur als Goldring dargestellt sind. Dieses Etiketten-System kennzeichnet
  durchgehend, welche Karte die „wichtigste" auf einer Seite ist.
- **Schatten** sind grundsätzlich weich und mehrschichtig (mehrere überlagerte,
  sehr diffuse Schattenwerte statt eines einzelnen harten Schattens), damit Karten
  auf dem strukturierten Ivory-Grund schweben statt zu kleben.
- **Knöpfe:** Der Hauptknopf ist eine dunkle Petrol-Jade-Fläche mit hellem
  Elfenbein-Text und einem feinen Gold-Innenring — keine Goldfläche mit Text
  darauf (siehe Kontrastregeln). Der Nebenknopf ist eine helle Papierfläche mit
  goldfarbenem Rahmen und dunklerem Text.

## Verbindliche Kontrastregeln

- **Text muss mindestens 4,5:1 Kontrast zu seinem Hintergrund erreichen** — das
  gilt für jede Textfarbe sowohl auf dem Ivory-Grund als auch auf der helleren
  Papierfläche der Karten. Bedeutungstragende, nicht-textliche Elemente (Icons,
  Status-Punkte, Ring-Grafiken) müssen mindestens 3:1 erreichen.
- **Gold auf hellem Grund ist Zierde, nie Text.** Die Goldfarbe (--brass) dient
  ausschließlich als Fläche, Rahmen, Ring oder Gravur-Element. Wo Gold als Text auf
  hellem Grund gebraucht wird, kommt der abgedunkelte Gold-Text-Ton (--brass-deep)
  zum Einsatz, der eigens für ausreichenden Kontrast angepasst wurde.
- **Dunkles Petrol-Jade ist der Knopf-Grund für Hauptaktionen**, kombiniert mit
  heller (elfenbeinfarbener) Schrift darauf — nicht umgekehrt. Ein Goldverlauf als
  Knopf-Grund mit hellem Text wurde geprüft und verworfen, weil er den
  Mindestkontrast verfehlte.
- Wo ein Referenz- oder Entwurfswert diese Grenze gerissen hätte, wurde er in der
  Helligkeit nachgeschärft (betrifft die Token für gedämpften Text, Gold-Text auf
  hell und den kühlen Nebenton) — der Farbton selbst blieb dabei unverändert.

## Responsivität

Die Oberfläche muss von 390 px (schmales Mobiltelefon) bis 1440 px (Desktop)
tragfähig sein, ohne dass an irgendeiner Breite ein horizontaler Scrollbalken
entsteht. Layouts stellen bei schmaler Breite auf eine einspaltige, mobile
Reihenfolge um; ab einer definierten Breitenschwelle erscheinen mehrspaltige
Anordnungen und zusätzliche Bildelemente, die auf Mobilgeräten ausgeblendet
bleiben. Alle interaktiven Flächen (Buttons, Karten mit Klickfunktion, Formularfelder)
sind mindestens 44 px hoch, damit sie auf einem Touchscreen zuverlässig treffbar
sind.

*Stand: 25.08.2026 · Quelle: Prototyp-Commit 073b7b7 + Aufwandsabschätzung 04.08.*
