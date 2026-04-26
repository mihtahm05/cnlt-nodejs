const requireLogin = (req, res, next) => {
    if (req.session && req.session.user) {
        next(); // Đã đăng nhập, cho phép đi tiếp
    } else {
        res.status(401).json({ message: "Unauthorized. Vui lòng đăng nhập!" });
    }
};
module.exports = requireLogin;