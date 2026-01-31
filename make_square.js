const { Jimp } = require('jimp');
const path = require('path');

async function makeSquare(inputPath) {
    try {
        const image = await Jimp.read(inputPath);
        const width = image.bitmap.width;
        const height = image.bitmap.height;

        const size = Math.max(width, height);
        const square = new Jimp({ width: size, height: size, color: 0x000000ff }); // Black background

        const x = Math.floor((size - width) / 2);
        const y = Math.floor((size - height) / 2);

        square.composite(image, x, y);

        const outputPath = path.join(__dirname, 'squared_icon.png');
        await square.write(outputPath);
        console.log('Squared image saved to:', outputPath);
        return outputPath;
    } catch (error) {
        console.error('Error squaring image:', error);
    }
}

const inputPath = process.argv[2];
if (!inputPath) {
    console.error('Please provide an input image path');
    process.exit(1);
}

makeSquare(inputPath);
