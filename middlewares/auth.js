const path = require('path');
function isAuthenticated(req, res, next) {
    if (req.session && req.session.success) {
        return next();
    }
    return res.redirect('/login');
}

function isAdmin(req, res, next) {
    if (req.session && req.session.role === 'admin') {
        return next();
    }
    return res.sendFile(path.join(__dirname + '/../public/adminonly.html'));
}

module.exports = { isAuthenticated, isAdmin };