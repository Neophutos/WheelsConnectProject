// Importieren der notwendigen Pakete und Komponenten
import React, { useEffect, useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import axios from 'axios';
import {toast, ToastContainer} from "react-toastify";

// FahrzeugForm-Komponente: Ein Formular zum Erstellen oder Bearbeiten eines Fahrzeugs
const FahrzeugForm = ({ onSubmit, initialValues = {}, handleClose }) => {

    // State-Variable für Standorte
    const [standorte, setStandorte] = useState([]);

    // Beim ersten Rendering Standorte abrufen
    useEffect(() => {
        fetchStandorte();
    }, []);

    // Funktion zum Anzeigen eines Toasts mit einer Nachricht
    const showToast = (message) => {
        toast.error(message, { autoClose: 5000, position: toast.POSITION.BOTTOM_RIGHT });
    };

    // Funktion zum Abrufen der Standorte von der API
    const fetchStandorte = async () => {
        try {
            const response = await axios.get('/standorte');
            setStandorte(response.data);
        } catch (error) {
            showToast('Ein Fehler ist beim Abrufen der Standorte aufgetreten');
        }
    };

    // Anfangsstatus des Fahrzeugs
    const [fahrzeug, setFahrzeug] = useState({
        marke: initialValues.marke || '',
        modell: initialValues.modell || '',
        typ: initialValues.typ || '',
        baujahr: initialValues.baujahr || '',
        farbe: initialValues.farbe || '',
        preis: initialValues.preis || '',
        standort: initialValues.standort || '',
    });

    // Möglichkeiten für Fahrzeugtypen
    const fahrzeugtypen = [
        'Limousine',
        'Kombi',
        'SUV',
        'Cabrio',
        'Coupé',
        'Minivan',
        'Pickup',
        // Füge weitere Fahrzeugtypen hinzu
    ];

    // Event-Handler, um den Fahrzeugstatus bei einer Änderung zu aktualisieren
    const handleChange = (e) => {
        setFahrzeug({ ...fahrzeug, [e.target.name]: e.target.value });
    };

    // Event-Handler, um den ausgewählten Standort zu aktualisieren
    const handleStandortChange = (event) => {
        const selectedStandortId = event.target.value;
        const selectedStandort = standorte.find(
            (standort) => standort.id.toString() === selectedStandortId
        );
        setFahrzeug({ ...fahrzeug, standort: selectedStandort });
    };

    // Event-Handler für das Absenden des Formulars
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await onSubmit(fahrzeug);
            handleClose && handleClose();
        } catch (error) {
            showToast('Ein Fehler ist beim Speichern des Fahrzeugs aufgetreten');
        }
    };


    return (
        <>
        <Form onSubmit={handleSubmit}>
            <Form.Group>
                <Form.Label>Marke</Form.Label>
                <Form.Control
                    type="text"
                    name="marke"
                    value={fahrzeug.marke}
                    onChange={handleChange}
                    required
                />
            </Form.Group>

            <Form.Group>
                <Form.Label>Modell</Form.Label>
                <Form.Control
                    type="text"
                    name="modell"
                    value={fahrzeug.modell}
                    onChange={handleChange}
                    required
                />
            </Form.Group>

            <Form.Group>
                <Form.Label>Typ</Form.Label>
                <Form.Control
                    as="select"
                    name="typ"
                    value={fahrzeug.typ}
                    onChange={handleChange}
                    required
                >
                    <option value="">Wählen Sie einen Typ</option>
                    {fahrzeugtypen.map((typ, index) => (
                        <option key={index} value={typ}>
                            {typ}
                        </option>
                    ))}
                </Form.Control>
            </Form.Group>

            <Form.Group>
                <Form.Label>Baujahr</Form.Label>
                <Form.Control
                    as="select"
                    name="baujahr"
                    value={fahrzeug.baujahr}
                    onChange={handleChange}
                    required
                >
                    <option value="">Wählen Sie ein Baujahr</option>
                    {(() => {
                        const currentYear = new Date().getFullYear();
                        const startYear = 1900;
                        const years = Array.from({ length: currentYear - startYear + 1 }, (_, index) => startYear + index);
                        return years.map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ));
                    })()}
                </Form.Control>
            </Form.Group>

            <Form.Group>
                <Form.Label>Farbe</Form.Label>
                <Form.Control
                    type="text"
                    name="farbe"
                    value={fahrzeug.farbe}
                    onChange={handleChange}
                    required
                />
            </Form.Group>

            <Form.Group>
                <Form.Label>Preis</Form.Label>
                <Form.Control
                    type="number"
                    step="0.01"
                    name="preis"
                    value={fahrzeug.preis}
                    onChange={handleChange}
                    required
                />
            </Form.Group>

            <Form.Group>
                <Form.Label>Standort</Form.Label>
                <Form.Control
                    as="select"
                    name="standort"
                    value={fahrzeug.standort?.id}
                    onChange={handleStandortChange}
                    required
                >
                    <option value="">Standort auswählen</option>
                    {standorte.map((standort) => (
                        <option key={standort.id} value={standort.id}>
                            {standort.name}
                        </option>
                    ))}
                </Form.Control>
            </Form.Group>

            <Button variant="primary" type="submit">
                Fahrzeug speichern
            </Button>
        </Form>
    <ToastContainer />
</>
    );
};

export default FahrzeugForm;
