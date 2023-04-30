// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import KundenTable from './components/KundenTable';
import StandortList from "./components/StandortTable";
import BuchungList from "./components/BuchungTable";
import FahrzeugList from "./components/FahrzeugTable";

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
