const express = require('express');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const {
    getInventory, addInventoryItem, deleteInventoryItem, getLowStockItems,
    getPendingOrders, getAcceptedOrders, acceptOrder, markDelivered,
    getShopPrescriptions, sendPrescriptionOffer,
    requestRestock, getRestockRequests, getShopDashboard, getShopLocation, updateShopLocation
} = require('../controllers/shopController');

const router = express.Router();

// Apply auth middleware to all routes below
router.use(protect);
// Restrict all routes below to 'shop' role
router.use(restrictTo('shop'));

// Inventory Routes
router.get('/inventory', getInventory);
router.get('/inventory/get', getInventory); // Frontend expects this route
router.post('/inventory', addInventoryItem);
router.post('/inventory/add', addInventoryItem);
router.delete('/inventory', deleteInventoryItem);
router.get('/inventory/low-stock', getLowStockItems);

// Order Routes
router.get('/orders/pending', getPendingOrders);
router.get('/orders/accepted', getAcceptedOrders);
router.post('/orders/accept', acceptOrder);
router.post('/accept-order', acceptOrder);
router.post('/orders/deliver', markDelivered);
router.post('/mark-delivered', markDelivered);

// Prescription Routes
router.get('/prescriptions', getShopPrescriptions);
router.post('/prescriptions/offer', sendPrescriptionOffer);

// Restock Routes
router.get('/restock', getRestockRequests);
router.post('/restock', requestRestock);

// Dashboard and profile Routes
router.get('/dashboard', getShopDashboard);
router.get('/location', getShopLocation);
router.post('/location', updateShopLocation);
router.put('/location', updateShopLocation);

module.exports = router;
