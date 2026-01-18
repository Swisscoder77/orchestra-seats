Orchester Sitzplan Generator
Eine React-App zur Erstellung und Verwaltung von Orchestersitzplänen mit visueller Gruppenverwaltung und PDF-Export-Funktionalität.

🎵 Funktionen
Dynamischer Sitzplan-Editor: Halbkreisförmige Anordnung mit 1-5 Reihen und bis zu 30 Sitzen pro Reihe

Gruppenverwaltung: Erstelle farbcodierte Gruppen für verschiedene Instrumentengruppen

Ausblend-Funktion: Markiere nicht benötigte Sitze als ausgeblendet

PDF-Export: Generiere druckfertige PDFs mit Legende und Übersicht

Intuitive Bedienung: Einfache Sitzplatz-Zuweisung per Klick

30 vordefinierte Farben: Automatische Farbvorschläge ohne Doppelungen

🚀 Installation
bash
# Repository klonen
git clone <repository-url>
cd orchester-sitzplan

# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev
📖 Bedienung
Grundkonfiguration
Wähle die Anzahl der Reihen (1-5)

Konfiguriere die Sitzanzahl pro Reihe (1-30)

Gruppen erstellen
Gib einen Gruppennamen ein (z.B. "Violinen", "Blechbläser")

Wähle eine Farbe oder behalte den Vorschlag

Klicke auf "+" oder drücke Enter

Sitzplätze zuweisen
Wähle eine Gruppe durch Klick auf das Stift-Icon

Klicke auf die gewünschten Sitzplätze im halbkreisförmigen Layout

Wechsle die Gruppe, um andere Plätze zuzuweisen

PDF exportieren
Klicke auf den "PDF Export" Button, um den Sitzplan als druckfertiges PDF zu speichern.

📦 Abhängigkeiten
React (^18.2.0) - UI Framework

jsPDF (^2.5.1) - PDF-Generierung

Vite - Build Tool und Development Server

🛠️ Entwicklung
bash
# Entwicklungsserver starten
npm run dev

# Produktions-Build erstellen
npm run build

# Build Preview
npm run preview

# ESLint ausführen
npm run lint
🎨 Projektstruktur
text
src/
├── App.jsx              # Hauptkomponente
├── App.css             # Styling
├── main.jsx            # App-Einstiegspunkt
└── index.css           # Globale Styles
📄 PDF-Export Details
Das generierte PDF enthält:

Vektorbasierte Sitzplandarstellung

Farbcodierte Gruppen

Übersichtstabelle der Reihen

Dirigentenplatz (markiert mit "D")

Vollständige Legende

Optimiert für A4 Querformat

🤝 Beitragen
Beiträge sind willkommen! Bitte erstelle einen Fork des Repositories und reiche einen Pull Request mit deinen Änderungen ein.

📝 Lizenz
MIT