const mongoose = require('mongoose');

// Dynamic loading of TS models via require
let Cart, Order, Prescription, PrescriptionOffer, MedicineRequest, Inventory, User;
try {
    const loadModel = (path, name) => {
        const raw = require(path);
        return raw.default || raw[name] || raw;
    };
    Cart = loadModel('../../models/Cart.ts', 'Cart');
    Order = loadModel('../../models/Order.ts', 'Order');
    Prescription = loadModel('../../models/Prescription.ts', 'Prescription');
    PrescriptionOffer = loadModel('../../models/PrescriptionOffer.ts', 'PrescriptionOffer');
    MedicineRequest = loadModel('../../models/MedicineRequest.ts', 'MedicineRequest');
    Inventory = loadModel('../../models/Inventory.ts', 'Inventory');
    User = loadModel('../../models/User.ts', 'User');
} catch (e) {
    console.warn("Could not load models statically. Run via tsx.");
}

// Ensure patientId is fetched from auth context if missing
const getPatientId = (req) => req.user?.id || req.query.patientId || req.body.patientId;

// ---- CART HANDLERS ----

exports.getCart = async (req, res, next) => {
    try {
        const patientId = getPatientId(req);
        if (!patientId) return res.status(400).json({ error: 'patientId is required' });

        let cart = await Cart.findOne({ patientId });
        if (!cart) cart = await Cart.create({ patientId, items: [] });
        // Simplify for express - assume base cart
        return res.status(200).json({ cart });
    } catch (error) {
        next(error);
    }
};

exports.addToCart = async (req, res, next) => {
    try {
        const patientId = getPatientId(req);
        const { medicineName, quantity, price, brand, inventoryId } = req.body;

        if (!patientId || !medicineName || !quantity) {
            return res.status(400).json({ error: 'patientId, medicineName, and quantity are required' });
        }

        let cart = await Cart.findOne({ patientId });
        if (!cart) cart = new Cart({ patientId, items: [] });

        const existingIndex = cart.items.findIndex(i => (inventoryId && i.inventoryId === inventoryId) || i.medicineName === medicineName);
        if (existingIndex > -1) {
            cart.items[existingIndex].quantity = quantity;
            cart.items[existingIndex].price = price ?? cart.items[existingIndex].price;
            cart.items[existingIndex].brand = brand ?? cart.items[existingIndex].brand;
        } else {
            cart.items.push({ medicineName, quantity, price, brand, inventoryId });
        }
        await cart.save();
        return res.status(200).json({ message: 'Cart updated', cart });
    } catch (error) {
        next(error);
    }
};

exports.clearCart = async (req, res, next) => {
    try {
        const patientId = getPatientId(req);
        if (!patientId) return res.status(400).json({ error: 'patientId is required' });

        const { itemId, medicineName } = req.body || {};
        const update = itemId || medicineName
            ? {
                $pull: {
                    items: {
                        $or: [
                            ...(itemId ? [{ _id: itemId }, { inventoryId: itemId }] : []),
                            ...(medicineName ? [{ medicineName }] : [])
                        ]
                    }
                }
            }
            : { $set: { items: [] } };
        const cart = await Cart.findOneAndUpdate({ patientId }, update, { new: true });
        return res.status(200).json({ message: 'Cart cleared', cart });
    } catch (error) {
        next(error);
    }
};


// ---- ORDER HANDLERS ----

exports.createOrder = async (req, res, next) => {
    try {
        const patientId = getPatientId(req);
        const orderData = { ...req.body, patientId };
        const order = await Order.create(orderData);

        // Auto-clear cart when order is placed
        await Cart.findOneAndUpdate({ patientId }, { $set: { items: [] } });
        return res.status(201).json({ message: 'Order created', order });
    } catch (error) {
        next(error);
    }
};

exports.getPatientOrders = async (req, res, next) => {
    try {
        const patientId = getPatientId(req);
        const orders = await Order.find({ patientId })
            .populate('acceptedBy', 'name shopName shopAddress phone')
            .sort({ createdAt: -1 });
        return res.status(200).json({ orders });
    } catch (error) {
        next(error);
    }
};


