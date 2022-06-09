const fs = require('fs')
const dir = `./src/img`;
const files = fs.readdirSync(dir);
const sizeOf = require("image-size");
const glob = require("glob");

const allowExtensions = ".(jpeg|jpg|JPG|png|webp|bmp|gif)$";

const pattern = "./src/img/**/*";

glob(pattern, (err, files) => {
    if (err) {
        console.log(err); return;
    }
    const h = files.map((file) => {
        const dimentions = sizeOf(file);
        return dimentions;
    })

});

const genHtml = (jpg, webp, src, width, height) => {
    const pictureHtml = `
    <picture>
        <source srcset="${src}${webp}" type="image/webp" width="${width}" height="${height}" />
        <img src="${src}${jpg}" alt="" width="${width}" height="${height}" />
    </picture>
    `;

    return pictureHtml;
}

const genHTMLElementHandler = (src, width, height) => {
    const targetFiles = files.filter((file) => {
        const extention = file.split(".").pop();
        const isMedia = allowExtensions.includes(extention);
        if (isMedia) {
            return file;
        }
    });

    const sliceByNumber = (array, number) => {
        const length = Math.ceil(array.length / number);
        return new Array(length).fill().map((_, i) => array.slice(i * number, (i + 1) * number));
    };

    const slicedArr = sliceByNumber(targetFiles, 2);
    const genPictureTags = slicedArr.map((_, i) => genHtml(_[0], _[1], src, width, height));
    const convertedHTMLTags = genPictureTags.join('');

    fs.writeFile('index.html', convertedHTMLTags, (err) => {
        if (err) { throw err; }
        console.log('index.htmlが作成されました');
    });
}

genHTMLElementHandler("/assets/img/", 300, 300);