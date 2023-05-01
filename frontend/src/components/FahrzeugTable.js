import React, { useState, useEffect } from 'react';
import { useTable } from 'react-table';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';
import FahrzeugForm from "./FahrzeugForm";

const FahrzeugTable = () => {
    const [data, setData] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);

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
        setEditingId(null);
        fetchData();
    };

    const handleDelete = async (id) => {
        await axios.delete(`/fahrzeuge/${id}`);
        fetchData();
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
                Header: 'Verfügbarkeit',
                accessor: 'verfuegbarkeit',
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
            <Button onClick={() => setShowForm(true)}>Fahrzeug hinzufügen</Button>
            <Modal show={showForm} onHide={() => setShowForm(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Fahrzeug hinzufügen</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <FahrzeugForm onSubmit={handleAdd} />
                </Modal.Body>
            </Modal>
            <table {...getTableProps()} style={{ border: 'solid 1px blue' }}>
                <thead>
                {headerGroups.map((headerGroup) => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map((column) => (
                            <th
                                {...column.getHeaderProps()}
                                style={{
                                    borderBottom: 'solid 3px red',
                                    background: 'aliceblue',
                                    color: 'black',
                                    fontWeight: 'bold',
                                }}
                            >
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
                                    <td
                                        {...cell.getCellProps()}
                                        style={{
                                            padding: '10px',
                                            border: 'solid 1px gray',
                                            background: 'papayawhip',
                                        }}
                                    >
                                        {cell.render('Cell')}
                                    </td>
                                );
                            })}
                            <td>
                                {editingId === row.original.id ? (
                                    <FahrzeugForm
                                        onSubmit={(updatedFahrzeug) =>
                                            handleUpdate(row.original.id, updatedFahrzeug)
                                        }
                                        initialValues={row.original}
                                    />
                                ) : (
                                    <button onClick={() => setEditingId(row.original.id)}>
                                        Bearbeiten
                                    </button>
                                )}
                                <button onClick={() => handleDelete(row.original.id)}>
                                    Löschen
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
