// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import KundenTable from './components/kunde/KundenTable';
import StandortTable from "./components/standort/StandortTable";
import BuchungTable from "./components/buchung/BuchungTable";
import FahrzeugTable from "./components/fahrzeug/FahrzeugTable";

import './App.css';

const App = () => {
    return (
        <Router>
            <Navbar />
            <div className="App">
                <Switch>
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
