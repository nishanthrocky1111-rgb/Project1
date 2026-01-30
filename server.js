const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/	lorry_transport';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// MongoDB Connection
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB successfully'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// MongoDB Schemas and Models

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Vehicle Schema
const vehicleSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    image: { type: String, required: true },
    description: { type: String, required: true },
    priceDay: { type: Number, required: true },
    priceHour: { type: Number, required: true },
    available: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

// Booking Schema
const bookingSchema = new mongoose.Schema({
    bookingId: { type: String, required: true, unique: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    customerName: { type: String, required: true },
    contact: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    vehicle: { type: String, required: true },
    rentalType: { type: String, enum: ['hourly', 'daily'], required: true },
    duration: { type: Number, required: true },
    cost: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
    timestamp: { type: Date, default: Date.now }
});

const Booking = mongoose.model('Booking', bookingSchema);

// Settings Schema
const settingsSchema = new mongoose.Schema({
    taxPercentage: { type: Number, default: 10 },
    maintenanceFee: { type: Number, default: 500 },
    agencyName: { type: String, default: 'Lorry Rental Agency' },
    contactNumber: { type: String, default: '+91 98765 43210' },
    address: { type: String, default: 'Lorry Rentals, Pollachi, Coimbatore' }
});

const Settings = mongoose.model('Settings', settingsSchema);

// Payment Settings Schema
const paymentSettingsSchema = new mongoose.Schema({
    method: { type: String, enum: ['gpay', 'paytm', 'phonepe'], required: true },
    upiId: { type: String, required: true },
    qrCode: { type: String, required: true },
    customQr: { type: String, default: null }
});

const PaymentSettings = mongoose.model('PaymentSettings', paymentSettingsSchema);

// Initialize default data
async function initializeDefaultData() {
    try {
        // Check if users exist
        const userCount = await User.countDocuments();
        if (userCount === 0) {
            const defaultUsers = [
                {
                    username: 'nishanth',
                    password: bcrypt.hashSync('nishanth', 10),
                    role: 'customer'
                },
                {
                    username: 'admin',
                    password: bcrypt.hashSync('admin123', 10),
                    role: 'admin'
                }
            ];
            await User.insertMany(defaultUsers);
            console.log('✅ Default users created');
        }

        // Check if vehicles exist
        const vehicleCount = await Vehicle.countDocuments();
        if (vehicleCount === 0) {
            const defaultVehicles = [
                {
                    name: "TATA LPT",
                    image: "https://truckcdn.cardekho.com/in/tata/1815-lpt/tata-1815-lpt.jpg",
                    description: "A Heavy-Duty Truck",
                    priceDay: 7000,
                    priceHour: 300
                },
                {
                    name: "Bharath Benz HDT T",
                    image: "https://5.imimg.com/data5/IOS/Default/2023/6/320806107/EY/LC/ZV/186633041/product-jpeg.png",
                    description: "A Heavy-Duty Truck",
                    priceDay: 25000,
                    priceHour: 1000
                },
                {
                    name: "TATA 407",
                    image: "https://truckcdn.cardekho.com/in/tata/407-g-sfc/tata-407-g-sfc.jpg",
                    description: "A Heavy-Duty Truck",
                    priceDay: 12000,
                    priceHour: 500
                },
                {
                    name: "Eicher Pro 3019",
                    image: "https://www.cmv360.com/_next/image?url=https%3A%2F%2Fd1odgbsvvxl2qd.cloudfront.net%2Fsmall_Eicher_Pro_2110_CNG_Truck_d4edb70c39.webp&w=3840&q=75.jpg",
                    description: "A Heavy-Duty Truck",
                    priceDay: 5000,
                    priceHour: 200
                },
                {
                    name: "TATA Signa 4825",
                    image: "https://5.imimg.com/data5/SELLER/Default/2022/6/DW/CQ/JR/126360925/1597393298-tata-signa-tipper-truck-1-.jpg",
                    description: "A Heavy-Duty Truck",
                    priceDay: 8000,
                    priceHour: 350
                },
                {
                    name: "Volvo FM 400 HD",
                    image: "https://img.linemedia.com/img/s/dump-truck-Volvo-FM-400-8x4-Bordmatic---1727369990312147022_big--24092619515981524100.jpg",
                    description: "A Heavy-Duty Truck",
                    priceDay: 20000,
                    priceHour: 900
                },
                {
                    name: "Mahindra Tyuxo 31-202 HP",
                    image: "https://svmchaser.wordpress.com/wp-content/uploads/2015/06/442fc-dsc_5767.jpg",
                    description: "A Heavy-Duty Truck",
                    priceDay: 18000,
                    priceHour: 800
                },
                {
                    name: "Eicher Pro 6000 Series",
                    image: "https://5.imimg.com/data5/FM/UO/UQ/GLADMIN-33643285/6c36b18a27367c18af97cb978bf58f36-500x500-500x500.jpg",
                    description: "A Heavy-Duty Truck",
                    priceDay: 25000,
                    priceHour: 1000
                },
                {
                    name: "Asok Leyland V3718",
                    image: "https://4.imimg.com/data4/AL/XM/IMOB-47670626/img_20180522_115142-jpg.jpg",
                    description: "A Heavy-Duty Truck",
                    priceDay: 25000,
                    priceHour: 1000
                },
                {
                    name: "Mahindra Blazo X46",
                    image: "https://truckcdn.cardekho.com/in/mahindra/blazo-x-48-10x2-haulage/mahindra-blazo-x-48-10x2-haulage.jpg",
                    description: "A Heavy-Duty Truck",
                    priceDay: 15000,
                    priceHour: 600
                },
                {
                    name: "TATA Signa 4225.TK Tipper",
                    image: "https://5.imimg.com/data5/SELLER/Default/2024/2/390279483/GV/IX/LF/23382559/whatsapp-image-2024-02-19-at-6-53-20-pm-1-500x500.jpeg",
                    description: "A Heavy-Duty Truck",
                    priceDay: 20000,
                    priceHour: 900
                }
            ];
            await Vehicle.insertMany(defaultVehicles);
            console.log('✅ Default vehicles created');
        }

        // Check if settings exist
        const settingsCount = await Settings.countDocuments();
        if (settingsCount === 0) {
            const defaultSettings = new Settings({
                taxPercentage: 10,
                maintenanceFee: 500,
                agencyName: "Lorry Rental Agency",
                contactNumber: "+91 98765 43210",
                address: "Lorry Rentals, Pollachi, Coimbatore"
            });
            await defaultSettings.save();
            console.log('✅ Default settings created');
        }

        // Check if payment settings exist
        const paymentSettingsCount = await PaymentSettings.countDocuments();
        if (paymentSettingsCount === 0) {
            const defaultPaymentSettings = [
                {
                    method: 'gpay',
                    upiId: 'lorryrentalagency@okhdfcbank',
                    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=UPIID:lorryrentalagency@okhdfcbank'
                },
                {
                    method: 'paytm',
                    upiId: 'lorryrentalagency@paytm',
                    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=UPIID:lorryrentalagency@paytm'
                },
                {
                    method: 'phonepe',
                    upiId: 'lorryrentalagency@ybl',
                    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=UPIID:lorryrentalagency@ybl'
                }
            ];
            await PaymentSettings.insertMany(defaultPaymentSettings);
            console.log('✅ Default payment settings created');
        }
    } catch (error) {
        console.error('❌ Error initializing default data:', error);
    }
}

// Authentication middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
}

