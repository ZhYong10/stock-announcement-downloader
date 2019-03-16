/**
 * Created by zhyong10 on 2019-03-16.
 */

const http = require('http'),
    fs = require('fs'),
    path = require('path');

module.exports = function (dir, url, fileName) {
    return new Promise((resolve, reject) => {
        fileName = fileName || url.split('/').reverse()[0];

        let filePath = path.join(dir, fileName);
        if (fs.existsSync(filePath)) {
            return resolve();
        }

        const file = fs.createWriteStream(filePath);
        const request = http.get(url, function (response) {
            response.pipe(file);

            resolve();
        });
    });
}
