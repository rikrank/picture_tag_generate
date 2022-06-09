const fs = require('fs')
const dir = `./src/img`;
const files = fs.readdirSync(dir);

let fileDetectionArr = [];


const genElement = (webp, jpg) => {

    const pictureElement = `
    <picture class="p-gallery-space__img">
    <source srcset="/product_carpet/ga3600/gallery/img/${webp}" type="image/webp" width="300" height="300">
    <img src="/product_carpet/ga3600/gallery/img/${jpg}" alt="" width="300" height="300">
    </picture>
    `;

    console.log(pictureElement);

    return pictureElement;
}

const generatePictureElement = (name) => {
    if (name.match(/.DS_Store/)) return; // DS_Storeダメ絶対マン

    const isJpg = name.match(/.jpg/);
    const isWebp = name.match(/.webp/);

    if (isJpg) {
        fileDetectionArr.push(name);
    } else if (isWebp) {
        fileDetectionArr.push(name)
    }

    if (fileDetectionArr.length === 2) {
        genElement(fileDetectionArr[0], fileDetectionArr[1])
        fileDetectionArr = [];
    }

}

files.map((file) => {
    const fileName = file;
    return generatePictureElement(fileName);
});