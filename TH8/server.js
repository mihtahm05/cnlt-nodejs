const express = require("express");
const multer = require("multer");
const app = express();
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads"),
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage: storage }).single("file");
app.get("/", (req, res) => {
    res.send(`
<form action="/upload" method="post" enctype="multipart/form-data">
<input type="file" name="file" />
<button type="submit">Upload</button>
</form>
`);
});
app.post("/upload", (req, res) => {
    upload(req, res, (err) => {
        if (err) return res.send("Lỗi upload");
        res.send("Upload thành công");
    });

});

app.listen(8017, () => {
    console.log("Server chạy tại http://localhost:8017");
});