import React, {useEffect, useState} from 'react';
import { Form, Button } from 'react-bootstrap';
import {toast, ToastContainer} from "react-toastify";

const KundenForm = ({ onSubmit, initialValues = {}, handleClose }) => {

    const getTodayDateString = () => {
        const today = new Date();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const year = today.getFullYear();

        return `${year}-${month}-${day}`;
    };

    useEffect(() => {
        if (initialValues && Object.keys(initialValues).length > 0) {
            setKunde({
                vorname: initialValues.vorname || '',
                nachname: initialValues.nachname || '',
                geburtsdatum: initialValues.geburtsdatum || getTodayDateString(),
                adresse: initialValues.adresse || '',
                stadt: initialValues.stadt || '',
                plz: initialValues.plz || '',
                land: initialValues.land || '',
                telefonnummer: initialValues.telefonnummer || '',
                email: initialValues.email || '',
            });
        }
    }, [initialValues]);

    const showToast = (message) => {
        toast.error(message, { autoClose: 5000, position: toast.POSITION.BOTTOM_RIGHT });
    };

    const [kunde, setKunde] = useState({
        vorname: '',
        nachname: '',
        geburtsdatum: '',
        adresse: '',
        stadt: '',
        plz: '',
        land: '',
        telefonnummer: '',
        email: '',
    });

    const handleChange = (e) => {
        setKunde({ ...kunde, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Aktualisierte Kundendaten erstellen und das Enddatum korrekt überschreiben
        const updatedKunde = { ...kunde, geburtsdatum: kunde.geburtsdatum};

        try {
            await onSubmit(updatedKunde);
            handleClose && handleClose();
        } catch (error) {
            showToast('Ein Fehler ist beim Speichern des Kunden aufgetreten');
        }
    };

    return (
        <>
        <Form onSubmit={handleSubmit}>
            <Form.Group>
                <Form.Label>Vorname</Form.Label>
                <Form.Control
                    type="text"
                    name="vorname"
                    value={kunde.vorname}
                    onChange={handleChange}
                    required
                />
            </Form.Group>
            <Form.Group>
                <Form.Label>Nachname</Form.Label>
                <Form.Control
                    type="text"
                    name="nachname"
                    value={kunde.nachname}
                    onChange={handleChange}
                    required
                />
            </Form.Group>
            <Form.Group>
                <Form.Label>Geburtsdatum</Form.Label>
                <Form.Control
                    type="date"
                    name="geburtsdatum"
                    defaultValue={kunde.geburtsdatum}
                    onChange={handleChange}
                    required
                />
            </Form.Group>
            <Form.Group>
                <Form.Label>Straße und Hausnummer</Form.Label>
                <Form.Control
                    type="text"
                    name="adresse"
                    value={kunde.adresse}
                    onChange={handleChange}
                    required
                />
            </Form.Group>

            <Form.Group>
                <Form.Label>Stadt</Form.Label>
                <Form.Control
                    type="text"
                    name="stadt"
                    value={kunde.stadt}
                    onChange={handleChange}
                    required
                />
            </Form.Group>

            <Form.Group>
                <Form.Label>Postleitzahl</Form.Label>
                <Form.Control
                    type="text"
                    name="plz"
                    value={kunde.plz}
                    onChange={handleChange}
                    required
                />
            </Form.Group>

            <Form.Group>
                <Form.Label>Land</Form.Label>
                <Form.Control
                    type="text"
                    name="land"
                    value={kunde.land}
                    onChange={handleChange}
                    required
                />
            </Form.Group>

            <Form.Group>
                <Form.Label>Telefonnummer</Form.Label>
                <Form.Control
                    type="text"
                    name="telefonnummer"
                    value={kunde.telefonnummer}
                    onChange={handleChange}
                    required
                />
            </Form.Group>
            <Form.Group>
                <Form.Label>E-Mail</Form.Label>
                <Form.Control
                    type="email"
                    name="email"
                    value={kunde.email}
                    onChange={handleChange}
                    required
                />
            </Form.Group>

            <Button variant='primary' type='submit'>
                Kunde speichern
            </Button>
        </Form>
        <ToastContainer/>
        </>
    );
};

export default KundenForm;
