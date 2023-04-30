import React, { useState, useEffect } from "react";
import axios from "axios";
// Importiere hier die Komponenten, die du für die Tabelle und das Formular verwendest

const FahrzeugTable = () => {
    const [fahrzeuge, setFahrzeuge] = useState([]);

    useEffect(() => {
        axios.get("/fahrzeuge").then((response) => {
            setFahrzeuge(response.data);
        });
    }, []);

    // Füge hier den Code zum Hinzufügen, Aktualisieren und Löschen von Fahrzeugen hinzu

    return (
        <div>
            <h2>Fahrzeuge</h2>
            {/* Füge hier die Tabelle und das Formular für Fahrzeuge hinzu */}
        </div>
    );
};

export default FahrzeugTable;
