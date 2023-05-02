import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import axios from 'axios';

const KundenForm = ({ onSubmit, initialValues = {}, handleClose }) => {
    const [kunde, setKunde] = useState({
        vorname: initialValues.vorname || '',
        nachname: initialValues.nachname || '',
        geburtsdatum: initialValues.geburtsdatum || '',
        adresse: initialValues.adresse || '',
        telefonnummer: initialValues.telefonnummer || '',
        email: initialValues.email || '',
    });

    const handleChange = (event) => {
        const { name, value } = event.target;
        setKunde({ ...kunde, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await onSubmit(kunde);
            handleClose && handleClose();
        } catch (error) {
            console.error('Fehler beim Speichern des Kunden:', error);
        }
    };

    return (
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
                    value={kunde.geburtsdatum}
                    onChange={handleChange}
                    required
                />
            </Form.Group>
            <Form.Group>
                <Form.Label>Adresse</Form.Label>
                <Form.Control
                    type="text"
                    name="adresse"
                    value={kunde.adresse}
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
    );
};

export default KundenForm;
