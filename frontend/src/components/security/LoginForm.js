import React, {useContext, useState} from "react";
import axios from "axios";
import { AuthContext } from './AuthProvider';
import {useHistory} from "react-router-dom";

const LoginForm = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(""); // Add this line

    const { setIsAuthenticated } = useContext(AuthContext);
    const history = useHistory(); // Add this line

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
                Username:
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
            </label>
            <label>
                Password:
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
