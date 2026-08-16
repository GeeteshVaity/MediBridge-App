let Inventory, MedicineRequest, Notification, User;
try {
    const loadModel = (path, name) => {
        const raw = require(path);
        return raw.default || raw[name] || raw;
    };
    Inventory = loadModel('../../models/Inventory.ts', 'Inventory');
    MedicineRequest = loadModel('../../models/MedicineRequest.ts', 'MedicineRequest');
    Notification = loadModel('../../models/Notification.ts', 'Notification');
    User = loadModel('../../models/User.ts', 'User');
} catch (e) {
    console.warn("Could not load public models statically. Run via tsx.");
}

const toRadians = (degrees) => degrees * (Math.PI / 180);
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getDistanceKm = (lat1, lng1, lat2, lng2) => {
    const radiusKm = 6371;
    const deltaLat = toRadians(lat2 - lat1);
    const deltaLng = toRadians(lng2 - lng1);
    const a =
        Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(toRadians(lat1)) *
            Math.cos(toRadians(lat2)) *
            Math.sin(deltaLng / 2) *
            Math.sin(deltaLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return radiusKm * c;
};

exports.searchMedicines = async (req, res, next) => {
    try {
        const query = String(req.query.query || '').trim();
        const filter = query
            ? {
                medicineName: { $regex: query, $options: 'i' },
                quantity: { $gt: 0 }
            }
            : { quantity: { $gt: 0 } };

        const medicines = await Inventory.find(filter)
            .populate('shopId', 'name shopName shopAddress phone location')
            .sort({ medicineName: 1 })
            .limit(100);

        return res.status(200).json({ medicines });
    } catch (error) {
        next(error);
    }
};

exports.getShops = async (req, res, next) => {
    try {
        const lat = Number(req.query.lat);
        const lng = Number(req.query.lng);
        const maxDistance = Number(req.query.maxDistance || 3);

        const shops = await User.find({ role: 'shop' })
            .select('name email phone shopName shopAddress location')
            .sort({ shopName: 1, name: 1 });

        const transformedShops = shops
            .map((shop) => {
                const coordinates = shop.location?.coordinates;
                const hasLocation = Array.isArray(coordinates) && coordinates.length === 2;
                const shopLng = hasLocation ? coordinates[0] : null;
                const shopLat = hasLocation ? coordinates[1] : null;
                const distanceValue =
                    Number.isFinite(lat) && Number.isFinite(lng) && hasLocation
                        ? getDistanceKm(lat, lng, shopLat, shopLng)
                        : 0;

                return {
                    id: shop._id.toString(),
                    _id: shop._id,
                    name: shop.name,
                    email: shop.email,
                    phone: shop.phone,
                    shopName: shop.shopName,
                    shopAddress: shop.shopAddress,
                    distanceValue,
                    distance: hasLocation && Number.isFinite(lat) && Number.isFinite(lng)
                        ? `${distanceValue.toFixed(1)} km`
                        : 'N/A',
                    location: hasLocation ? { lat: shopLat, lng: shopLng } : null
                };
            })
            .filter((shop) => !Number.isFinite(lat) || !Number.isFinite(lng) || !shop.location || shop.distanceValue <= maxDistance)
            .sort((a, b) => a.distanceValue - b.distanceValue);

        return res.status(200).json({ shops: transformedShops });
    } catch (error) {
        next(error);
    }
};

exports.createMedicineRequest = async (req, res, next) => {
    try {
        const { medicineName, patientId, patientName } = req.body;
        if (!medicineName || !patientId || !patientName) {
            return res.status(400).json({ error: 'medicineName, patientId, and patientName are required' });
        }

        const existing = await MedicineRequest.findOne({
            medicineName: { $regex: `^${escapeRegex(medicineName)}$`, $options: 'i' },
            requestedBy: patientId,
            status: 'pending'
        });
        if (existing) {
            return res.status(409).json({ error: 'A pending request already exists', request: existing });
        }

        const request = await MedicineRequest.create({
            medicineName,
            requestedBy: patientId,
            patientName,
            status: 'pending'
        });

        return res.status(201).json({ message: 'Medicine request created', request });
    } catch (error) {
        next(error);
    }
};

exports.getMedicineRequests = async (req, res, next) => {
    try {
        const filter = {};
        if (req.query.status) filter.status = req.query.status;

        const requests = await MedicineRequest.find(filter)
            .populate('fulfilledBy', 'name shopName')
            .sort({ createdAt: -1 });

        return res.status(200).json({ requests });
    } catch (error) {
        next(error);
    }
};

exports.fulfillMedicineRequest = async (req, res, next) => {
    try {
        const { requestId, shopId } = req.body;
        if (!requestId || !shopId) {
            return res.status(400).json({ error: 'requestId and shopId are required' });
        }

        const request = await MedicineRequest.findByIdAndUpdate(
            requestId,
            { status: 'fulfilled', fulfilledBy: shopId, fulfilledAt: new Date() },
            { new: true }
        ).populate('fulfilledBy', 'name shopName');

        if (!request) return res.status(404).json({ error: 'Medicine request not found' });

        await Notification.create({
            userId: request.requestedBy,
            type: 'medicine-request',
            title: 'Medicine available',
            message: `${request.fulfilledBy?.shopName || request.fulfilledBy?.name || 'A pharmacy'} has marked ${request.medicineName} as available.`,
            relatedRequestId: request._id
        });

        return res.status(200).json({ message: 'Medicine request fulfilled', request });
    } catch (error) {
        next(error);
    }
};

exports.getNotifications = async (req, res, next) => {
    try {
        const { userId } = req.query;
        if (!userId) return res.status(400).json({ error: 'userId is required' });

        const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(50);
        const unreadCount = notifications.filter((notification) => !notification.read).length;

        return res.status(200).json({ notifications, unreadCount });
    } catch (error) {
        next(error);
    }
};

exports.markNotificationsRead = async (req, res, next) => {
    try {
        const { userId, notificationId } = req.body;
        if (notificationId) {
            const notification = await Notification.findByIdAndUpdate(
                notificationId,
                { read: true },
                { new: true }
            );
            return res.status(200).json({ message: 'Notification marked read', notification });
        }

        if (!userId) return res.status(400).json({ error: 'userId or notificationId is required' });

        await Notification.updateMany({ userId }, { read: true });
        return res.status(200).json({ message: 'Notifications marked read' });
    } catch (error) {
        next(error);
    }
};
