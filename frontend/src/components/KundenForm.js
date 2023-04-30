// KundenForm.js
import React, { useState } from 'react';

const KundenForm = ({ onSubmit, initialValues = {} }) => {
    const [formData, setFormData] = useState(initialValues);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <label>
                Vorname:
                <input type="text" name="vorname" value={formData.vorname || ''} onChange={handleChange} />
            </label>
            <label>
                Nachname:
                <input type="text" name="nachname" value={formData.nachname || ''} onChange={handleChange} />
            </label>
            <label>
                Geburtsdatum:
                <input type="date" name="geburtsdatum" value={formData.geburtsdatum || ''} onChange={handleChange} />
            </label>
            <label>
                Adresse:
                <input type="text" name="adresse" value={formData.adresse || ''} onChange={handleChange} />
            </label>
            <label>
                Telefonnummer:
                <input type="text" name="telefonnummer" value={formData.telefonnummer || ''} onChange={handleChange} />
            </label>
            <label>
                Email:
                <input type="email" name="email" value={formData.email || ''} onChange={handleChange} />
            </label>
            <button type="submit">Submit</button>
        </form>
    );
};

export default KundenForm;
