import React, { useEffect, useState } from 'react';
import { Form, Button, Toast, ToastContainer } from 'react-bootstrap';
import axios from 'axios';

const BuchungsForm = ({ onSubmit, initialValues = {}, handleClose }) => {
    const [kunden, setKunden] = useState([]);
    const [fahrzeuge, setFahrzeuge] = useState([]);

    useEffect(() => {
        fetchKunden();
        fetchFahrzeuge();
    }, []);

    useEffect(() => {
        if (initialValues && Object.keys(initialValues).length > 0) {
            setBuchung({
                startdatum: initialValues.startdatum || getTodayDateString(),
                enddatum: initialValues.enddatum || getTodayDateString(),
                buchungsstatus: initialValues.buchungsstatus || "Reserviert",
                kunde: initialValues.kunde || null,
                fahrzeug: initialValues.fahrzeug || null,
            });
        }
    }, [initialValues]);

    const [toast, setToast] = useState({ show: false, message: '' });

    const showToast = (message) => {
        setToast({ show: true, message });
        setTimeout(() => setToast({ show: false, message: '' }), 5000);
    };


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

    const buchungsstatusOptions = [
        'Reserviert',
        'Abgeholt',
        'Storniert',
        'Zurückgegeben',
    ];

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

    const getTodayDateString = () => {
        const today = new Date();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const year = today.getFullYear();

        return `${year}-${month}-${day}`;
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

        if (!buchung.fahrzeug || !buchung.kunde) {
            showToast('Bitte wählen Sie einen Kunden und ein Fahrzeug aus.');
            return;
        }

        // Überprüfen, ob das Enddatum vor dem Startdatum liegt
        if (new Date(buchung.enddatum) < new Date(buchung.startdatum)) {
            showToast('Das Enddatum darf nicht vor dem Startdatum liegen. Bitte korrigieren Sie das Datum.');
            return;
        }

        // Verfügbarkeit des Fahrzeugs prüfen
        const availabilityResponse = await axios.post("/buchungen/check-availability", {
            fahrzeugId: buchung.fahrzeug.id,
            startdatum: buchung.startdatum,
            enddatum: buchung.enddatum,
        });

        const isAvailable = availabilityResponse.data.available;
        if (!isAvailable) {
            showToast("Das gewählte Fahrzeug ist im angegebenen Zeitraum nicht verfügbar. Bitte wählen Sie ein anderes Fahrzeug oder ändern Sie das Datum.");
            return;
        }

        const gesamtpreis = calculateGesamtpreis();

        const response = await axios.post("/buchungen", { ...buchung, gesamtpreis });
        const createdBuchung = response.data;

        try {
            await onSubmit(createdBuchung);
            handleClose && handleClose();
        } catch (error) {
            console.error('Fehler beim Speichern der Buchung:', error);
        }
    };



    return (
        <>
        <Form onSubmit={handleSubmit}>
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
                    defaultValue={buchung.startdatum}
                    onChange={handleChange}
                    required
                />
            </Form.Group>

            <Form.Group>
                <Form.Label>Enddatum</Form.Label>
                <Form.Control
                    type='date'
                    name='enddatum'
                    defaultValue={buchung.enddatum}
                    onChange={handleChange}
                    required
                />
            </Form.Group>

            <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Control
                    as="select"
                    name="buchungsstatus"
                    value={buchung.buchungsstatus}
                    onChange={handleChange}
                    required
                >
                    <option value="">Status auswählen</option>
                    {buchungsstatusOptions.map((status, index) => (
                        <option key={index} value={status}>
                            {status}
                        </option>
                    ))}
                </Form.Control>
            </Form.Group>

            <Button variant='primary' type='submit'>
                Buchung speichern
            </Button>
        </Form>
        <ToastContainer position="bottom-center">
            <Toast show={toast.show} onClose={() => setToast({ show: false, message: '' })} delay={5000} autohide>
                <Toast.Header>
                    <strong className="me-auto">Fehler</strong>
                </Toast.Header>
                <Toast.Body>{toast.message}</Toast.Body>
            </Toast>
        </ToastContainer>
    </>
    );
};

export default BuchungsForm;