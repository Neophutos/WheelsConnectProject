// Dashboard.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Dashboard = () => {
    const [kundenAnzahl, setKundenAnzahl] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            const response = await axios.get('/kunden');
            setKundenAnzahl(response.data.length);
        };

        fetchData();
    }, []);

    return (
        <div>
            <h2>Dashboard</h2>
            <div>
                <h3>Anzahl der Kunden</h3>
                <div>{kundenAnzahl}</div>
            </div>
        </div>
    );
};

export default Dashboard;
