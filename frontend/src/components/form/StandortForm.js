// Importieren der notwendigen Pakete und Komponenten
import React, { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import {toast, ToastContainer} from "react-toastify";

// StandortForm-Komponente: Ein Formular zum Erstellen oder Bearbeiten eines Standorts
const StandortForm = ({ onSubmit, initialValues = {}, handleClose }) => {
    // Anfangsstatus des Standorts
    const [standort, setStandort] = useState({
        name: initialValues.name || '',
        kapazitaet: initialValues.kapazitaet || '',
        adresse: initialValues.adresse || '',
        stadt: initialValues.stadt || '',
        plz: initialValues.plz || '',
        land: initialValues.land || '',
        telefonnummer: initialValues.telefonnummer || '',
        oeffnungszeiten: initialValues.oeffnungszeiten || '',
    });

    // Funktion zum Anzeigen eines Toasts mit einer Nachricht
    const showToast = (message) => {
        toast.error(message, { autoClose: 5000, position: toast.POSITION.BOTTOM_RIGHT });
    };

    // Funktion, die ausgeführt wird, wenn sich die initialValues ändern, um den Standortstatus zu aktualisieren
    useEffect(() => {
        if (initialValues && Object.keys(initialValues).length > 0) {
            setStandort({
                name: initialValues.name || '',
                kapazitaet: initialValues.kapazitaet || '',
                adresse: initialValues.adresse || '',
                stadt: initialValues.stadt || '',
                plz: initialValues.plz || '',
                land: initialValues.land || '',
                telefonnummer: initialValues.telefonnummer || '',
                oeffnungszeiten: initialValues.oeffnungszeiten || '',
            });
        }
    }, [initialValues]);

    // Event-Handler, um den Standortstatus bei einer Änderung zu aktualisieren
    const handleChange = (event) => {
        const { name, value } = event.target;
        setStandort({ ...standort, [name]: value });
    };

    // Event-Handler für das Absenden des Formulars
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await onSubmit(standort);
            handleClose && handleClose();
        } catch (error) {
            showToast('Ein Fehler ist beim Speichern des Standorts aufgetreten.');
        }
    };


    return (
        <>
        <Form onSubmit={handleSubmit}>
            <Form.Group>
                <Form.Label>Name</Form.Label>
                <Form.Control
                    type="text"
                    name="name"
                    value={standort.name}
                    onChange={handleChange}
                    required
                />
            </Form.Group>

            <Form.Group>
                <Form.Label>Kapazität</Form.Label>
                <Form.Control
                    type="number"
                    name="kapazitaet"
                    value={standort.kapazitaet}
                    onChange={handleChange}
                    required
                />
            </Form.Group>

            <Form.Group>
                <Form.Label>Straße und Hausnummer</Form.Label>
                <Form.Control
                    type="text"
                    name="adresse"
                    value={standort.adresse}
                    onChange={handleChange}
                    required
                />
            </Form.Group>

            <Form.Group>
                <Form.Label>Stadt</Form.Label>
                <Form.Control
                    type="text"
                    name="stadt"
                    value={standort.stadt}
                    onChange={handleChange}
                    required
                />
            </Form.Group>

            <Form.Group>
                <Form.Label>Postleitzahl</Form.Label>
                <Form.Control
                    type="text"
                    name="plz"
                    value={standort.plz}
                    onChange={handleChange}
                    required
                />
            </Form.Group>

            <Form.Group>
                <Form.Label>Land</Form.Label>
                <Form.Control
                    type="text"
                    name="land"
                    value={standort.land}
                    onChange={handleChange}
                    required
                />
            </Form.Group>

            <Form.Group>
                <Form.Label>Telefonnummer</Form.Label>
                <Form.Control
                    type="text"
                    name="telefonnummer"
                    value={standort.telefonnummer}
                    onChange={handleChange}
                    required
                />
            </Form.Group>

            <Form.Group>
                <Form.Label>Öffnungszeiten</Form.Label>
                <Form.Control
                    type="text"
                    name="oeffnungszeiten"
                    value={standort.oeffnungszeiten}
                    onChange={handleChange}
                    required
                />
            </Form.Group>

            <Button variant='primary' type='submit'>
                Standort speichern
            </Button>
        </Form>
    <ToastContainer />
</>
    );
};

export default StandortForm;
