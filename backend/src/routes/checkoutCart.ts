import { CertifierRoute } from '../CertifierServer';

/*
 * This route handles checkout for making purchases.
 *
 * It validates the certificate signing request (CSR) received from the client,
 * decrypts and validates the field values,
 * and signs the certificate and its encrypted field values.
 *
 * The validated and signed certificate is returned to the client where the client saves their copy.
 */
export const checkoutCart: CertifierRoute = {
    type: 'post',
    path: '/checkoutCart',
    summary: 'Checkout purchases.',
    exampleBody: {
        products: [
            {
                product_id: 1,
                quantity: 2,
            },
            {
                product_id: 2,
                quantity: 1,
            },
        ],
    },
    exampleResponse: {
        status: 'success',
        description: 'Checkout successful.',
    },
    func: async (req, res, server) => {
        // TODO verify products exist and are in stock
        // TODO verify payment
        console.log('checkout called')
        try {
            console.log(req.body)
            return res.status(200).json({
                status: 'success',
                description: 'Checkout successful.',
            })
        } catch (e) {
            console.error(e);
            return res.status(500).json({
                status: 'error',
                description: 'An internal error has occurred.',
            })
        }
    },
};
