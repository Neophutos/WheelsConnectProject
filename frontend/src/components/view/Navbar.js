import { useContext } from 'react';
import { AuthContext } from '../security/AuthProvider';
import {NavLink} from "react-router-dom";

// Die Navbar-Komponente zeigt das Navigationsmenü der Anwendung.
const Navbar = () => {
    const { isAuthenticated, setIsAuthenticated } = useContext(AuthContext);

    // Die handleLogout-Funktion wird ausgeführt, wenn der Logout-Button gedrückt wird.
    // Sie setzt den Authentifizierungsstatus auf false und entfernt das Token aus dem lokalen Speicher.
    const handleLogout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('token');
    }

    // Die Navbar zeigt verschiedene Links zu Seiten der Anwendung.
    // Wenn der Benutzer eingeloggt ist, wird ein Logout-Button angezeigt.
    // Wenn der Benutzer nicht eingeloggt ist, wird ein Link zur Login-Seite angezeigt.
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
                {!isAuthenticated ? (
                    <li>
                        <NavLink to="/login" exact activeClassName="active">
                            Login
                        </NavLink>
                    </li>
                ) : (
                    <li>
                        <button onClick={handleLogout}>Logout</button>
                    </li>
                )}
            </ul>
        </nav>
    );
};

export default Navbar;
