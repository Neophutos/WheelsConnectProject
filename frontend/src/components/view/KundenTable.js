// KundenTable.js
import React, { useState, useEffect } from 'react';
import { useTable } from 'react-table';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';
import KundenForm from "../form/KundenForm";
import { AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';

const KundenTable = () => {
    const [data, setData] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedKunde, setSelectedKunde] = useState(null);
    const [editingModal, setEditingModal] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const response = await axios.get('/kunden');
        setData(response.data);
    };

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

    const handleShowEditForm = (kunde) => {
        setSelectedKunde(kunde);
        setEditingModal(true);
    };
    const handleShowDeleteConfirm = (kunde) => {
        setSelectedKunde(kunde);
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
