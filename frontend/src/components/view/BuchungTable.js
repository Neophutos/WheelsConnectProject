import React, { useState, useEffect } from 'react';
import { useTable } from 'react-table';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';
import BuchungsForm from '../form/BuchungsForm';
import { AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai'; // Importieren Sie die Icons

const BuchungTable = () => {
    const [data, setData] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedBuchung, setSelectedBuchung] = useState(null);
    const [editingModal, setEditingModal] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const response = await axios.get('/buchungen');
        setData(response.data);
    };

    const handleAdd = async (buchung) => {
        await axios.post('/buchungen', buchung);
        fetchData();
    };

    const handleUpdate = async (id, buchung) => {
        await axios.put(`/buchungen/${id}`, buchung);
        fetchData();
    };

    const handleDelete = async (id) => {
        await axios.delete(`/buchungen/${id}`);
        fetchData();
    };

    const handleShowEditForm = (buchung) => {
        setSelectedBuchung(buchung);
        setEditingModal(true);
    };
    const handleShowDeleteConfirm = (buchung) => {
        setSelectedBuchung(buchung);
        setShowDeleteConfirm(true);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        return `${day}.${month}.${year}`;
    };

    const columns = React.useMemo(
        () => [
            {
                Header: 'ID',
                accessor: 'id',
            },
            {
                Header: 'Startdatum',
                accessor: 'startdatum',
                Cell: ({ value }) => formatDate(value),
            },
            {
                Header: 'Enddatum',
                accessor: 'enddatum',
                Cell: ({ value }) => formatDate(value),
            },
            {
                Header: 'Gesamtpreis',
                accessor: 'gesamtpreis',
            },
            {
                Header: 'Buchungsstatus',
                accessor: 'buchungsstatus',
            },
            {
                Header: 'Kunde',
                accessor: 'kunde',
                Cell: ({ cell: { value } }) => (
                    <span>
                        {value.vorname} {value.nachname}
                    </span>
                ),
            },
            {
                Header: 'Fahrzeug',
                accessor: 'fahrzeug',
                Cell: ({ cell: { value } }) => (
                    <span>
                        {value.marke} {value.modell}
                    </span>
                ),
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
            <h2>Buchungen</h2>
            <Button variant={"dark"} className={"btn-darkmode"} onClick={() => setShowForm(true)}>Buchung hinzufügen</Button>
            <Modal show={showForm} onHide={() => setShowForm(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Buchung hinzufügen</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <BuchungsForm onSubmit={handleAdd} handleClose={() => setShowForm(false)}/>
                </Modal.Body>
            </Modal>
            <Modal show={editingModal} onHide={() => setEditingModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Buchung bearbeiten</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <BuchungsForm
                        onSubmit={(updatedBuchung) => {
                            handleUpdate(selectedBuchung.id, updatedBuchung);
                            setEditingModal(false);
                        }}
                        initialValues={selectedBuchung}
                        handleClose={() => setEditingModal(false)}
                        isEditing={true}
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
                                handleDelete(selectedBuchung.id);
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

export default BuchungTable;

