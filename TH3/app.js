const express = require('express');
const app = express();

app.set('view engine', 'ejs'); 
app.set('views', './views'); 
app.use(express.static('public')); 

const clubs = [
    { id: 1, name: 'CLB Tin Học', desc: 'Nơi giao lưu công nghệ', members: 50, hot: true },
    { id: 2, name: 'CLB Âm Nhạc', desc: 'Đam mê ca hát', members: 30, hot: false },
    { id: 3, name: 'CLB Thể Thao', desc: 'Rèn luyện sức khỏe', members: 100, hot: true },
    { id: 4, name: 'CLB Tiếng Anh', desc: 'Cải thiện kỹ năng giao tiếp', members: 45, hot: false },
    { id: 5, name: 'CLB Kỹ Năng', desc: 'Phát triển bản thân', members: 60, hot: true }
];

app.get('/', (req, res) => res.render('index', { title: 'Trang chủ', clubs })); 
app.get('/list', (req, res) => res.render('list', { title: 'Danh sách CLB', clubs })); 
app.get('/contact', (req, res) => res.render('contact', { title: 'Liên hệ' }));
app.get('/detail/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const club = clubs.find(c => c.id === id);
    if (!club) return res.send('Không tìm thấy CLB');
    res.render('detail', { title: 'Chi tiết CLB', club });
});
app.listen(3000, () => console.log('Server running at http://localhost:3000'));