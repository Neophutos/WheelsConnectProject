// Importieren der notwendigen Pakete und Komponenten
import React from 'react';
import { NavLink } from 'react-router-dom';

// Die Navbar-Komponente stellt das Navigationsmenü der Anwendung dar.
const Navbar = () => {
    // Es verwendet NavLink-Komponenten aus der react-router-dom-Bibliothek,
    // um Verknüpfungen zu verschiedenen Seiten der Anwendung zu erstellen.
    // Der activeClassName-Prop wird verwendet, um den Link hervorzuheben,
    // der zur aktuellen Route passt.
    return (
        <nav>
            <ul>
                <li>
                    <NavLink to="/" exact activeClassName="active">
                        Dashboard
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/kunden" exact activeClassName="active">
                        Kunden
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/fahrzeuge" exact activeClassName="active">
                        Fahrzeuge
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/buchungen" exact activeClassName="active">
                        Buchungen
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/standorte" exact activeClassName="active">
                        Standorte
                    </NavLink>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;
