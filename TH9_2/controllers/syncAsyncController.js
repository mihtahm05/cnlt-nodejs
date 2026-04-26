const heavySync = (req, res) => {
    // Vòng lặp giả lập tác vụ nặng chặn Event Loop (Blocking)
    let sum = 0;
    for (let i = 0; i < 5e9; i++) { sum += i; }
    res.json({ message: "Xử lý đồng bộ (Blocking) hoàn tất", sum });
};

const heavyAsync = (req, res) => {
    // Dùng setTimeout để đẩy tác vụ ra khỏi luồng chính (Non-blocking)
    setTimeout(() => {
        res.json({ message: "Xử lý bất đồng bộ (Non-blocking) hoàn tất sau 3 giây" });
    }, 3000);
};

module.exports = { heavySync, heavyAsync };