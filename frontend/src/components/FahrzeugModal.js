import React, { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import FahrzeugForm from "./FahrzeugForm";

const FahrzeugModal = () => {
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    return (
        <>
            <Button variant="primary" onClick={handleShow}>
                Fahrzeug hinzufügen
            </Button>

            <Modal show={show} onHide={handleClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Fahrzeug hinzufügen</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <FahrzeugForm handleClose={handleClose} />
                </Modal.Body>
            </Modal>
        </>
    );
};

export default FahrzeugModal;
