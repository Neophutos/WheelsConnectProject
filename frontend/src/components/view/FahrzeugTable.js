// Importieren der notwendigen Pakete und Komponenten
import React, { useState, useEffect } from 'react';
import { useTable, useFilters, useSortBy } from 'react-table';
import axios from 'axios';
import {Modal, Button} from 'react-bootstrap';
import FahrzeugForm from "../form/FahrzeugForm";
import { AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';

// Die FahrzeugTable-Komponente, die die Tabelle für Fahrzeuge anzeigt.
const FahrzeugTable = () => {

    // Verwendet den useState-Hook von React, um den Zustand der Komponente zu verwalten.
    const [data, setData] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedFahrzeug, setSelectedFahrzeug] = useState(null);
    const [editingModal, setEditingModal] = useState(false);

    // Verwendet den useEffect-Hook, um Daten zu holen, wenn die Komponente gemountet wird.
    useEffect(() => {
        fetchData();
    }, []);

    // Funktion, um Daten von der Server-API zu holen.
    const fetchData = async () => {
        const response = await axios.get('/fahrzeuge');
        setData(response.data);
    };

    // Methoden zum Hinzufügen, Aktualisieren und Löschen von Fahrzeugen über die API.
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

    // Eine generische Textfilterfunktion
    function TextFilter({
                            column: { filterValue, setFilter },
                        }) {
        return (
            <input
                value={filterValue || ""}
                onChange={e => {
                    setFilter(e.target.value || undefined);
                }}
                placeholder={`Suche...`}
            />
        );
    }

    // Methoden zum Anzeigen des Bearbeitungsformulars und der Löschbestätigung.
    const handleShowEditForm = (fahrzeug) => {
        setSelectedFahrzeug(fahrzeug);
        setEditingModal(true);
    };
    const handleShowDeleteConfirm = (fahrzeug) => {
        setSelectedFahrzeug(fahrzeug);
        setShowDeleteConfirm(true);
    };

    // Logik für die Erstellung und Darstellung der Tabelle.
    const columns = React.useMemo(
        () => [
            {
                Header: 'ID',
                accessor: 'id',
                disableFilters: true, // Added
            },
            {
                Header: 'Marke',
                accessor: 'marke',
                Filter: TextFilter,
            },
            {
                Header: 'Modell',
                accessor: 'modell',
                Filter: TextFilter,
            },
            {
                Header: 'Typ',
                accessor: 'typ',
                Filter: TextFilter,
            },
            {
                Header: 'Baujahr',
                accessor: 'baujahr',
                disableFilters: true, // Added
            },
            {
                Header: 'Farbe',
                accessor: 'farbe',
                Filter: TextFilter,
            },
            {
                Header: 'Preis',
                accessor: 'preis',
                disableFilters: true, // Added
            },
            {
                Header: 'Standort',
                accessor: 'standort.name',
                disableFilters: true, // Added
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
    } = useTable({ columns, data }, useFilters, useSortBy);

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
                {headerGroups.map(headerGroup => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map(column => (
                            <th {...column.getHeaderProps(column.getSortByToggleProps())} className="table-dark-header">
                                {column.render('Header')}
                                {/* Fügen Sie eine Sortierrichtungsanzeige hinzu */}
                                <span>
                                    {column.isSorted
                                        ? column.isSortedDesc
                                            ? ' ↓'
                                            : ' ↑'
                                        : ''}
                                </span>
                                {/* Fügen Sie die Filterkomponente hinzu */}
                                <div>{column.canFilter ? column.render('Filter') : null}</div>
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
