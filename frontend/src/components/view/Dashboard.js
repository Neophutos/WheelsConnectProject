// Importieren der notwendigen Pakete und Komponenten
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar, Doughnut} from 'react-chartjs-2';
import { Chart, DoughnutController, BarController, BarElement, ArcElement, LinearScale, CategoryScale, Tooltip } from 'chart.js';

// Registriert die benötigten Module bei chart.js.
Chart.register(DoughnutController, BarController, BarElement, ArcElement, LinearScale, CategoryScale, Tooltip);

// Die Dashboard-Komponente, die verschiedene Diagramme und Metriken anzeigt.
const Dashboard = () => {

    // Verwendet den useState-Hook von React, um den Zustand der Komponente zu verwalten.
    const [kundenAnzahl, setKundenAnzahl] = useState(0);
    const [buchungen, setBuchungen] = useState([]);
    const [fahrzeuge, setFahrzeuge] = useState([]);

    // Verwendet den useEffect-Hook, um Daten zu holen, wenn die Komponente gemountet wird.
    useEffect(() => {
        // Funktion, um Daten von der Server-API zu holen.
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

    // Logik für das Erstellen und Rendern der Diagramme.
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

            const options = {
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                var label = context.label || '';
                                if (label === 'Fahrzeuge') {
                                    label += ': ' + count;
                                } else if (label === 'Freie Plätze') {
                                    label += ': ' + (kapazitaet - count);
                                }
                                return label;
                            }
                        }
                    }
                }
            }

            return (
                <div key={index} style={{ maxWidth: "250px", maxHeight: "250px", padding: "20px", marginBottom: "50px"}}>
                    <h4>{standort.standort}</h4>
                    <Doughnut data={data} options={options} width={150} height={150} />
                </div>
            );
        });
    };



    // beliebtesteFahrzeuge sortiert nach Buchungsanzahl
    const beliebtesteFahrzeuge = fahrzeuge
        .map((fahrzeug) => ({
            name: fahrzeug.marke + ' ' + fahrzeug.modell,
            buchungen: buchungen.filter(
                (buchung) => buchung.fahrzeug.id === fahrzeug.id
            ).length,
        }))
        .sort((a, b) => b.buchungen - a.buchungen);

    const barData = {
        labels: beliebtesteFahrzeuge.map((fahrzeug) => fahrzeug.name),
        datasets: [
            {
                label: 'Anzahl der Buchungen',
                data: beliebtesteFahrzeuge.map((fahrzeug) => fahrzeug.buchungen),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    };


    return (
        <div>
            <h2 style={{padding: 25}}><b>Willkommen bei WheelsConnect!</b></h2>
            <div>
                <h5 style={{padding: 10}}>Aktuell sind {kundenAnzahl} Kunden bei WheelsConnect registriert.</h5>
                <h5 style={{padding: 10}}>Im aktuellen Monat sind {currentMonthBookings} Buchungen vorhanden.</h5>
            </div>
            <div style={{padding: 25}}>
                <h4><b>Standorte und die Anzahl der Fahrzeuge</b></h4>
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
                    {createDoughnutCharts(fahrzeugStandorte)}
                </div>
            </div>
            <div style={{padding: 10}}>
                <h4><b>Die am häufigsten gebuchten Fahrzeuge</b></h4>
                <div style={{ maxWidth: "500px", margin: "auto"}}>
                <Bar data={barData} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;