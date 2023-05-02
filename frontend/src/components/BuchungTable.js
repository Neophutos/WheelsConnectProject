import React, { useState, useEffect } from 'react';
import { useTable } from 'react-table';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';
import BuchungsForm from './BuchungsForm';

const BuchungTable = () => {
    const [data, setData] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);

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
        setEditingId(null);
        fetchData();
    };

    const handleDelete = async (id) => {
        await axios.delete(`/buchungen/${id}`);
        fetchData();
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
            },
            {
                Header: 'Enddatum',
                accessor: 'enddatum',
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
                    <BuchungsForm onSubmit={handleAdd} />
                </Modal.Body>
            </Modal>
            <table variant={"dark"} className={"table-dark"} {...getTableProps()} style={{ border: 'solid 1px blue' }}>
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
                                    <BuchungsForm
                                        onSubmit={(updatedBuchung) =>
                                            handleUpdate(row.original.id, updatedBuchung)
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

export default BuchungTable;

