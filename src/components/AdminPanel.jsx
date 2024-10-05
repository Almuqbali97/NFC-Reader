import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';  // Import the QRCode generator

const AdminPanel = () => {
    const [employees, setEmployees] = useState([]);
    const [newEmployee, setNewEmployee] = useState({ name: '', image: '' });
    const [showQRCode, setShowQRCode] = useState(null);  // To store which employee's QR code to show

    useEffect(() => {
        // Fetch mock data
        axios.get('http://localhost:5000/api/employees')
        // axios.get('https://nfc-reader-backend.vercel.app/api/employees')
            .then(response => setEmployees(response.data))
            .catch(error => console.log(error));
    }, []);

    // Handle input change for the new employee form
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewEmployee(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    // Handle form submission to add new employee
    const handleSubmit = (e) => {
        e.preventDefault();
        // axios.post('http://localhost:5000/api/employee', newEmployee)
        axios.post('https://nfc-reader-backend.onrender.com/api/employee', newEmployee)
            .then(response => {
                setEmployees([...employees, response.data]);  // Add the new employee to the state
                setNewEmployee({ name: '', image: '' });  // Reset the form
            })
            .catch(error => console.log(error));
    };

    // Toggle QR Code visibility
    const toggleQRCode = (employeeId) => {
        setShowQRCode(showQRCode === employeeId ? null : employeeId);  // Show/Hide QR code for the selected employee
    };

    return (
        <div>
            <h2>Admin Panel</h2>
            <h3>Employee Profiles</h3>
            <ul>
                {employees.map(employee => (
                    <li key={employee.id}>
                        <img src={employee.image} alt={employee.name} width="50" />
                        <p>{employee.name}</p>
                        <p>Unique ID: {employee.uniqueID}</p>
                        <button onClick={() => toggleQRCode(employee.id)}>
                            {showQRCode === employee.id ? 'Hide QR Code' : 'Show QR Code'}
                        </button>
                        {showQRCode === employee.id && (
                            <div>
                                <QRCodeSVG
                                    value={employee.uniqueID}
                                    size={128}
                                    includeMargin={true}
                                />
                            </div>
                        )}
                    </li>
                ))}
            </ul>

            <h3>Add New Employee</h3>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Name:</label>
                    <input
                        type="text"
                        name="name"
                        value={newEmployee.name}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div>
                    <label>Image URL:</label>
                    <input
                        type="text"
                        name="image"
                        value={newEmployee.image}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <button type="submit">Add Employee</button>
            </form>
        </div>
    );
};

export default AdminPanel;
