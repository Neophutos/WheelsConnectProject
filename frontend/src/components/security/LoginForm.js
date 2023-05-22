import React, {useContext, useState} from "react";
import axios from "axios";
import { AuthContext } from './AuthProvider';
import {useHistory} from "react-router-dom";

// Diese Komponente stellt das Login-Formular dar.
// Sie verwendet den AuthContext, um den Authentifizierungsstatus des Benutzers zu setzen.
const LoginForm = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const { setIsAuthenticated } = useContext(AuthContext); // Zugriff auf die Setter-Funktion des Authentifizierungsstatus
    const history = useHistory(); // Zugriff auf die History-API für die Umleitung

    // Diese Funktion wird ausgeführt, wenn das Formular abgeschickt wird.
    // Sie sendet die Anmeldedaten an den Server und setzt den Authentifizierungsstatus entsprechend dem Serverantwort.
    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = {
            username: username,
            password: password,
        };

        try {
            const response = await axios.post("/login", data);
            if (response.status === 200) {
                setIsAuthenticated(true);
                localStorage.setItem('token', response.data.token);
                history.push('/');
            } else {
                console.error("Error logging in", response);
            }
        } catch (error) {
            setError('Fehler bei der Anmeldung. Bitte versuchen Sie es erneut.');
            console.error("Error logging in", error);
        }
    };


    return (
        <form onSubmit={handleSubmit}>
            <label>
                Nutzername:
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
            </label>
            <label>
                Passwort:
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </label>
            <button type="submit">Login</button>
        </form>
    );
};

export default LoginForm;
