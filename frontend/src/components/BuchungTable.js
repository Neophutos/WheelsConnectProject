import React, { useState, useEffect } from "react";
import axios from "axios";
// Importiere hier die Komponenten, die du für die Tabelle und das Formular verwendest

const BuchungTable = () => {
    const [buchungen, setBuchungen] = useState([]);

    useEffect(() => {
        axios.get("/buchungen").then((response) => {
            setBuchungen(response.data);
        });
    }, []);

    // Füge hier den Code zum Hinzufügen, Aktualisieren und Löschen von Buchungen hinzu

    return (
        <div>
            <h2>Buchungen</h2>
            {/* Füge hier die Tabelle und das Formular für Buchungen hinzu */}
        </div>
    );
};

export default BuchungTable;
