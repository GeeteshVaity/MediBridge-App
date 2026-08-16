let Inventory, Order, Prescription, PrescriptionOffer, RestockRequest, User;
try {
    const loadModel = (path, name) => {
        const raw = require(path);
        return raw.default || raw[name] || raw;
    };
    Inventory = loadModel('../../models/Inventory.ts', 'Inventory');
    Order = loadModel('../../models/Order.ts', 'Order');
    Prescription = loadModel('../../models/Prescription.ts', 'Prescription');
    PrescriptionOffer = loadModel('../../models/PrescriptionOffer.ts', 'PrescriptionOffer');
    RestockRequest = loadModel('../../models/RestockRequest.ts', 'RestockRequest');
    User = loadModel('../../models/User.ts', 'User');
} catch (e) {
    console.warn("Could not load models statically. Run via tsx.");
}

const getShopId = (req) => req.user.id;

// ---- INVENTORY HANDLERS ----

exports.getInventory = async (req, res, next) => {
    try {
        const shopId = getShopId(req);
        const inventory = await Inventory.find({ shopId }).sort({ medicineName: 1 });
        return res.status(200).json({ inventory });
    } catch (error) {
        next(error);
    }
};

exports.addInventoryItem = async (req, res, next) => {
    try {
        const shopId = getShopId(req);
        const itemData = { ...req.body, shopId };
        const item = await Inventory.create(itemData);
        return res.status(201).json({ message: 'Item added', item, inventory: item });
    } catch (error) {
        next(error);
    }
};

exports.deleteInventoryItem = async (req, res, next) => {
    try {
        const shopId = getShopId(req);
        const inventoryId = req.query.inventoryId || req.body.inventoryId;
        if (!inventoryId) return res.status(400).json({ error: 'inventoryId is required' });

        const item = await Inventory.findOneAndDelete({ _id: inventoryId, shopId });
        if (!item) return res.status(404).json({ error: 'Inventory item not found' });

        return res.status(200).json({ message: 'Item deleted' });
    } catch (error) {
        next(error);
    }
};

exports.getLowStockItems = async (req, res, next) => {
    try {
        const shopId = getShopId(req);
        const threshold = Number(req.query.threshold || 10);
        const lowStock = await Inventory.find({ shopId, quantity: { $lte: threshold } }).sort({ quantity: 1 });
        return res.status(200).json({ lowStock, lowStockItems: lowStock });
    } catch (error) {
        next(error);
    }
};


// ---- ORDERS HANDLERS ----

exports.getPendingOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ status: 'pending' })
            .populate('patientId', 'name email phone')
            .sort({ createdAt: -1 });
        return res.status(200).json({ orders });
    } catch (error) {
        next(error);
    }
};

exports.getAcceptedOrders = async (req, res, next) => {
    try {
        const shopId = getShopId(req);
        const orders = await Order.find({ acceptedBy: shopId, status: { $in: ['accepted', 'delivered'] } })
            .populate('patientId', 'name email phone')
            .sort({ updatedAt: -1 });
        return res.status(200).json({ orders });
    } catch (error) {
        next(error);
    }
};

exports.acceptOrder = async (req, res, next) => {
    try {
        const shopId = getShopId(req);
        const { orderId } = req.body;
        if (!orderId) return res.status(400).json({ error: 'orderId is required' });

        const order = await Order.findOneAndUpdate(
            { _id: orderId, status: 'pending' },
            { status: 'accepted', acceptedBy: shopId },
            { new: true }
        ).populate('patientId', 'name email phone');
        if (!order) return res.status(404).json({ error: 'Pending order not found' });

        return res.status(200).json({ message: 'Order accepted', order });
    } catch (error) {
        next(error);
    }
};

exports.markDelivered = async (req, res, next) => {
    try {
        const shopId = getShopId(req);
        const { orderId } = req.body;
        if (!orderId) return res.status(400).json({ error: 'orderId is required' });

        const order = await Order.findOneAndUpdate(
            { _id: orderId, acceptedBy: shopId },
            { status: 'delivered' },
            { new: true }
        );
        if (!order) return res.status(404).json({ error: 'Accepted order not found' });

        return res.status(200).json({ message: 'Order delivered', order });
    } catch (error) {
        next(error);
    }
};


// ---- PRESCRIPTIONS HANDLERS ----

