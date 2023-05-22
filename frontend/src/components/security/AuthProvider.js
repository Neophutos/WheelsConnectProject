import React, { useState } from 'react';

export const AuthContext = React.createContext();

// AuthProvider ist die Komponente, die den AuthContext zur Verfügung stellt.
// Sie enthält den Authentifizierungsstatus und die Funktion zum Ändern dieses Status.
const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    return (
        // Der AuthContext wird mit den Werten für isAuthenticated und setIsAuthenticated bereitgestellt.
        // Alle untergeordneten Komponenten (children) können auf diese Werte zugreifen.
        <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;

