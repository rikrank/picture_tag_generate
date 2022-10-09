const fs = require('fs')
const glob = require("glob");
const sizeOf = require("image-size");
const imageminWebp = require("imagemin-webp");
const imagemin = require("imagemin-keep-folder");

const TARGET_PATTERN = "./src/**/*.{jpeg,jpg,JPG,webp,png,bmp,gif}";
const WEBP_OUT_DIR = "./src/**/*";

const generateSnippets = (img, fileType) => {
    const { replacedImgPath, replacedWebpPath, width, height } = img;
    if (fileType === 'html') {
        return `
        <picture>
          <source srcset="${replacedWebpPath}" type="image/webp" width="${width}" height="${height}" />
          <img src="${replacedImgPath}" alt="" width="${width}" height="${height}" />
        </picture>
        `;
    } else if (fileType === 'pug') {
        return `
        picture
          source(srcset="${replacedWebpPath}" type="image/webp" width="${width}" height="${height}")
          img(src="${replacedImgPath}" alt="" width="${width}" height="${height}")
        `;
    }
};

const sliceByNumber = (array, number) => {
    const length = Math.ceil(array.length / number);
    return new Array(length).fill().map((_, i) => array.slice(i * number, (i + 1) * number));
};

const generateSnippetsHandler = (fileType) => {
    glob(TARGET_PATTERN, (err, files) => {

        // 画像ファイルが存在しなかった場合
        if (!files.length) {
            console.error('画像ファイルが存在しません');
            throw err;
        } else {
            const fileDimentions = files.map((file) => {
                let dimentions = sizeOf(file);
                dimentions.fileName = file;
                return dimentions;
            })

            const slicedFileDimentions = sliceByNumber(fileDimentions, 2);
            const imgValues = slicedFileDimentions.map((item) => {

                let imgPath = "";
                let webpPath = "";

                if (item[0].type === 'webp') {
                    webpPath = item[0].fileName;
                } else {
                    imgPath = item[0].fileName;
                }

                const isExistAlternateExt = item[1] || null;
                if (isExistAlternateExt) {
                    if (item[1].type === 'webp') {
                        webpPath = item[1].fileName;
                    } else {
                        imgPath = "";
                    }
                }

                const width = item[0].width;
                const height = item[0].height;

                // コンパイル後の形式にパス変換
                const replacedImgPath = imgPath.replace('./src/', '/');
                const replacedWebpPath = webpPath.replace('./src/', '/');

                return {
                    replacedImgPath, replacedWebpPath, width, height
                };
            })

            const resultSource = imgValues.map((item) => {
                return generateSnippets(item, fileType);
            })

            const outPutDir = (type) => {
                const OUTPUT_DIR = 'dist';
                fs.mkdir(OUTPUT_DIR, { recursive: true }, (err) => {
                    if (err) { throw err; }
                });

                let fileExt;

                if (type === 'html') {
                    fileExt = ".html";
                } else if (type === 'pug') {
                    fileExt = ".pug";
                }

                return `./${OUTPUT_DIR}/snippets${fileExt}`;
            }

            const snippets = resultSource.join('');
            fs.writeFile(outPutDir(fileType), snippets, function (err) {
                if (err) {
                    console.error('エラーが発生しました。スニペットを生成できませんでした。');
                    throw err;
                } else {
                    console.log(`\n${fileType}：スニペットが生成されました`);
                }
            });
        }
    });
}

const generateWebpAndSnippets = (targetFiles, inputFileType) => {
    imagemin([targetFiles], {
        use: [imageminWebp({ quality: 50 })],
    }).then(() => {
        generateSnippetsHandler(inputFileType);
    });
};

const inputFileType = process.argv[2];
if (inputFileType === 'html' || inputFileType === 'pug') {
    generateWebpAndSnippets(WEBP_OUT_DIR, inputFileType);
} else {
    console.log("'html' または 'pug' のいずれかを入力してください。");
}

