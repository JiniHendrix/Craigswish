const request = require('request');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
const Search = require('./model.js');

let cache = {};

const controller = {
    init: (req, res) => {
        Search.find({}, (err, result) => {
            if (err) throw err;
            res.json(result);
        })
    },
    dropCollection: (req, res) => {
        Search.remove({}, (err) => {
            if (err) throw err;
            res.send('dropped');
        })
    },

    postDB: (req, res, next) => {
        Search.findOneAndUpdate({item: req.params.item}, {maxPrice: req.params.maxPrice, minPrice: req.params.minPrice}, (err, result) => {
            if (!result) {
                Search.create({
                    item: req.params.item,
                    maxPrice: req.params.maxPrice,
                    minPrice: req.params.minPrice
                }, (err, result) => {
                    if (err) console.log(err);
                    console.log(result);
                });
            } 
            console.log(result);
        })
        next();
    },
    getScrapedData: (req, res) => {
        const query = req.params.item + req.params.maxPrice + req.params.minPrice;
        const parsedItemName = req.params.item.split(' ');
        
        if (cache[query] && cache[query].time - Date.now() < 1000 * 60 * 15) {
            return res.json({results: cache[query].results});
        }
        const item = req.params.item + '&sort=rel';
        const maxPrice = (req.params.maxPrice !== 'default' ? '&max_price=' + req.params.maxPrice : '');
        const minPrice = (req.params.minPrice !== 'default' ? '&min_price=' + req.params.minPrice : '');
        const url = 'https://losangeles.craigslist.org/search/sss?query=' + item + maxPrice + minPrice;

        request(url, (err, response, html) => {
            let $ = cheerio.load(html);
            let promiseArr = [];
            let results = [];

            $('.rows li.result-row').each((i, elem) => {
                const scrapedLink = $('a', elem).attr('href');
                let link = (scrapedLink.includes('craigslist') ? 'https:' + scrapedLink : 'https://losangeles.craigslist.org' + scrapedLink);
                promiseArr.push(new Promise((resolve, reject) => {
                    request(link, (err, response, html) => {
                        if (err) console.log(err);
                        resolve(html);
                    })
                }).then((values) => {
                    let $ = cheerio.load(values);
                    let title = $('#titletextonly').text();
                    let price = $('.price').text();
                    let area = $('.postingtitletext small').text();
                    let img = $('img').attr('src');

                    const regex = new RegExp(parsedItemName[0], 'i');
                    if (title.match(regex)) {
                        results.push({
                            title: title,
                            price: price,
                            area: area,
                            img: img,
                            link: link
                        });
                    }
                }));
            });
            Promise.all(promiseArr).then(() => {                
                cache[query] = {
                    results: results,
                    time: Date.now()
                };
                return res.json({ results: results });
            });
        })
    }
}

module.exports = controller;