// Admin authorization middleware
function requireAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
}

// Routes

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Authentication routes
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const user = await User.findOne({ username });
        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const token = jwt.sign(
            { 
                id: user._id, 
                username: user.username, 
                role: user.role 
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Bookings routes
app.get('/api/bookings', authenticateToken, async (req, res) => {
    try {
        let bookings;
        
        // Customers can only see their own bookings
        if (req.user.role === 'customer') {
            bookings = await Booking.find({ customerId: req.user.id }).sort({ timestamp: -1 });
        } else {
            // Admins can see all bookings
            bookings = await Booking.find().sort({ timestamp: -1 });
        }
        
        res.json(bookings);
    } catch (error) {
        console.error('Get bookings error:', error);
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
});

app.post('/api/bookings', authenticateToken, async (req, res) => {
    try {
        const {
            customerName,
            contact,
            date,
            location,
            vehicle,
            rentalType,
            duration,
            paymentMethod
        } = req.body;

        if (!customerName || !contact || !date || !location || !vehicle || !rentalType || !duration || !paymentMethod) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Get vehicle details
        const vehicleData = await Vehicle.findOne({ name: vehicle });
        if (!vehicleData) {
            return res.status(400).json({ error: 'Selected vehicle not found' });
        }

        // Get settings
        const settings = await Settings.findOne();
        if (!settings) {
            return res.status(500).json({ error: 'Settings not found' });
        }

        // Calculate cost
        let baseCost = 0;
        if (rentalType === 'hourly') {
            baseCost = vehicleData.priceHour * duration;
        } else {
            baseCost = vehicleData.priceDay * duration;
        }

        const tax = baseCost * (settings.taxPercentage / 100);
        const totalCost = baseCost + tax + settings.maintenanceFee;

        const newBooking = new Booking({
            bookingId: `LR${Date.now()}`,
            customerId: req.user.id,
            customerName,
            contact,
            date: new Date(date),
            location,
            vehicle,
            rentalType,
            duration,
            cost: totalCost,
            paymentMethod,
            status: 'pending'
        });

        await newBooking.save();

        res.status(201).json({
            message: 'Booking created successfully',
            booking: newBooking
        });
    } catch (error) {
        console.error('Create booking error:', error);
        res.status(500).json({ error: 'Failed to create booking' });
    }
});

app.put('/api/bookings/:id/status', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const booking = await Booking.findOne({ bookingId: id });
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        booking.status = status;
        await booking.save();

        res.json({
            message: 'Booking status updated successfully',
            booking
        });
    } catch (error) {
        console.error('Update booking status error:', error);
        res.status(500).json({ error: 'Failed to update booking status' });
    }
});

// Vehicles routes
app.get('/api/vehicles', async (req, res) => {
    try {
        const vehicles = await Vehicle.find();
        res.json(vehicles);
    } catch (error) {
        console.error('Get vehicles error:', error);
        res.status(500).json({ error: 'Failed to fetch vehicles' });
    }
});

app.post('/api/vehicles', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { name, image, description, priceDay, priceHour } = req.body;

        if (!name || !image || !description || !priceDay || !priceHour) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if vehicle already exists
        const existingVehicle = await Vehicle.findOne({ name });
        if (existingVehicle) {
            return res.status(400).json({ error: 'Vehicle with this name already exists' });
        }

        const newVehicle = new Vehicle({
            name,
            image,
            description,
            priceDay: parseInt(priceDay),
            priceHour: parseInt(priceHour)
        });

        await newVehicle.save();

        res.status(201).json({
            message: 'Vehicle added successfully',
            vehicle: newVehicle
        });
    } catch (error) {
        console.error('Add vehicle error:', error);
        res.status(500).json({ error: 'Failed to add vehicle' });
    }
});

