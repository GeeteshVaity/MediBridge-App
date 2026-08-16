const express = require('express');
const {
    searchMedicines,
    getShops,
    createMedicineRequest,
    getMedicineRequests,
    fulfillMedicineRequest,
    getNotifications,
    markNotificationsRead
} = require('../controllers/publicController');

const router = express.Router();

router.get('/medicines/search', searchMedicines);
router.get('/shops', getShops);
router.get('/medicine-requests', getMedicineRequests);
router.post('/medicine-requests', createMedicineRequest);
router.post('/medicine-requests/fulfill', fulfillMedicineRequest);
router.get('/notifications', getNotifications);
router.post('/notifications/mark-read', markNotificationsRead);

module.exports = router;
