/**
 * Created by zhyong10 on 2019-03-12.
 */
const puppeteer = require('puppeteer');

module.exports = async function getFromSH(symbol, start, end) {
    let announcements = [];
    const browser = await puppeteer.launch({
        headless: true
    });

    const page = await browser.newPage();
    await page.goto('http://www.sse.com.cn/disclosure/listedinfo/announcement/')

    // while()
    await page.waitFor('#inputCode');

    await page.waitFor(800);

    await page.evaluate(`
                document.getElementById('inputCode').value = '${symbol}';
                document.getElementById('start_date').value = '${start}';
                document.getElementById('end_date').value = '${end}';
                document.getElementById('btnQuery').click();`);

    async function waitForQueryResult() {
        let response = await page.waitForResponse(function (response) {
            if (response.status() === 200 && response.url().startsWith('http://query.sse.com.cn/security/stock/queryCompanyStatementNew.do?')) {
                console.log(response.url());
                return true;
            }
        });

        let result = await response.text();

        result = JSON.parse(result.replace(/^jsonpCallback[0-9]*\(/, '').replace(/\)$/, ''));

        announcements = announcements.concat(result.result.map(c => ({
            url: 'http://static.sse.com.cn' + c.URL,
            date: c.SSEDate,
            title: c.title
        })));

        return result;
    }

    let queryResult = await waitForQueryResult();
    let pageCount = queryResult.pageHelp.pageCount;

    let currentPage = 1;
    while (currentPage < pageCount) {
        // 等待 800ms
        page.waitFor(800)

        currentPage++;

        await page.waitFor('#ht_codeinput');
        await page.waitFor('#pagebutton');

        await page.waitFor(800);

        await page.evaluate(`
                    document.getElementById('ht_codeinput').value = '${currentPage}';
                    document.getElementById('pagebutton').click();
                `);

        await waitForQueryResult();
    }

    await page.close();

    await browser.close();

    return announcements;
}
