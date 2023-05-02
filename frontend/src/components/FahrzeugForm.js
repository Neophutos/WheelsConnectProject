import React, {useEffect, useState} from "react";
import { Form, Button } from "react-bootstrap";
import axios from "axios";

const FahrzeugForm = ({ handleClose }) => {
    const [standorte, setStandorte] = useState([]);

    useEffect(() => {
        fetchStandorte();
    }, []);

    const fetchStandorte = async () => {
        try {
            const response = await axios.get('/standorte');
            setStandorte(response.data);
        } catch (error) {
            console.error('Fehler beim Abrufen der Standorte:', error);
        }
    };

    const [fahrzeug, setFahrzeug] = useState({
        marke: "",
        modell: "",
        typ: "",
        baujahr: "",
        farbe: "",
        preis: "",
    });

    const fahrzeugtypen = [
        "Limousine",
        "Kombi",
        "SUV",
        "Cabrio",
        "Coupé",
        "Minivan",
        "Pickup",
        // Füge weitere Fahrzeugtypen hinzu
    ];

    const handleChange = (e) => {
        setFahrzeug({ ...fahrzeug, [e.target.name]: e.target.value });
    };

    const handleStandortChange = (event) => {
        const selectedStandortId = event.target.value;
        const selectedStandort = standorte.find(
            (standort) => standort.id.toString() === selectedStandortId
        );
        setFahrzeug({ ...fahrzeug, standort: selectedStandort });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await axios.post("/fahrzeuge", fahrzeug);
        handleClose();
        window.location.reload(); // Die Seite neu laden, um die aktualisierte Liste anzuzeigen
    };

    return (
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
    );
};

export default FahrzeugForm;