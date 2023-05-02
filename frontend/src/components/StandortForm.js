import React, {useState, useEffect} from 'react';
import { Form, Button } from 'react-bootstrap';
import axios from 'axios';

const StandortForm = ({ handleClose }) => {
    const [standort, setStandort] = useState({});

    const handleChange = (event) => {
        const { name, value } = event.target;
        setStandort({ ...standort, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await axios.post('/standorte', standort);
        handleClose();
        window.location.reload(); // Die Seite neu laden, um die aktualisierte Liste anzuzeigen
    };

    return (
        <Form onSubmit={handleSubmit}>
            <Form.Group>
                <Form.Label>Name</Form.Label>
                <Form.Control
                    type="text"
                    name="name"
                    value={standort.name || ''}
                    onChange={handleChange}
                    required
                />
            </Form.Group>

            <Form.Group>
                <Form.Label>Kapazität</Form.Label>
                <Form.Control
                    type="number"
                    name="kapazitaet"
                    value={standort.kapazitaet || ''}
                    onChange={handleChange}
                    required
                />
            </Form.Group>

            <Form.Group>
                <Form.Label>Adresse</Form.Label>
                <Form.Control
                    type="text"
                    name="adresse"
                    value={standort.adresse || ''}
                    onChange={handleChange}
                    required
                />
            </Form.Group>

            <Form.Group>
                <Form.Label>Telefonnummer</Form.Label>
                <Form.Control
                    type="text"
                    name="telefonnummer"
                    value={standort.telefonnummer || ''}
                    onChange={handleChange}
                    required
                />
            </Form.Group>

            <Form.Group>
                <Form.Label>Öffnungszeiten</Form.Label>
                <Form.Control
                    type="text"
                    name="oeffnungszeiten"
                    value={standort.oeffnungszeiten || ''}
                    onChange={handleChange}
                    required
                />
            </Form.Group>

            <Button type="submit">Speichern</Button>
        </Form>
    );
};

export default StandortForm;
