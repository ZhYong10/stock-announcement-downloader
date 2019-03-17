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
            console.log('File exists already', fileName);
            return resolve();
        }

        console.log('start download:', fileName);

        const file = fs.createWriteStream(filePath, {
            // encoding: 'utf8'
        });
        const request = http.get(url, function (response) {
            response.pipe(file);

            console.log('downloaded:', url);

            resolve();
        });
    });
}
