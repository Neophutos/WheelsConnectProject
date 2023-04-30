// KundenTable.js
import React, { useState, useEffect } from 'react';
import { useTable } from 'react-table';
import axios from 'axios';
import KundenForm from "./KundenForm";

const KundenTable = () => {
    const [data, setData] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);

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
        setEditingId(null);
        fetchData();
    };

    const handleDelete = async (id) => {
        await axios.delete(`/kunden/${id}`);
        fetchData();
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
            },
            {
                Header: 'Adresse',
                accessor: 'adresse',
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
            <button onClick={() => setShowForm(!showForm)}>
                {showForm ? 'Formular ausblenden' : 'Kunden hinzufügen'}
            </button>
            {showForm && <KundenForm onSubmit={handleAdd} />}
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
                                    <KundenForm
                                        onSubmit={(updatedKunde) =>
                                            handleUpdate(row.original.id, updatedKunde)
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

export default KundenTable;
