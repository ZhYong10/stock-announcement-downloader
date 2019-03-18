/**
 * Created by zhyong10 on 2019-03-11.
 */


const fs = require('fs'),
    path = require('path'),
    axios = require('axios'),
    moment = require('moment');

const getFromSH = require('./sse'),
    getFromSZ = require('./szse'),
    download = require('./download');

// let symbol = '002020',
// let symbol = '600020',
let symbol = process.argv[2],
    dir = './files/';

let announcements = [];

(async function () {
    let stock_basic = await axios.post('http://api.tushare.pro/', {
        api_name: 'stock_basic',
        token: 'b4c0e59ca25251af6d75fbc2f3da5ca3faa4bea4924a1c86d653b5c8',
        params: {},
        fields: 'symbol,list_date'
    });

    // 上市日期
    let listDate = stock_basic.data.data.items.find(s => s[0] === symbol)[1];

    listDate = moment(listDate, 'YYYYMMDD').format('YYYY-MM-DD');

    let end = moment().add(1, 'day').format('YYYY-MM-DD');

    let announcements = [];
    // while (end > listDate) {
    let start = moment(end, 'YYYY-MM-DD').add(-1000, 'day').format('YYYY-MM-DD');

    if (symbol.startsWith('6')) {
        announcements = await getFromSH(symbol, start, end);
    } else {
        announcements = await getFromSZ(symbol, start, end);
    }

    end = moment(start, 'YYYY-MM-DD').add(1, 'day').format('YYYY-MM-DD');
    // }
    console.log(announcements.length, 'records');
    console.log(announcements);

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    let dirOfSymbol = path.join(dir, symbol);
    if (!fs.existsSync(dirOfSymbol)) {
        fs.mkdirSync(dirOfSymbol);
    }

    for (let announcement of announcements) {
        console.log('progress:', announcements.indexOf(announcement), '/', announcements.length);
        let fileName = announcement.date + ' ' + announcement.title + '.pdf';

        await download(dirOfSymbol, announcement.url, fileName);
    }

    console.log(`Announcements download finished for { symbol:${symbol} ,start : ${start} ,end : ${end} }.`)
})();


