const fs = require('fs')
const glob = require("glob");
const sizeOf = require("image-size");

const ALLOW_EXTENTION = ".(jpeg|jpg|JPG|png|webp|bmp|gif)$";
const TARGET_PATTERN = "./**/*.{jpeg,jpg,JPG,webp,png,bmp,gif}";

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
    glob(TARGET_PATTERN, (err, files) => {
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

            const isExistWebp = item[1] || null;

            const TARGET_PATTERNDefaultExtention = ALLOW_EXTENTION.includes(item[0].type)
            const imgPath = TARGET_PATTERNDefaultExtention ? item[0].fileName : ''; // 空だったら、fileNameは""

            let webpPath = "";

            if (isExistWebp) {
                const TARGET_PATTERNWEBP = item[1].type === 'webp';
                webpPath = TARGET_PATTERNWEBP ? item[1].fileName : ''; // 空だったら、fileNameは""
            } else {
                console.log('webpファイルが存在しない画像ファイルがあります。\nファイルパスが空のsourceタグを生成します。');
            }

            const width = item[0].width;
            const height = item[0].height;

            return {
                imgPath, webpPath, width, height
            };
        })

        const html = imgValues.map((item) => {
            return genHtml(item);
        })

        const convertedHtml = html.join('');
        fs.writeFile('index.html', convertedHtml, function (err) {
            if (err) { throw err; }
            console.log('\nindex.html にて pictureタグが生成されました');
        });
    });

}

genHTMLElementHandler();
