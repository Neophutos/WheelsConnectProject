import React, { useState, useEffect } from 'react';
import { useTable } from 'react-table';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';
import StandortForm from "./StandortForm";

const StandortTable = () => {
    const [data, setData] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const response = await axios.get('/standorte');
        setData(response.data);
    };

    const handleAdd = async (standort) => {
        await axios.post('/standorte', standort);
        fetchData();
    };

    const handleUpdate = async (id, standort) => {
        await axios.put(`/standorte/${id}`, standort);
        setEditingId(null);
        fetchData();
    };

    const handleDelete = async (id) => {
        await axios.delete(`/standorte/${id}`);
        fetchData();
    };

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
            <Button onClick={() => setShowForm(true)}>Standort hinzufügen</Button>
            <Modal show={showForm} onHide={() => setShowForm(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Standort hinzufügen</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <StandortForm onSubmit={handleAdd} />
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
                                    <StandortForm
                                        onSubmit={(updatedStandort) =>
                                            handleUpdate(row.original.id, updatedStandort)
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

export default StandortTable;