'use strict';

// module.exports = {
//     CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:3000'
// };

// exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost/7-million-paintings';
exports.CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000'
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://localhost/7-million-paintings';
exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost/7-million-paintings';
exports.PORT = process.env.PORT || 8080;
