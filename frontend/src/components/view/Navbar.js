// Navbar.js
import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
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
