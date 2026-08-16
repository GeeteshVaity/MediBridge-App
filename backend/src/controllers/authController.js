// Import the User model from the TypeScript file using require
let User;
try {
    const userModule = require('../../models/User.ts') || require('../../models/User');
    User = userModule.default || userModule.User;
} catch (e) {
    console.warn("Could not load User model statically. Make sure you use `tsx` to run the server.");
}

const jwt = require('jsonwebtoken');

// Helper to generate token
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d',
    });
};

const serializeUser = (user) => {
    const object = typeof user.toObject === 'function' ? user.toObject() : user;
    return {
        ...object,
        id: object._id?.toString?.() || object.id
    };
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    try {
        const { name, email, password, role, shopName, shopAddress, phone } = req.body;

        // Validate inputs (basic)
        if (!name || !email || !password || !role) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields' });
        }

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Create user
        // Note: Password hashing is handled by the Mongoose 'pre-save' hook in models/User.ts
        const user = await User.create({
            name,
            email,
            password,
            role,
            shopName,
            shopAddress,
            phone
        });

        const token = generateToken(user._id, user.role);

        res.status(201).json({
            success: true,
            token,
            user: serializeUser(user)
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate inputs
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide an email and password' });
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Check if password matches using the schema method
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = generateToken(user._id, user.role);

        // Remove password from response
        user.password = undefined;

        res.status(200).json({
            success: true,
            token,
            user: serializeUser(user)
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    try {
        // req.user has been attached by the protect middleware containing id and role
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            user: serializeUser(user)
        });
    } catch (error) {
        next(error);
    }
};
