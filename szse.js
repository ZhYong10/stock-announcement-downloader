/**
 * Created by zhyong10 on 2019-03-12.
 */
const puppeteer = require('puppeteer');

module.exports = async function getFromSH(symbol, start, end) {
    let urls = [];
    const browser = await puppeteer.launch({
        headless: true
    });

    const page = await browser.newPage();
    await page.goto('http://www.szse.cn/disclosure/listed/notice/index.html');

    await page.waitForFunction('$ && $.ajax');

    await page.waitFor(800);

    let currentPage = 1, pageSize = 30;

    async function waitForQueryResult() {
        let waitForResponsePromise = page.waitForResponse(function (response) {
            if (response.status() === 200 && response.url().startsWith('http://www.szse.cn/api/disc/announcement/annList?random=')) {
                console.log(response.url());
                return true;
            }
        });

        await page.evaluate(`
            $.ajax({
                contentType:'application/json',
                method:'post',
                url:'http://www.szse.cn/api/disc/announcement/annList?random='+String(Math.random()),
                data:JSON.stringify({
                    "seDate":["${start}","${end}"],
                    "stock":["${symbol}"],
                    "channelCode":["listedNotice_disc"],
                    "pageSize":${pageSize},
                    "pageNum":${currentPage}
                })
            });`);

        let response = await waitForResponsePromise;

        let result = await response.json();

        urls = urls.concat(result.data.map(c => c.attachPath));

        return result;
    }

    let queryResult = await waitForQueryResult();
    let pageCount = Math.ceil(queryResult.announceCount / pageSize);


    while (currentPage < pageCount) {
        // 等待 800ms
        page.waitFor(800)

        currentPage++;

        await page.waitFor(800);

        await waitForQueryResult();
    }

    await page.close();

    await browser.close();

    return urls.map(url => ('http://disc.static.szse.cn/download/' + url));
}
