const express = require('express');
const controller = require('./controller.js');
const path = require('path');
const bodyParser = require('body-parser');
var config = require('../config');
var twilioNotifications = require('../twilioNotifications');

var app = express();

app.post('/text', bodyParser(), twilioNotifications.notifyOnError);

app.get('/', (req, res) => {
    res.set('Content-Type', 'text/html');
    res.sendFile(path.join(__dirname, '..', 'index.html'));
})

app.get(/.js$/, (req, res) => {
    res.set('Content-Type', 'application/json');
    res.sendFile(path.join(__dirname, '..', 'webpack-bundle.js'));
}) 

app.get(/.css$/, (req, res) => {
    res.set('Content-Type', 'text/css');
    res.sendFile(path.join(__dirname, '..', 'styles.css'))
})

app.get('/craigslist/:item/:maxPrice/:minPrice', controller.postDB, controller.getScrapedData);
app.get('/data', controller.init);

app.delete('/remove', controller.dropCollection);

app.listen(3000)
module.exports = app;