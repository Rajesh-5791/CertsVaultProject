// CRUD APIs implementation

import express from 'express';
import { openDatabase, getCertificate, insertCertificate, getAllCertificates, updateCertificate, deleteCertificate } from './dbOperations.js';

const app = express();
app.use(express.json());
const PORT = 5791;

const messagesAndCodes = {
    insertCertificate: {
        errorMessage: 'Error inserting certificate.',
        successMessage: 'Certificate inserted successfully.',
        errorCode: 400,
        successCode: 201
    },
    updateCertificate: {
        errorMessage: 'Error updating certificate.',
        successMessage: 'Certificate updated successfully.',
        errorCode: 404,
        successCode: 200
    },
    deleteCertificate: {
        errorMessage: 'Error deleting certificate.',
        successMessage: 'Certificate deleted successfully.',
        errorCode: 404,
        successCode: 200
    },
    getAllCertificates: {
        errorMessage: 'Error retrieving certificates.',
        successMessage: 'Retrieved all certificates successfully.',
        errorCode: 500,
        successCode: 200
    }
};

(async () => {
    await openDatabase();
})();

const handleResponse = async (res, result, operation, certificate) => {
    const { successCode, successMessage, errorCode, errorMessage } = messagesAndCodes[operation];
    if (result > 0) {
        return res.status(successCode).json({ message: successMessage, certificate });
    } else {
        return res.status(errorCode).json({ error: errorMessage });
    }
};

app.route('/api/:employeeId/certs/:certId')
    .post(async (req, res) => {
        const { employeeId, certId } = req.params;
        const { ...certificateDetails } = req.body;
        const values = { ...certificateDetails, employeeId, certId };
        const result = await updateCertificate(values);
        const certificate = await getCertificate(employeeId, certId);
        return await handleResponse(res, result, 'updateCertificate', certificate);
    })
    .delete(async (req, res) => {
        const { employeeId, certId } = req.params;
        const result = await deleteCertificate({ employeeId, certId });
        return await handleResponse(res, result, 'deleteCertificate');
    });

app.route('/api/:employeeId/certs')
    .put(async (req, res) => {
        const { employeeId } = req.params;
        const { certId, ...certificateDetails } = req.body;
        const values = { employeeId, certId, ...certificateDetails };
        const result = await insertCertificate(values);
        const certificate = await getCertificate(employeeId, certId);
        return await handleResponse(res, result, 'insertCertificate', certificate);
    })
    .get(async (req, res) => {
        const employeeId = req.params.employeeId;
        const sortOrder = req.query.sort || "ASC";
        const sortBy = req.query.sortBy || "expirationDate";
        const values = { employeeId, sortBy, sortOrder };
        const allCertificates = await getAllCertificates(values);
        return await handleResponse(res, allCertificates.length, 'getAllCertificates', allCertificates);
    });

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});