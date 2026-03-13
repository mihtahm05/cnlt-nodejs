const express = require('express')
const app = express()
const path = require('path')

app.use(express.static(path.join(__dirname, 'public'))); 
app.use(express.static(path.join(__dirname, 'pages')));

app.get('/', (request, response) =>{
    response.sendFile(path.resolve(__dirname, 'pages/index.html'))
})
app.get('/about', (request, response) =>{
    response.sendFile(path.resolve(__dirname, 'pages/about.html'))
})

app.get('/contact', (request, response) =>{
    response.sendFile(path.resolve(__dirname, 'pages/contact.html'))
})
app.get('/post', (request, response) =>{
    response.sendFile(path.resolve(__dirname, 'pages/post.html'))
})

app.listen(4000, () => {
    console.log('App listening on port 4000')
})