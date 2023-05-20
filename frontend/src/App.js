// Importieren von nötigen Modulen und Komponenten für das Routing und die UI
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Navbar from './components/view/Navbar';
import Dashboard from './components/view/Dashboard';
import KundenTable from './components/view/KundenTable';
import StandortTable from "./components/view/StandortTable";
import BuchungTable from "./components/view/BuchungTable";
import FahrzeugTable from "./components/view/FahrzeugTable";

import './App.css'; // Importieren von allgemeinen CSS-Stilen für die App

// Hauptanwendungskomponente, die das Routing und die Struktur der Anwendung verwaltet.
const App = () => {
    return (
        // Verwendung des BrowserRouter (alias "Router"), um die Navigation innerhalb der App zu ermöglichen.
        <Router>
            {/* Die Navbar-Komponente enthält die Hauptnavigation der App. */}
            <Navbar />

            {/* Hauptbereich der App, in dem die verschiedenen Komponenten je nach aktueller Route gerendert werden. */}
            <div className="App">
                {/* Der Switch entscheidet, welche Route auf Grundlage des aktuellen Pfades geladen werden soll. */}
                <Switch>
                    {/* Route-Komponenten definieren, welcher Pfad welche Komponente lädt. */}
                    {/* Das "exact" Attribut in der Root-Route gewährleistet, dass diese Komponente nur dann geladen wird, wenn der Pfad genau "/" ist. */}
                    <Route path="/" exact component={Dashboard} />
                    <Route path="/kunden" component={KundenTable} />
                    <Route path="/buchungen" component={BuchungTable} />
                    <Route path="/fahrzeuge" component={FahrzeugTable} />
                    <Route path="/standorte" component={StandortTable} />
                </Switch>
            </div>
        </Router>
    );
};

export default App;
