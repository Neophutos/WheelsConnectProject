import React, { useEffect, useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import axios from 'axios';

const BuchungsForm = ({ handleClose }) => {
    const [kunden, setKunden] = useState([]);
    const [fahrzeuge, setFahrzeuge] = useState([]);

    useEffect(() => {
        fetchKunden();
        fetchFahrzeuge();
    }, []);

    const fetchKunden = async () => {
        try {
            const response = await axios.get('/kunden');
            setKunden(response.data);
        } catch (error) {
            console.error('Fehler beim Abrufen der Kunden:', error);
        }
    };

    const fetchFahrzeuge = async () => {
        try {
            const response = await axios.get('/fahrzeuge');
            setFahrzeuge(response.data);
        } catch (error) {
            console.error('Fehler beim Abrufen der Fahrzeuge:', error);
        }
    };

    const [buchung, setBuchung] = useState({
        startdatum: '',
        enddatum: '',
        buchungsstatus: 'Angelegt',
        kunde: null,
        fahrzeug: null,
    });

    const handleChange = (e) => {
        setBuchung({ ...buchung, [e.target.name]: e.target.value });
    };

    const handleKundeChange = (event) => {
        const selectedKundeId = event.target.value;
        const selectedKunde = kunden.find(
            (kunde) => kunde.id.toString() === selectedKundeId
        );
        setBuchung({ ...buchung, kunde: selectedKunde });
    };

    const handleFahrzeugChange = (event) => {
        const selectedFahrzeugId = event.target.value;
        const selectedFahrzeug = fahrzeuge.find(
            (fahrzeug) => fahrzeug.id.toString() === selectedFahrzeugId
        );
        setBuchung({ ...buchung, fahrzeug: selectedFahrzeug });
    };

    const calculateGesamtpreis = () => {
        if (!buchung.startdatum || !buchung.enddatum || !buchung.fahrzeug) {
            return 0;
        }

        const start = new Date(buchung.startdatum);
        const end = new Date(buchung.enddatum);
        const days = (end - start) / (1000 * 60 * 60 * 24) + 1;

        return days * buchung.fahrzeug.preis;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Verfügbarkeit des Fahrzeugs prüfen
        const availabilityResponse = await axios.post("/buchungen/check-availability", {
            fahrzeugId: buchung.fahrzeug.id,
            startdatum: buchung.startdatum,
            enddatum: buchung.enddatum,
        });

        const isAvailable = availabilityResponse.data.available;
        if (!isAvailable) {
            alert("Das gewählte Fahrzeug ist im angegebenen Zeitraum nicht verfügbar. Bitte wählen Sie ein anderes Fahrzeug oder ändern Sie das Datum.");
            return;
        }

        const gesamtpreis = calculateGesamtpreis();

        await axios.post("/buchungen", { ...buchung, gesamtpreis });
        handleClose();
        window.location.reload(); // Die Seite neu laden, um die aktualisierte Liste anzuzeigen
    };

    return (
        <Form onSubmit={handleSubmit}>
            {/* ...weitere Formularfelder für startdatum, enddatum, buchungsstatus... */}

            <Form.Group>
                <Form.Label>Kunde</Form.Label>
                <Form.Control
                    as='select'
                    name='kunde'
                    value={buchung.kunde?.id}
                    onChange={handleKundeChange}
                    required
                >
                    <option value=''>Kunde auswählen</option>
                    {kunden.map((kunde) => (
                        <option key={kunde.id} value={kunde.id}>
                            {kunde.vorname} {kunde.nachname}
                        </option>
                    ))}
                </Form.Control>
            </Form.Group>
            <Form.Group>
                <Form.Label>Fahrzeug</Form.Label>
                <Form.Control
                    as='select'
                    name='fahrzeug'
                    value={buchung.fahrzeug?.id}
                    onChange={handleFahrzeugChange}
                    required
                >
                    <option value=''>Fahrzeug auswählen</option>
                    {fahrzeuge.map((fahrzeug) => (
                        <option key={fahrzeug.id} value={fahrzeug.id}>
                            {fahrzeug.marke} {fahrzeug.modell}
                        </option>
                    ))}
                </Form.Control>
            </Form.Group>

            <Form.Group>
                <Form.Label>Startdatum</Form.Label>
                <Form.Control
                    type='date'
                    name='startdatum'
                    value={buchung.startdatum}
                    onChange={handleChange}
                    required
                />
            </Form.Group>

            <Form.Group>
                <Form.Label>Enddatum</Form.Label>
                <Form.Control
                    type='date'
                    name='enddatum'
                    value={buchung.enddatum}
                    onChange={handleChange}
                    required
                />
            </Form.Group>

            <Form.Group>
                <Form.Label>Buchungsstatus</Form.Label>
                <Form.Control
                    plaintext
                    readOnly
                    name='buchungsstatus'
                    value={buchung.buchungsstatus}
                />
            </Form.Group>

            <Button variant='primary' type='submit'>
                Buchung speichern
            </Button>
        </Form>
    );
};

export default BuchungsForm;