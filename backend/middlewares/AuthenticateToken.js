const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Access Denied. No token provided.' });

    // Check if token is blacklisted
    if (blacklist.has(token)) {
        return res.status(403).json({ message: 'Token has been invalidated. Please log in again.' });
    }

    try {
        const verified = jwt.verify(token, JWT_SECRET);
        req.employee = verified; // Add the verified employee info to the request
        next();
    } catch (err) {
        res.status(403).json({ message: 'Invalid or expired token.' });
    }
};

module.exports=authenticateToken;

