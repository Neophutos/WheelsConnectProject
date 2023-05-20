// Importieren der notwendigen Pakete und Komponenten
import React, { useState, useEffect } from 'react';
import { useTable } from 'react-table';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';
import StandortForm from "../form/StandortForm";
import { AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';

// Die StandortTable-Komponente zeigt die Tabelle für Standorte an.
const StandortTable = () => {

    // Verwendet den useState-Hook von React, um den Zustand der Komponente zu verwalten.
    const [data, setData] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedStandort, setselectedStandort] = useState(null);
    const [editingModal, setEditingModal] = useState(false);

    // Verwendet den useEffect-Hook, um Daten zu holen, wenn die Komponente gemountet wird.
    useEffect(() => {
        fetchData();
    }, []);

    // Funktion, um Daten von der Server-API zu holen.
    const fetchData = async () => {
        const response = await axios.get('/standorte');
        setData(response.data);
    };

    // Methoden zum Hinzufügen, Aktualisieren und Löschen von Kunden über die API.
    const handleAdd = async (standort) => {
        await axios.post('/standorte', standort);
        fetchData();
    };

    const handleUpdate = async (id, standort) => {
        await axios.put(`/standorte/${id}`, standort);
        fetchData();
    };

    const handleDelete = async (id) => {
        await axios.delete(`/standorte/${id}`);
        fetchData();
    };

    // Methoden zum Anzeigen des Bearbeitungsformulars und der Löschbestätigung.
    const handleShowEditForm = (standort) => {
        setselectedStandort(standort);
        setEditingModal(true);
    };
    const handleShowDeleteConfirm = (standort) => {
        setselectedStandort(standort);
        setShowDeleteConfirm(true);
    };

    // Logik für die Erstellung und Darstellung der Tabelle.
    const columns = React.useMemo(
        () => [
            {
                Header: 'ID',
                accessor: 'id',
            },
            {
                Header: 'Name',
                accessor: 'name',
            },
            {
                Header: 'Kapazität',
                accessor: 'kapazitaet',
            },
            {
                Header: 'Adresse',
                accessor: 'adresse',
            },
            {
                Header: 'Stadt',
                accessor: 'stadt',
            },
            {
                Header: 'PLZ',
                accessor: 'plz',
            },
            {
                Header: 'Land',
                accessor: 'land',
            },
            {
                Header: 'Telefonnummer',
                accessor: 'telefonnummer',
            },
            {
                Header: 'Öffnungszeiten',
                accessor: 'oeffnungszeiten',
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
            <h2>Standorte</h2>
            <Button variant={"dark"} className={"btn-darkmode"} onClick={() => setShowForm(true)}>Standort hinzufügen</Button>
            <Modal show={showForm} onHide={() => setShowForm(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Standort hinzufügen</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <StandortForm onSubmit={handleAdd} handleClose={() => setShowForm(false)} />
                </Modal.Body>
            </Modal>
            <Modal show={editingModal} onHide={() => setEditingModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Standort bearbeiten</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <StandortForm
                        onSubmit={(updatedStandort) => {
                            handleUpdate(selectedStandort.id, updatedStandort);
                            setEditingModal(false);
                        }}
                        initialValues={selectedStandort}
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
                                handleDelete(selectedStandort.id);
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

export default StandortTable;