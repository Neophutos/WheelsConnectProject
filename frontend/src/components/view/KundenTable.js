// Importieren der notwendigen Pakete und Komponenten
import React, { useState, useEffect } from 'react';
import { useTable } from 'react-table';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';
import KundenForm from "../form/KundenForm";
import { AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';

// Die KundenTable-Komponente zeigt die Tabelle für Kunden an.
const KundenTable = () => {

    // Verwendet den useState-Hook von React, um den Zustand der Komponente zu verwalten.
    const [data, setData] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedKunde, setSelectedKunde] = useState(null);
    const [editingModal, setEditingModal] = useState(false);

    // Verwendet den useEffect-Hook, um Daten zu holen, wenn die Komponente gemountet wird.
    useEffect(() => {
        fetchData();
    }, []);

    // Funktion, um Daten von der Server-API zu holen.
    const fetchData = async () => {
        const response = await axios.get('/kunden');
        setData(response.data);
    };

    // Methoden zum Hinzufügen, Aktualisieren und Löschen von Kunden über die API.
    const handleAdd = async (kunde) => {
        await axios.post('/kunden', kunde);
        fetchData();
    };

    const handleUpdate = async (id, kunde) => {
        await axios.put(`/kunden/${id}`, kunde);
        fetchData();
    };

    const handleDelete = async (id) => {
        await axios.delete(`/kunden/${id}`);
        fetchData();
    };

    // Methoden zum Anzeigen des Bearbeitungsformulars und der Löschbestätigung.
    const handleShowEditForm = (kunde) => {
        setSelectedKunde(kunde);
        setEditingModal(true);
    };
    const handleShowDeleteConfirm = (kunde) => {
        setSelectedKunde(kunde);
        setShowDeleteConfirm(true);
    };

    // Funktion zum Formatieren eines Datumsstrings in das Format "dd.mm.yyyy".
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        return `${day}.${month}.${year}`;
    };

    // Logik für die Erstellung und Darstellung der Tabelle.
    const columns = React.useMemo(
        () => [
            {
                Header: 'ID',
                accessor: 'id',
            },
            {
                Header: 'Vorname',
                accessor: 'vorname',
            },
            {
                Header: 'Nachname',
                accessor: 'nachname',
            },
            {
                Header: 'Geburtsdatum',
                accessor: 'geburtsdatum',
                Cell: ({ value }) => formatDate(value),
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
                Header: 'Email',
                accessor: 'email',
            },
        ],
        []
    );

    // Verwendet den useTable-Hook, um die Tabellenlogik zu verwalten.
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable({ columns, data });

    return (
        <div>
            <h2>Kunden</h2>
            <Button variant={"dark"} className={"btn-darkmode"} onClick={() => setShowForm(true)}>Kunde hinzufügen</Button>
            <Modal show={showForm} onHide={() => setShowForm(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Kunde hinzufügen</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <KundenForm onSubmit={handleAdd} handleClose={() => setShowForm(false)} />
                </Modal.Body>
            </Modal>
            <Modal show={editingModal} onHide={() => setEditingModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Kunde bearbeiten</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <KundenForm
                        onSubmit={(updatedKunde) => {
                            handleUpdate(selectedKunde.id, updatedKunde);
                            setEditingModal(false);
                        }}
                        initialValues={selectedKunde}
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
                                handleDelete(selectedKunde.id);
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

export default KundenTable;
