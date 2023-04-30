import React, { useState, useEffect } from "react";
import axios from "axios";
// Importiere hier die Komponenten, die du für die Tabelle und das Formular verwendest

const StandortTable = () => {
    const [standorte, setStandorte] = useState([]);

    useEffect(() => {
        axios.get("/standorte").then((response) => {
            setStandorte(response.data);
        });
    }, []);

    // Füge hier den Code zum Hinzufügen, Aktualisieren und Löschen von Standorten hinzu

    return (
        <div>
            <h2>Standorte</h2>
            {/* Füge hier die Tabelle und das Formular für Standorte hinzu */}
        </div>
    );
};

export default StandortTable;
