const express = require('express');
const pouchdb = require('pouchdb-node');
const expressPouchDB = require('express-pouchdb');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 5984;

// Middleware
app.use(cors());

// Configure PouchDB to use a specific directory for data
const PouchDB = pouchdb.defaults({
    prefix: path.join(__dirname, 'db/')
});

// Create the 'sacramentos' database if it doesn't exist
new PouchDB('sacramentos');

// Root route for health check
app.get('/', (req, res) => {
    res.json({
        name: 'Sacrament Ledger Node',
        version: '1.0.0',
        status: 'running',
        pouchdb: 'enabled'
    });
});

// Integrate express-pouchdb
// This will expose the CouchDB-compatible API at the root
app.use('/', expressPouchDB(PouchDB, {
    mode: 'minimumForPouchDB', // More lightweight than full CouchDB emulation
    overrideMode: {
        include: ['routes/fauxton'] // Enable Fauxton UI if possible
    }
}));

app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
    console.log(`📁 Databases stored in: ${path.join(__dirname, 'db/')}`);
    console.log(`🔗 CouchDB-compatible API available at the root.`);
});
