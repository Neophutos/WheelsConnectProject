import React, { useState, useEffect } from 'react';
import { useTable } from 'react-table';
import axios from 'axios';
import {Modal, Button} from 'react-bootstrap';
import FahrzeugForm from "../form/FahrzeugForm";
import { AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';

const FahrzeugTable = () => {
    const [data, setData] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedFahrzeug, setSelectedFahrzeug] = useState(null);
    const [editingModal, setEditingModal] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const response = await axios.get('/fahrzeuge');
        setData(response.data);
    };

    const handleAdd = async (fahrzeug) => {
        await axios.post('/fahrzeuge', fahrzeug);
        fetchData();
    };

    const handleUpdate = async (id, fahrzeug) => {
        await axios.put(`/fahrzeuge/${id}`, fahrzeug);
        fetchData();
    };

    const handleDelete = async (id) => {
        await axios.delete(`/fahrzeuge/${id}`);
        fetchData();
    };

    const handleShowEditForm = (fahrzeug) => {
        setSelectedFahrzeug(fahrzeug);
        setEditingModal(true);
    };
    const handleShowDeleteConfirm = (fahrzeug) => {
        setSelectedFahrzeug(fahrzeug);
        setShowDeleteConfirm(true);
    };

    const columns = React.useMemo(
        () => [
            {
                Header: 'ID',
                accessor: 'id',
            },
            {
                Header: 'Marke',
                accessor: 'marke',
            },
            {
                Header: 'Modell',
                accessor: 'modell',
            },
            {
                Header: 'Typ',
                accessor: 'typ',
            },
            {
                Header: 'Baujahr',
                accessor: 'baujahr',
            },
            {
                Header: 'Farbe',
                accessor: 'farbe',
            },
            {
                Header: 'Preis',
                accessor: 'preis',
            },
            {
                Header: 'Standort',
                accessor: 'standort.name',
            },
        ],
        []
    );

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable({ columns, data });

    return (
        <div>
            <h2>Fahrzeuge</h2>
            <Button variant={"dark"} className={"btn-darkmode"} onClick={() => setShowForm(true)}>Fahrzeug hinzufügen</Button>
            <Modal show={showForm} onHide={() => setShowForm(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Fahrzeug hinzufügen</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <FahrzeugForm onSubmit={handleAdd} handleClose={() => setShowForm(false)} />
                </Modal.Body>
            </Modal>
            <Modal show={editingModal} onHide={() => setEditingModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Buchung bearbeiten</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <FahrzeugForm
                        onSubmit={(updatedBuchung) => {
                            handleUpdate(selectedFahrzeug.id, updatedBuchung);
                            setEditingModal(false);
                        }}
                        initialValues={selectedFahrzeug}
                        handleClose={() => setEditingModal(false)}
                    />
                </Modal.Body>
            </Modal>
            <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Löschen bestätigen</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Möchten Sie diesen Eintrag wirklich löschen?
                    <div className="text-right">
                        <Button
                            variant="danger"
                            onClick={() => {
                                handleDelete(selectedFahrzeug.id);
                                setShowDeleteConfirm(false);
                            }}
                        >
                            Löschen
                        </Button>
                        <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
                            Abbrechen
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
            <table className={"table-dark"} {...getTableProps()}>
                <thead>
                {headerGroups.map((headerGroup) => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map((column) => (
                            <th {...column.getHeaderProps()} className="table-dark-header">
                                {column.render('Header')}
                            </th>
                        ))}
                    </tr>
                ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                {rows.map((row) => {
                    prepareRow(row);
                    return (
                            <tr {...row.getRowProps()}>
                                {row.cells.map((cell) => {
                                    return (
                                        <td {...cell.getCellProps()} className="table-dark-cell">
                                            {cell.render('Cell')}
                                        </td>
                                    );
                                })}
                                <td>
                                    <button
                                        onClick={() => handleShowEditForm(row.original)}
                                        style={{ background: 'none',border: 'none', color: 'blue', cursor: 'pointer' }}>
                                        <AiOutlineEdit />
                                    </button>
                                    <button
                                        onClick={() => handleShowDeleteConfirm(row.original)}
                                        style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}
                                    >
                                        <AiOutlineDelete />
                                    </button>
                                </td>
                            </tr>
                    );
                })}
                </tbody>
            </table>
        </div>
    );
};

export default FahrzeugTable;
