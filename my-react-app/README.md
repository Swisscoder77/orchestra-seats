# 🎵 Orchester Sitzplan Generator

Eine React-Anwendung zur Erstellung und Verwaltung von Orchestersitzplänen mit visueller Gruppenverwaltung und PDF-Export-Funktionalität.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18.2.0-61dafb.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Funktionen

- **Dynamischer Sitzplan-Editor**: Halbkreisförmige Anordnung mit 1-5 Reihen und bis zu 30 Sitzen pro Reihe
- **Gruppenverwaltung**: Erstelle farbcodierte Gruppen für verschiedene Instrumentengruppen
- **Ausblend-Funktion**: Markiere nicht benötigte Sitze als ausgeblendet
- **PDF-Export**: Generiere druckfertige PDFs mit Legende und Übersicht
- **Intuitive Bedienung**: Einfache Sitzplatz-Zuweisung per Klick
- **30 vordefinierte Farben**: Automatische Farbvorschläge ohne Doppelungen

## 🚀 Installation
```bash
# Repository klonen
git clone <repository-url>
cd orchester-sitzplan

# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev
```

## 📖 Bedienung

### Grundkonfiguration

1. Wähle die Anzahl der Reihen (1-5)
2. Konfiguriere die Sitzanzahl pro Reihe (1-30)

### Gruppen erstellen

1. Gib einen Gruppennamen ein (z.B. "Violinen", "Blechbläser")
2. Wähle eine Farbe oder behalte den Vorschlag
3. Klicke auf "+" oder drücke Enter

### Sitzplätze zuweisen

1. Wähle eine Gruppe durch Klick auf das Stift-Icon
2. Klicke auf die gewünschten Sitzplätze im halbkreisförmigen Layout
3. Wechsle die Gruppe, um andere Plätze zuzuweisen

### PDF exportieren

Klicke auf den "PDF Export" Button, um den Sitzplan als druckfertiges PDF zu speichern.

## 📦 Technologie-Stack

| Technologie | Version | Zweck |
|------------|---------|-------|
| React | ^18.2.0 | UI Framework |
| jsPDF | ^2.5.1 | PDF-Generierung |
| Vite | - | Build Tool und Development Server |

## 🛠️ Entwicklung
```bash
# Entwicklungsserver starten
npm run dev

# Produktions-Build erstellen
npm run build

# Build Preview
npm run preview

# ESLint ausführen
npm run lint
```

## 🎨 Projektstruktur
```
src/
├── App.jsx              # Hauptkomponente
├── App.css             # Styling
├── main.jsx            # App-Einstiegspunkt
└── index.css           # Globale Styles
```

## 📄 PDF-Export Details

Das generierte PDF enthält:

- ✅ Vektorbasierte Sitzplandarstellung
- ✅ Farbcodierte Gruppen
- ✅ Übersichtstabelle der Reihen
- ✅ Dirigentenplatz (markiert mit "D")
- ✅ Vollständige Legende
- ✅ Optimiert für A4 Querformat

## 📝 Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert.

## 👤 Autor

Dein Name - [@mhausl]

