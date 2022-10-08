const fs = require('fs')
const glob = require("glob");
const sizeOf = require("image-size");

const ALLOW_EXTENTION = ".(jpeg|jpg|JPG|png|webp|bmp|gif)$";
const ENTRY_POINT = "./src/assets/img/**/*";

const genHtml = (img) => {
    const { imgPath, webpPath, width, height } = img;

    const pictureHtml = `
    <picture>
        <source srcset="${webpPath}" type="image/webp" width="${width}" height="${height}" />
        <img src="${imgPath}" alt="" width="${width}" height="${height}" />
    </picture>
    `;
    // console.log(pictureHtml);
    return pictureHtml;
}

const sliceByNumber = (array, number) => {
    const length = Math.ceil(array.length / number);
    return new Array(length).fill().map((_, i) => array.slice(i * number, (i + 1) * number));
};

const genHTMLElementHandler = () => {
    glob(ENTRY_POINT, (err, files) => {
        console.log("files=>", files);
        if (err) {
            console.log(err); return;
        }

        const fileDimentions = files.map((file) => {
            let dimentions = sizeOf(file);
            dimentions.fileName = file;
            return dimentions;
        })

        const slicedFileDimentions = sliceByNumber(fileDimentions, 2);
        const imgValues = slicedFileDimentions.map((item) => {

            const patternDefaultExtention = ALLOW_EXTENTION.includes(item[0].type)
            const patternWEBP = item[1].type === 'webp';

            const imgPath = patternDefaultExtention ? item[0].fileName : ''; // 空だったら、fileNameは""
            const webpPath = patternWEBP ? item[1].fileName : ''; // 空だったら、fileNameは""
            const width = item[0].width;
            const height = item[0].height;

            if (patternDefaultExtention && patternWEBP) {
                return {
                    imgPath, webpPath, width, height
                };
            }
        })

        const html = imgValues.map((item) => {
            return genHtml(item);
        })

        const convertedHtml = html.join('');
        fs.writeFile('index.html', convertedHtml, function (err) {
            if (err) { throw err; }
            console.log('index.htmlが作成されました');
        });
    });

}

genHTMLElementHandler();
