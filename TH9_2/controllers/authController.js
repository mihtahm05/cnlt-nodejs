const login = (req, res) => {
    const { username, password } = req.body;
    if (username === "admin" && password === "123456") {
        req.session.user = { username: "admin", role: "admin" }; // Tạo session
        res.json({ message: "Đăng nhập thành công" });
    } else {
        res.status(401).json({ message: "Sai tài khoản hoặc mật khẩu" });
    }
};

const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ message: "Lỗi khi đăng xuất" });
        res.json({ message: "Đăng xuất thành công" });
    });
};

module.exports = { login, logout };