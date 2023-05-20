// Weitere benötigte Importe hinzufügen
import { useContext } from 'react';
import { AuthContext } from '../security/AuthProvider';
import {NavLink} from "react-router-dom";

const Navbar = () => {
    const { isAuthenticated, setIsAuthenticated } = useContext(AuthContext);

    const handleLogout = () => {
        // Authentifizierungsstatus auf false setzen und Token aus dem lokalen Speicher entfernen
        setIsAuthenticated(false);
        localStorage.removeItem('token');
    }

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
