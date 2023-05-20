// Importieren der notwendigen Pakete und Komponenten
import React, { useEffect, useState } from 'react';
import { Form, Button} from 'react-bootstrap';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// BuchungsForm-Komponente: Ein Formular zum Erstellen oder Bearbeiten einer Buchung.
const BuchungsForm = ({ onSubmit, initialValues = {}, handleClose, isEditing = false }) => {

    // State-Variablen für Kunden und Fahrzeuge
    const [kunden, setKunden] = useState([]);
    const [fahrzeuge, setFahrzeuge] = useState([]);

    // Beim ersten Rendering Kunden und Fahrzeuge abrufen
    useEffect(() => {
        fetchKunden();
        fetchFahrzeuge();
    }, []);

    // Wenn initialValues (bereits vorhandene Werte) übergeben werden, aktualisiere die Buchungsdaten entsprechend
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

    // Funktion zum Anzeigen eines Toasts mit einer Fehlernachricht
    const showToast = (message) => {
        toast.error(message, { autoClose: 5000, position: toast.POSITION.BOTTOM_RIGHT });
    };

    // Funktion zum Abrufen der Kunden von der API
    const fetchKunden = async () => {
        try {
            const response = await axios.get('/kunden');
            setKunden(response.data);
        } catch (error) {
            console.error('Fehler beim Abrufen der Kunden:', error);
        }
    };

    // Funktion zum Abrufen der Fahrzeuge von der API
    const fetchFahrzeuge = async () => {
        try {
            const response = await axios.get('/fahrzeuge');
            setFahrzeuge(response.data);
        } catch (error) {
            console.error('Fehler beim Abrufen der Fahrzeuge:', error);
        }
    };

    // Anfangsstatus der Buchung
    const [buchung, setBuchung] = useState({
        startdatum: '',
        enddatum: '',
        buchungsstatus: 'Angelegt',
        kunde: null,
        fahrzeug: null,
    });

    // Möglichkeiten für den Buchungsstatus
    const buchungsstatusOptions = [
        'Reserviert',
        'Abgeholt',
        'Storniert',
        'Zurückgegeben',
    ];

    // Event-Handler, um den Buchungsstatus bei einer Änderung zu aktualisieren
    const handleChange = (e) => {
        setBuchung({ ...buchung, [e.target.name]: e.target.value });
    };

    // Event-Handler, um den ausgewählten Kunden zu aktualisieren
    const handleKundeChange = (event) => {
        const selectedKundeId = event.target.value;
        const selectedKunde = kunden.find(
            (kunde) => kunde.id.toString() === selectedKundeId
        );
        setBuchung({ ...buchung, kunde: selectedKunde });
    };

    // Event-Handler, um das ausgewählte Fahrzeug zu aktualisieren
    const handleFahrzeugChange = (event) => {
        const selectedFahrzeugId = event.target.value;
        const selectedFahrzeug = fahrzeuge.find(
            (fahrzeug) => fahrzeug.id.toString() === selectedFahrzeugId
        );
        setBuchung({ ...buchung, fahrzeug: selectedFahrzeug });
    };

    // Funktion, um das heutige Datum als Zeichenkette zurückzugeben
    const getTodayDateString = () => {
        const today = new Date();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const year = today.getFullYear();

        return `${year}-${month}-${day}`;
    };

    // Funktion, um den Gesamtpreis zu berechnen
    const calculateGesamtpreis = () => {
        if (!buchung.startdatum || !buchung.enddatum || !buchung.fahrzeug) {
            return 0;
        }

        const startDatumObj = new Date(buchung.startdatum);
        const endDatumObj = new Date(buchung.enddatum);

        const start = new Date(Date.UTC(startDatumObj.getFullYear(), startDatumObj.getMonth(), startDatumObj.getDate()));
        const end = new Date(Date.UTC(endDatumObj.getFullYear(), endDatumObj.getMonth(), endDatumObj.getDate()));

        const days = (end - start) / (1000 * 60 * 60 * 24) + 1;

        return days * buchung.fahrzeug.preis;
    };

    // Event-Handler für das Absenden des Formulars
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Überprüfen, ob Kunde und Fahrzeug ausgewählt wurden
        if (!buchung.fahrzeug || !buchung.kunde) {
            showToast('Bitte wählen Sie einen Kunden und ein Fahrzeug aus.');
            return;
        }

        // Überprüfen, ob das Enddatum vor dem Startdatum liegt
        if (new Date(buchung.enddatum) < new Date(buchung.startdatum)) {
            showToast('Das Enddatum darf nicht vor dem Startdatum liegen. Bitte korrigieren Sie das Datum.');
            return;
        }

        // Wenn wir eine neue Buchung erstellen, prüfen wir, ob das Fahrzeug verfügbar ist
        if (!isEditing) {
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
        }

        const gesamtpreis = calculateGesamtpreis();

        // Aktualisierte Buchungsdaten erstellen und das Enddatum korrekt überschreiben
        const updatedBuchung = { ...buchung, gesamtpreis, enddatum: buchung.enddatum };

        // Versuch, die Buchung zu speichern
        try {
            await onSubmit(updatedBuchung);
            handleClose && handleClose();
        } catch (error) {
            showToast('Ein Fehler ist beim Speichern der Buchung aufgetreten.');
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
                    disabled={isEditing}
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
                    disabled={isEditing}
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
        <ToastContainer />
    </>
    );
};

export default BuchungsForm;