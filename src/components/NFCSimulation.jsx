import React, { useState, useRef } from 'react';
import axios from 'axios';
import { BrowserMultiFormatReader } from '@zxing/library';
import Webcam from 'react-webcam';

const NFCSimulation = () => {
    const [uniqueID, setUniqueID] = useState('');
    const [employee, setEmployee] = useState(null);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [writeStatus, setWriteStatus] = useState('');
    const [scanMethod, setScanMethod] = useState('manual'); // To select scan method
    const webcamRef = useRef(null);
    const codeReader = useRef(new BrowserMultiFormatReader());

    // Function to fetch employee details based on the unique ID
    const fetchEmployee = (id) => {
        axios.get(`http://localhost:5000/api/employee/${id}`)
            .then(response => {
                setEmployee(response.data);
                setError('');
            })
            .catch(() => {
                setEmployee(null);
                setError('Employee not found');
            });
    };

    // Handle NFC scan using Web NFC API
    const handleWebNFCScan = async () => {
        if ('NDEFReader' in window) {
            try {
                const ndef = new NDEFReader();
                await ndef.scan();
                setMessage('> Scan started');

                // NFC reading error
                ndef.addEventListener('readingerror', () => {
                    setMessage('Cannot read data from the NFC tag. Try another one?');
                });

                // NFC tag read successfully
                ndef.addEventListener('reading', ({ message, serialNumber }) => {
                    setMessage(`> Serial Number: ${serialNumber}`);
                    setMessage(`> Records: (${message.records.length})`);
                    const decoder = new TextDecoder();
                    message.records.forEach(record => {
                        const payload = decoder.decode(record.data);
                        setUniqueID(payload); // Use the payload as unique ID
                        fetchEmployee(payload);
                    });
                });
            } catch (error) {
                setMessage('Argh! ' + error);
            }
        } else {
            setError('Web NFC is not supported in this browser.');
        }
    };

    // Write to NFC Tag
    const handleNFCWrite = async () => {
        setWriteStatus('User clicked write button');
        try {
            const ndef = new NDEFReader();
            await ndef.write("Hello world!");
            setWriteStatus('> Message written');
        } catch (error) {
            setWriteStatus('Argh! ' + error);
        }
    };

    // Make NFC Tag Read-Only
    const handleMakeReadOnly = async () => {
        setWriteStatus('User clicked make read-only button');
        try {
            const ndef = new NDEFReader();
            await ndef.makeReadOnly();
            setWriteStatus('> NFC tag has been made permanently read-only');
        } catch (error) {
            setWriteStatus('Argh! ' + error);
        }
    };

    // Handle manual scan (current method)
    const handleManualScan = () => {
        fetchEmployee(uniqueID);
    };

    // Handle QR code scan with the webcam
    const handleQRCodeScan = async (retry = false) => {
        setError(null);
        const imageSrc = webcamRef.current.getScreenshot();

        if (imageSrc) {
            const img = new Image();
            img.src = imageSrc;

            img.onload = async () => {
                try {
                    const result = await codeReader.current.decodeFromImageElement(img);
                    const scannedId = result.getText();
                    fetchEmployee(scannedId);
                } catch (err) {
                    console.error('Error decoding QR code:', err);
                    if (!retry) {
                        setTimeout(() => handleQRCodeScan(true), 1000); // Retry once after a delay
                    } else {
                        setError('Failed to scan QR code. Please try again.');
                    }
                }
            };
        } else {
            console.error('No image captured from webcam.');
            setError('Failed to capture image. Please try again.');
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold mb-6 text-center">NFC Simulation Desk</h1>

            {/* Scan Method Selection */}
            <label>Select Scan Method:</label>
            <select value={scanMethod} onChange={(e) => setScanMethod(e.target.value)}>
                <option value="manual">Manual Entry</option>
                <option value="qr">QR Code Scan</option>
                <option value="webNFC">Web NFC Scan</option>
            </select>

            {/* Manual Entry Scan */}
            {scanMethod === 'manual' && (
                <div>
                    <input
                        type="text"
                        placeholder="Enter NFC Unique ID"
                        value={uniqueID}
                        onChange={(e) => setUniqueID(e.target.value)}
                    />
                    <button onClick={handleManualScan} className="bg-indigo-600 hover:bg-indigo-800 text-white font-bold py-2 px-4 rounded">
                        Scan
                    </button>
                </div>
            )}

            {/* QR Code Scan with Webcam */}
            {scanMethod === 'qr' && (
                <>
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        className="mb-4"
                        width={500}
                        height={500}
                    />
                    <button onClick={() => handleQRCodeScan(false)} className="bg-indigo-600 hover:bg-indigo-800 text-white font-bold py-2 px-4 rounded">
                        Scan QR Code
                    </button>
                </>
            )}

            {/* Web NFC Scan */}
            {scanMethod === 'webNFC' && (
                <div>
                    <button onClick={handleWebNFCScan} className="bg-indigo-600 hover:bg-indigo-800 text-white font-bold py-2 px-4 rounded">
                        Start NFC Scan
                    </button>
                    {message && <p>{message}</p>}
                </div>
            )}

            {/* Write to NFC Tag */}
            <div className="mb-4">
                <button
                    onClick={handleNFCWrite}
                    className="bg-green-600 hover:bg-green-800 text-white font-bold py-2 px-4 rounded"
                >
                    Write "Hello world!" to NFC Tag
                </button>
                {writeStatus && <p>{writeStatus}</p>}
            </div>

            {/* Make NFC Tag Read-Only */}
            <div className="mb-4">
                <button
                    onClick={handleMakeReadOnly}
                    className="bg-red-600 hover:bg-red-800 text-white font-bold py-2 px-4 rounded"
                >
                    Make NFC Tag Read-Only
                </button>
                {writeStatus && <p>{writeStatus}</p>}
            </div>

            {/* Error Message */}
            {error && <p className="text-red-500">{error}</p>}

            {/* Display Employee Data */}
            {employee && (
                <div className="mt-6 bg-white shadow-md rounded-lg overflow-hidden">
                    <div className="px-4 py-5 bg-gray-100 border-b border-gray-200">
                        <h3 className="text-lg leading-6 font-bold text-gray-900">Employee Details</h3>
                    </div>
                    <div className="px-4 py-5 sm:px-6">
                        <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                            <div className="sm:col-span-1 bg-gray-50 p-4 rounded-md">
                                <dt className="text-sm font-bold text-gray-500">Full Name</dt>
                                <dd className="mt-1 text-sm text-gray-900">{employee.name}</dd>
                            </div>
                            <div className="sm:col-span-1 bg-white p-4 rounded-md">
                                <dt className="text-sm font-bold text-gray-500">Unique ID</dt>
                                <dd className="mt-1 text-sm text-gray-900">{employee.uniqueID}</dd>
                            </div>
                        </dl>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NFCSimulation;
