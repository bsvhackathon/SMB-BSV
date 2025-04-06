import { Router } from 'express';
import { Database } from 'sqlite3';
import { CertifierRoute } from '../CertifierServer';

/*
 * This route handles signCertificate for the acquireCertificate protocol.
 *
 * It validates the certificate signing request (CSR) received from the client,
 * decrypts and validates the field values,
 * and signs the certificate and its encrypted field values.
 *
 * The validated and signed certificate is returned to the client where the client saves their copy.
 */
export const getProducts: CertifierRoute = {
    type: 'get',
    path: '/getProducts',
    summary: 'Get all products for a given store.',
    exampleBody: {},
    exampleResponse: {
        products: [
            {
                product_id: 1,
                product_name: 'Bike',
                price: 250.0,
                stock: 100,
            },
            {
                product_id: 2,
                product_name: 'E-Bike',
                price: 1000.0,
                stock: 50,
            },
        ],
    },
    func: async (req, res, server) => {
        console.log('getProducts called')
        try {
            const db: Database = server.getProductsDB()
            if (!db) {
                return res.status(500).json({
                    status: 'error',
                    description: 'Database not initialized',
                })
            }

            db.all(
                'SELECT product_id, product_name, price, stock FROM products',
                (err, rows) => {
                    if (err) {
                        console.error('Database error:', err)
                        return res.status(500).json({
                            status: 'error',
                            description: 'Failed to retrieve products',
                        })
                    }

                    return res.status(200).json({
                        status: 'success',
                        products: rows,
                    })
                }
            );
        } catch (e) {
            console.error(e);
            return res.status(500).json({
                status: 'error',
                description: 'An internal error has occurred.',
            })
        }
    },
};
