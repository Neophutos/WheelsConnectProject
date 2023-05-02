import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import axios from 'axios';

const StandortForm = ({ onSubmit, initialValues = {}, handleClose }) => {
    const [standort, setStandort] = useState({
        name: initialValues.name || '',
        kapazitaet: initialValues.kapazitaet || '',
        adresse: initialValues.adresse || '',
        telefonnummer: initialValues.telefonnummer || '',
        oeffnungszeiten: initialValues.oeffnungszeiten || '',
    });

    const handleChange = (event) => {
        const { name, value } = event.target;
        setStandort({ ...standort, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await onSubmit(standort);
            handleClose && handleClose();
        } catch (error) {
            console.error('Fehler beim Speichern des Standorts:', error);
        }
    };

    return (
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
                <Form.Label>Adresse</Form.Label>
                <Form.Control
                    type="text"
                    name="adresse"
                    value={standort.adresse}
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
    );
};

export default StandortForm;
