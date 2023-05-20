// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Navbar from './components/view/Navbar';
import Dashboard from './components/view/Dashboard';
import KundenTable from './components/view/KundenTable';
import StandortTable from "./components/view/StandortTable";
import BuchungTable from "./components/view/BuchungTable";
import FahrzeugTable from "./components/view/FahrzeugTable";

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