app.delete('/api/vehicles/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        // Check if vehicle has any bookings
        const vehicleBookings = await Booking.findOne({ vehicle: id });
        if (vehicleBookings) {
            return res.status(400).json({ 
                error: 'Cannot delete vehicle with existing bookings. Consider marking it as unavailable instead.' 
            });
        }

        const result = await Vehicle.deleteOne({ _id: id });
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Vehicle not found' });
        }

        res.json({ message: 'Vehicle deleted successfully' });
    } catch (error) {
        console.error('Delete vehicle error:', error);
        res.status(500).json({ error: 'Failed to delete vehicle' });
    }
});

// Settings routes
app.get('/api/settings', authenticateToken, async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            // Create default settings if none exist
            settings = new Settings();
            await settings.save();
        }
        res.json(settings);
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

app.put('/api/settings', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { taxPercentage, maintenanceFee, agencyName, contactNumber, address } = req.body;

        if (taxPercentage === undefined || maintenanceFee === undefined || !agencyName || !contactNumber || !address) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings();
        }

        settings.taxPercentage = parseFloat(taxPercentage);
        settings.maintenanceFee = parseFloat(maintenanceFee);
        settings.agencyName = agencyName;
        settings.contactNumber = contactNumber;
        settings.address = address;

        await settings.save();

        res.json({
            message: 'Settings updated successfully',
            settings
        });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

