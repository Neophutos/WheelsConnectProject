# WheelsConnect - Client/Server Projekt

## Inhaltsverzeichnis
- [Übersicht über die gewählten Technologien und Frameworks](#technologien-frameworks)
    - [Front-End](#frontend)
    - [Back-End](#backend)
- [Erläuterung der Code-Struktur](#code-struktur)
    - [Front-End-Struktur](#frontend-struktur)
    - [Back-End-Struktur](#backend-struktur)
- [Installation und Setup](#installation-setup)
- [Lizenz](#lizenz)

## Übersicht über die gewählten Technologien und Frameworks <a name="technologien-frameworks"></a>

### Front-End <a name="frontend"></a>

- **JavaScript (JS), HTML und CSS**: Für dynamische Interaktivität, Struktur und Design.
- **React**: Für die Erstellung von wiederverwendbaren UI-Komponenten.
- **React-Bootstrap**: Für ein konsistentes und ansprechendes Design.
- **React-Table**: Für die Interaktion mit tabellarischen Daten.
- **Axios**: Für HTTP-Anfragen.

### Back-End <a name="backend"></a>

- **Java**: Als robuste und wartbare Programmiersprache.
- **MySQL**: Als relationales Datenbankmanagementsystem (RDBMS).
- **Hibernate**: Als ORM-Framework zur Erleichterung der Kommunikation zwischen der Java-Anwendung und MySQL.
- **Spring Boot**: Für die Anwendungsentwicklung und eingebettete Serverunterstützung.
- **Apache Tomcat**: Als Webserver.

## Erläuterung der Code-Struktur <a name="code-struktur"></a>

### Front-End-Struktur <a name="frontend-struktur"></a>

Der gesamte Code im Front-End ist unter `src/` organisiert.

- `App.js`: Die Wurzelkomponente und der Einstiegspunkt unserer React-Anwendung.
- `src/components/form/`: Enthält alle Formularkomponenten.
- `src/components/security/`: Verwaltet Komponenten, die mit der Authentifizierung zu tun haben.
- `src/components/view/`: Beherbergt die Komponenten, die für die Anzeige von Daten verantwortlich sind.

### Back-End-Struktur <a name="backend-struktur"></a>

Der gesamte Code im Backend wird unter `src/main/java/com/WheelsConnect` organisiert.

- `model/`: Enthält alle unsere Modellklassen.
- `repository/`: Beherbergt unsere Spring Data JPA-Repositories.
- `controller/`: Hier sind unsere REST-Controller.
- `security/`: Enthält unsere Sicherheitskonfiguration und den Benutzercode.

## Installation und Setup <a name="installation-setup"></a>

1. Stellen Sie sicher, dass Sie die notwendige Software installiert haben: Node.js, npm, Java und MySQL.
2. Klonen Sie das Repository auf Ihren lokalen Computer.
3. Installieren Sie die notwendigen Abhängigkeiten mit `npm install` im Root-Verzeichnis des Projekts.
4. Starten Sie den Server mit `npm start`.
5. Öffnen Sie einen Webbrowser und navigieren Sie zu `http://localhost:3000`.

## Lizenz <a name="lizenz"></a>

Dieses Projekt ist lizenziert unter den Bedingungen der MIT-Lizenz. Weitere Details finden Sie in der [LICENSE](LICENSE) Datei.