// ---- PRESCRIPTION HANDLERS ----

exports.uploadPrescription = async (req, res, next) => {
    try {
        const patientId = getPatientId(req);
        const patient = await User.findById(patientId).select('name');
        const prescriptionData = {
            ...req.body,
            patientId,
            patientName: req.body.patientName || patient?.name || 'Patient',
            imageUrl: req.body.imageUrl || req.body.imageData || 'uploaded-prescription'
        };
        const prescription = await Prescription.create(prescriptionData);
        return res.status(201).json({ message: 'Prescription uploaded', prescription });
    } catch (error) {
        next(error);
    }
};

exports.getPatientPrescriptions = async (req, res, next) => {
    try {
        const patientId = getPatientId(req);
        const prescriptions = await Prescription.find({ patientId }).sort({ createdAt: -1 });
        const prescriptionIds = prescriptions.map((prescription) => prescription._id);
        const offers = await PrescriptionOffer.find({ prescriptionId: { $in: prescriptionIds } }).sort({ totalAmount: 1 });
        const offersByPrescription = offers.reduce((groups, offer) => {
            const key = offer.prescriptionId.toString();
            groups[key] = groups[key] || [];
            groups[key].push(offer);
            return groups;
        }, {});

        return res.status(200).json({
            prescriptions: prescriptions.map((prescription) => ({
                ...prescription.toObject(),
                offers: offersByPrescription[prescription._id.toString()] || []
            }))
        });
    } catch (error) {
        next(error);
    }
};

exports.acceptOffer = async (req, res, next) => {
    try {
        const { prescriptionId, offerId } = req.body;
        const patientId = getPatientId(req);

        const resolvedOfferId = offerId || (prescriptionId ? undefined : undefined);
        let offer;

        if (!offerId && !prescriptionId) {
            return res.status(400).json({ error: 'prescriptionId and offerId are required' });
        }

        if (offerId) {
            offer = await PrescriptionOffer.findOne({ _id: offerId });
            if (!offer) return res.status(404).json({ error: 'Offer not found' });
        }

        const targetPrescriptionId = prescriptionId || offer?.prescriptionId;
        if (!targetPrescriptionId) {
            return res.status(400).json({ error: 'prescriptionId is required' });
        }

        offer = await PrescriptionOffer.findOneAndUpdate(
            { _id: offerId || offer._id, prescriptionId: targetPrescriptionId },
            { status: 'accepted' },
            { new: true }
        );
        if (!offer) return res.status(404).json({ error: 'Offer not found' });

        await Prescription.findByIdAndUpdate(targetPrescriptionId, {
            status: 'accepted',
            acceptedOfferId: offer._id
        });

        await PrescriptionOffer.updateMany(
            { prescriptionId: targetPrescriptionId, _id: { $ne: offer._id } },
            { status: 'rejected' }
        );

        const order = await Order.create({
            patientId,
            medicines: offer.medicines,
            status: 'accepted',
            acceptedBy: offer.shopId,
            prescriptionId: targetPrescriptionId
        });

        return res.status(200).json({ message: 'Offer accepted', offer, order });
    } catch (error) {
        next(error);
    }
};

// ---- DASHBOARD HANDLER ----

exports.getPatientDashboard = async (req, res, next) => {
    try {
        const patientId = getPatientId(req);
        const [recentOrders, activeOrders, completedOrders, cart, prescriptionCount] = await Promise.all([
            Order.find({ patientId }).populate('acceptedBy', 'name shopName').sort({ createdAt: -1 }).limit(5),
            Order.countDocuments({ patientId, status: { $in: ['pending', 'accepted'] } }),
            Order.countDocuments({ patientId, status: 'delivered' }),
            Cart.findOne({ patientId }),
            Prescription.countDocuments({ patientId })
        ]);

        return res.status(200).json({
            success: true,
            activeOrders,
            cartItems: cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0,
            prescriptionCount,
            completedOrders,
            recentOrders,
            notifications: [],
            data: {
                recentOrders,
                activeOrders,
                cartItems: cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0,
                prescriptionCount,
                completedOrders
            }
        });
    } catch (error) {
        next(error);
    }
};
