const express = require('express');
const session = require('express-session');
const app = express();

app.use(express.json());
app.use(session({
    secret: 'secret-key-50-phut',
    resave: false,
    saveUninitialized: false
}));

app.use('/students', require('./routes/studentRoutes'));
app.use('/', require('./routes/fileRoutes'));
app.use('/', require('./routes/authRoutes'));

app.listen(3000, () => console.log('Server running on http://localhost:3000'));