exports.getShopPrescriptions = async (req, res, next) => {
    try {
        const shopId = getShopId(req);
        const [prescriptions, offers] = await Promise.all([
            Prescription.find({ status: { $in: ['pending', 'offers-received', 'accepted'] } })
                .populate('patientId', 'name email phone')
                .sort({ createdAt: -1 }),
            PrescriptionOffer.find({ shopId }).sort({ createdAt: -1 })
        ]);

        const offersByPrescription = new Map(
            offers.map((offer) => [offer.prescriptionId.toString(), offer])
        );
        const result = prescriptions.map((prescription) => {
            const object = prescription.toObject();
            const myOffer = offersByPrescription.get(prescription._id.toString());
            return {
                ...object,
                patientName: object.patientName || object.patientId?.name || 'Unknown Patient',
                hasSubmittedOffer: Boolean(myOffer),
                myOffer: myOffer || null
            };
        });

        return res.status(200).json({ prescriptions: result, offers });
    } catch (error) {
        next(error);
    }
};

exports.sendPrescriptionOffer = async (req, res, next) => {
    try {
        const shopId = getShopId(req);
        const { prescriptionId, medicines = [], deliveryFee = 0 } = req.body;
        if (!prescriptionId || medicines.length === 0) {
            return res.status(400).json({ error: 'prescriptionId and medicines are required' });
        }

        const shop = await User.findById(shopId).select('name shopName');
        const medicinesTotal = medicines.reduce(
            (sum, medicine) => sum + Number(medicine.price || 0) * Number(medicine.quantity || 0),
            0
        );
        const offerData = {
            ...req.body,
            shopId,
            shopName: shop?.shopName || shop?.name || 'Medical Shop',
            totalAmount: medicinesTotal + Number(deliveryFee || 0),
            status: 'pending'
        };
        const offer = await PrescriptionOffer.create(offerData);
        await Prescription.findByIdAndUpdate(prescriptionId, { status: 'offers-received' });
        return res.status(201).json({ message: 'Offer sent', offer });
    } catch (error) {
        next(error);
    }
};


// ---- RESTOCK HANDLERS ----

exports.requestRestock = async (req, res, next) => {
    try {
        const shopId = getShopId(req);
        const requestData = { ...req.body, shopId, status: 'pending' };
        const restock = await RestockRequest.create(requestData);
        return res.status(201).json({ message: 'Restock requested', restock });
    } catch (error) {
        next(error);
    }
};

exports.getRestockRequests = async (req, res, next) => {
    try {
        const shopId = getShopId(req);
        const restockRequests = await RestockRequest.find({ shopId }).sort({ createdAt: -1 });
        return res.status(200).json({ restockRequests });
    } catch (error) {
        next(error);
    }
};

exports.getShopDashboard = async (req, res, next) => {
    try {
        const shopId = getShopId(req);
        const [pendingOrders, lowStockItems, pendingPrescriptions, totalProducts, recentOrders] = await Promise.all([
            Order.countDocuments({ status: 'pending' }),
            Inventory.find({ shopId, quantity: { $lte: 10 } }).sort({ quantity: 1 }).limit(5),
            Prescription.countDocuments({ status: { $in: ['pending', 'offers-received'] } }),
            Inventory.countDocuments({ shopId }),
            Order.find({ $or: [{ status: 'pending' }, { acceptedBy: shopId }] })
                .populate('patientId', 'name email phone')
                .sort({ createdAt: -1 })
                .limit(5)
        ]);

        return res.status(200).json({
            pendingOrders,
            lowStockCount: lowStockItems.length,
            pendingPrescriptions,
            totalProducts,
            lowStockItems,
            recentOrders
        });
    } catch (error) {
        next(error);
    }
};

exports.updateShopLocation = async (req, res, next) => {
    try {
        const shopId = getShopId(req);
        const lat = Number(req.body.lat ?? req.body.latitude);
        const lng = Number(req.body.lng ?? req.body.longitude);

        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
            return res.status(400).json({ error: 'Valid lat and lng are required' });
        }

        const user = await User.findByIdAndUpdate(
            shopId,
            {
                location: { type: 'Point', coordinates: [lng, lat] },
                ...(req.body.shopAddress ? { shopAddress: req.body.shopAddress } : {}),
                ...(req.body.phone ? { phone: req.body.phone } : {})
            },
            { new: true }
        );

        return res.status(200).json({ message: 'Location updated', user });
    } catch (error) {
        next(error);
    }
};

exports.getShopLocation = async (req, res, next) => {
    try {
        const shopId = getShopId(req);
        const user = await User.findById(shopId).select('shopAddress phone location');
        if (!user) return res.status(404).json({ error: 'Shop not found' });

        const coordinates = user.location?.coordinates;
        const hasLocation = Array.isArray(coordinates) && coordinates.length === 2;

        return res.status(200).json({
            shopAddress: user.shopAddress || '',
            phone: user.phone || '',
            location: hasLocation ? { lng: coordinates[0], lat: coordinates[1] } : null
        });
    } catch (error) {
        next(error);
    }
};
