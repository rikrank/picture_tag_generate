const fs = require('fs')
const dir = `./src/img`;
const sizeOf = require("image-size");
const glob = require("glob");

const ALLOW_EXTENTION = ".(jpeg|jpg|JPG|png|webp|bmp|gif)$";
const ENTRY_POINT = "./src/img/**/*";

const genHtml = (img) => {
    const { jpgValue, webpValue, width, height } = img;

    const pictureHtml = `
    <picture>
        <source srcset="${webpValue}" type="image/webp" width="${width}" height="${height}" />
        <img src="${jpgValue}" alt="" width="${width}" height="${height}" />
    </picture>
    `;
    console.log(pictureHtml);
    return pictureHtml;
}

const sliceByNumber = (array, number) => {
    const length = Math.ceil(array.length / number);
    return new Array(length).fill().map((_, i) => array.slice(i * number, (i + 1) * number));
};

const genHTMLElementHandler = () => {
    glob(ENTRY_POINT, (err, files) => {
        if (err) {
            console.log(err); return;
        }

        const h = files.map((file) => {
            let dimentions = sizeOf(file);
            dimentions.fileName = file;
            return dimentions;
        })

        const slicedArrH = sliceByNumber(h, 2);
        const g = slicedArrH.map((item) => {

            const patternDefaultExtention = ALLOW_EXTENTION.includes(item[0].type)
            const patternWEBP = item[1].type === 'webp';

            const defaultImgValue = patternDefaultExtention ? item[0].fileName : ''; // 空だったら、fileNameは""
            const webpImgValue = patternWEBP ? item[1].fileName : ''; // 空だったら、fileNameは""
            const width = item[0].width;
            const height = item[0].height;

            if (patternDefaultExtention && patternWEBP) {
                return {
                    jpgValue: defaultImgValue, webpValue: webpImgValue, width, height
                };
            }
        })
        const html = g.map((item) => {
            return genHtml(item);
        })

        const convertedHtml = html.join('');

        fs.writeFile('index.html', convertedHtml, function (err) {
            if (err) { throw err; }
            console.log('index.htmlが作成されました');
        });
    });

}

// genHTMLElementHandler();