// Payment settings routes
app.get('/api/payment-settings', authenticateToken, async (req, res) => {
    try {
        const paymentSettings = await PaymentSettings.find();
        
        // Convert array to object for easier frontend use
        const settingsObj = {};
        paymentSettings.forEach(setting => {
            settingsObj[setting.method] = {
                upiId: setting.upiId,
                qrCode: setting.qrCode,
                customQr: setting.customQr
            };
        });

        res.json(settingsObj);
    } catch (error) {
        console.error('Get payment settings error:', error);
        res.status(500).json({ error: 'Failed to fetch payment settings' });
    }
});

app.put('/api/payment-settings', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { gpay, paytm, phonepe } = req.body;

        if (!gpay || !paytm || !phonepe) {
            return res.status(400).json({ error: 'All payment methods are required' });
        }

        // Update each payment method
        await PaymentSettings.updateOne(
            { method: 'gpay' },
            { 
                upiId: gpay.upiId,
                qrCode: gpay.customQr || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=UPIID:${gpay.upiId}`,
                customQr: gpay.customQr || null
            }
        );

        await PaymentSettings.updateOne(
            { method: 'paytm' },
            { 
                upiId: paytm.upiId,
                qrCode: paytm.customQr || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=UPIID:${paytm.upiId}`,
                customQr: paytm.customQr || null
            }
        );

        await PaymentSettings.updateOne(
            { method: 'phonepe' },
            { 
                upiId: phonepe.upiId,
                qrCode: phonepe.customQr || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=UPIID:${phonepe.upiId}`,
                customQr: phonepe.customQr || null
            }
        );

        res.json({
            message: 'Payment settings updated successfully'
        });
    } catch (error) {
        console.error('Update payment settings error:', error);
        res.status(500).json({ error: 'Failed to update payment settings' });
    }
});

// Admin dashboard stats
app.get('/api/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const totalBookings = await Booking.countDocuments();
        const pendingBookings = await Booking.countDocuments({ status: 'pending' });
        const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
        
        const revenueResult = await Booking.aggregate([
            { $match: { status: 'confirmed' } },
            { $group: { _id: null, totalRevenue: { $sum: '$cost' } } }
        ]);
        
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

        res.json({
            totalBookings,
            pendingBookings,
            confirmedBookings,
            totalRevenue
        });
    } catch (error) {
        console.error('Get admin stats error:', error);
        res.status(500).json({ error: 'Failed to fetch admin statistics' });
    }
});

// Initialize data and start server
mongoose.connection.once('open', async () => {
    console.log('🚀 MongoDB connection established');
    await initializeDefaultData();
    
    app.listen(PORT, () => {
        console.log(`🏢 Lorry Rental Agency server running on port ${PORT}`);
        console.log(`📍 Visit http://localhost:${PORT} to access the application`);
    });
});

// Handle MongoDB connection errors
mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err);
});