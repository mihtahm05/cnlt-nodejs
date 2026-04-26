const login = (req, res) => {
    const { username, password } = req.body;
    if (username === "admin" && password === "123456") {
        // Session lưu trạng thái trên server[cite: 241].
        req.session.user = { username: "admin" };
        res.status(200).json({ message: "Đăng nhập thành công" });
    } else {
        res.status(400).json({ message: "Sai tài khoản" });
    }
};

const profile = (req, res) => {
    if (req.session.user) {
        res.status(200).json({ message: "Thông tin profile", user: req.session.user });
    } else {
        res.status(401).json({ message: "Chưa đăng nhập" });
    }
};

const logout = (req, res) => {
    req.session.destroy();
    res.status(200).json({ message: "Đã đăng xuất" });
};

module.exports = { login, profile, logout };