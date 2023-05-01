import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import StandortForm from './StandortForm';

const StandortModal = ({ buttonText, onSubmit, standort }) => {
    const [show, setShow] = useState(false);
    const [formStandort, setFormStandort] = useState(standort || {});

    const handleClose = () => setShow(false);
    const handleShow = () => {
        setFormStandort(standort || {});
        setShow(true);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        onSubmit(formStandort);
        handleClose();
    };

    return (
        <>
            <Button variant="primary" onClick={handleShow}>
                {buttonText}
            </Button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>{buttonText}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <StandortForm
                        standort={formStandort}
                        setStandort={setFormStandort}
                        onSubmit={handleSubmit}
                    />
                </Modal.Body>
            </Modal>
        </>
    );
};

export default StandortModal;