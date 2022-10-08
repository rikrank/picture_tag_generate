const fs = require('fs')
const glob = require("glob");
const sizeOf = require("image-size");

const ALLOW_EXTENSION = ".(jpeg|jpg|JPG|png|webp|bmp|gif)$";
const TARGET_PATTERN = "./**/*.{jpeg,jpg,JPG,webp,png,bmp,gif}";

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
}

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

                const isExistWebp = item[1] || null;

                const targetPatternDefault = ALLOW_EXTENSION.includes(item[0].type)
                const imgPath = targetPatternDefault ? item[0].fileName : ''; // 空だったら、fileNameは""

                let webpPath = "";

                if (isExistWebp) {
                    const targetPatternWebp = item[1].type === 'webp';
                    webpPath = targetPatternWebp ? item[1].fileName : ''; // 空だったら、fileNameは""
                } else {
                    console.log('webpファイルが存在しない画像ファイルがあります。\nファイルパスが空のsourceタグを生成します。');
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

const inputFileType = process.argv[2];

if (inputFileType === 'html' || inputFileType === 'pug') {
    generateSnippetsHandler(inputFileType);
} else {
    console.log("'html' または 'pug' のいずれかを入力してください。");
}
