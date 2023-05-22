import React, { useContext } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { AuthContext } from './AuthProvider';

// Diese Komponente ist dafür verantwortlich, die Berechtigungen für bestimmte Routen zu überprüfen.
// Wenn der Benutzer authentifiziert ist, wird er zur gewünschten Route weitergeleitet.
// Wenn der Benutzer nicht authentifiziert ist, wird er zur Login-Seite umgeleitet.
const PrivateRoute = ({ component: Component, ...rest }) => {
    const { isAuthenticated } = useContext(AuthContext); // Überprüfen, ob der Benutzer eingeloggt ist

    return (
        <Route
            {...rest}
            // Wenn der Benutzer authentifiziert ist, wird die gewünschte Komponente gerendert.
            // Andernfalls wird eine Umleitung zur Login-Seite erstellt.
            render={props =>
                isAuthenticated ? (
                    <Component {...props} />
                ) : (
                    <Redirect to="/login" />
                )
            }
        />
    );
};

export default PrivateRoute;
