import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar, Doughnut} from 'react-chartjs-2';
import { Chart, DoughnutController, BarController, BarElement, ArcElement, LinearScale, CategoryScale } from 'chart.js';

Chart.register(DoughnutController, BarController, BarElement, ArcElement, LinearScale, CategoryScale);


const Dashboard = () => {
    const [kundenAnzahl, setKundenAnzahl] = useState(0);
    const [buchungen, setBuchungen] = useState([]);
    const [fahrzeuge, setFahrzeuge] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const responseKunden = await axios.get('/kunden');
            setKundenAnzahl(responseKunden.data.length);

            const responseBuchungen = await axios.get('/buchungen');
            setBuchungen(responseBuchungen.data);

            const responseFahrzeuge = await axios.get('/fahrzeuge');
            setFahrzeuge(responseFahrzeuge.data);
        };

        fetchData();
    }, []);

    // Berechnungen für die verschiedenen Kennzahlen
    const currentMonth = new Date().getMonth();
    const currentMonthBookings = buchungen.filter(
        (buchung) =>
            new Date(buchung.startdatum).getMonth() === currentMonth
    ).length;

    const fahrzeugStandorte = fahrzeuge.reduce((acc, fahrzeug) => {
        const { standort } = fahrzeug;
        const standortName = standort.name;
        const kapazitaet = standort.kapazitaet;
        const index = acc.findIndex((item) => item.standort === standortName);
        if (index === -1) {
            acc.push({ standort: standortName, count: 1, kapazitaet });
        } else {
            acc[index].count += 1;
        }
        return acc;
    }, []);


    const beliebtesteFahrzeuge = fahrzeuge.map((fahrzeug) => ({
        name: fahrzeug.name,
        bookings: buchungen.filter(
            (buchung) => buchung.fahrzeug.id === fahrzeug.id
        ).length,
    }));

    const createDoughnutCharts = (standorte) => {
        return standorte.map((standort, index) => {
            const { count, kapazitaet } = standort;
            const data = {
                labels: ["Fahrzeuge", "Freie Plätze"],
                datasets: [
                    {
                        data: [count, kapazitaet - count],
                        backgroundColor: ["rgba(75, 192, 192, 0.6)", "rgba(200, 200, 200, 0.6)"],
                    },
                ],
            };

            return (
                <div key={index} style={{ maxWidth: "250px", maxHeight: "250px", padding: "20px", marginBottom: "50px"}}>
                    <h4>{standort.standort}</h4>
                    <Doughnut data={data} width={150} height={150} />
                </div>
            );

        });
    };

    const barData = {
        labels: beliebtesteFahrzeuge.map((fahrzeug) => fahrzeug.name),
        datasets: [
            {
                label: 'Anzahl der Buchungen',
                data: beliebtesteFahrzeuge.map((fahrzeug) => fahrzeug.bookings),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    };

    return (
        <div>
            <h2>Dashboard</h2>
            <div>
                <h3>Anzahl der Kunden</h3>
                <div>{kundenAnzahl}</div>
            </div>
            <div>
                <h3>Anzahl der Buchungen im aktuellen Monat</h3>
                <div>{currentMonthBookings}</div>
            </div>
            <div>
                <h3>Standorte und die Anzahl der Fahrzeuge</h3>
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
                    {createDoughnutCharts(fahrzeugStandorte)}
                </div>
            </div>
            <div>
                <h3>Beliebteste Fahrzeuge</h3>
                <Bar data={barData} options={{ scales: { y: { beginAtZero: true } } }} />
            </div>
        </div>
    );
};

export default Dashboard;