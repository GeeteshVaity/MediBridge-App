const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
    getCart, addToCart, clearCart,
    createOrder, getPatientOrders,
    uploadPrescription, getPatientPrescriptions, acceptOffer,
    getPatientDashboard
} = require('../controllers/patientController');

const router = express.Router();

// Apply auth middleware to all routes below
router.use(protect);

// Cart Routes
router.get('/cart', getCart);
router.post('/cart', addToCart);
router.delete('/cart', clearCart);

// Order Routes
router.post('/orders', createOrder);
router.post('/create-order', createOrder);
router.get('/orders', getPatientOrders);

// Prescription Routes
router.post('/prescription', uploadPrescription);
router.get('/prescriptions', getPatientPrescriptions);
router.post('/prescriptions', uploadPrescription);
router.post('/prescription/accept-offer', acceptOffer);
router.post('/prescriptions/accept-offer', acceptOffer);

// Dashboard Routes
router.get('/dashboard', getPatientDashboard);

module.exports = router;
