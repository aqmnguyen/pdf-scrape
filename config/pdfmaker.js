const puppeteer  = require('puppeteer');
const moment     = require('moment');
const pdfMake    = require('pdfmake');
const PdfPrinter = require('pdfmake/src/printer');
const fs         = require('fs');
const path 			 = require('path');

function pdfMaker(){}

pdfMaker.prototype = {
	
	init : function(data){
		
		let filePaths = [];

		let pdfPromise = data.map((img) => {

			const timeStamp  = moment().format('MM-DD-YYYY__h:mm:ssa');
			const path       = `png/${timeStamp}__${img.name.split(' ').join('-').toLowerCase()}.png`;
			const imgSrc     = `${img.src}${img.params}`;


			filePaths.push({
				path   : path,
				name   : img.name,
				params : img.params,
				imgSrc : imgSrc
			})

			return takeScreenShot(imgSrc, path);

		});

		return { pdfPromise, filePaths };

	},

	createPDF(filePaths){

		const fonts         = {
			Roboto : {
				normal      : 'fonts/Roboto-Regular.ttf',
				bold        : 'fonts/Roboto-Medium.ttf',
				italics     : 'fonts/Roboto-Italic.ttf',
				bolditalics : 'fonts/Roboto-MediumItalic.ttf'
			}
		};
		const printer       = new PdfPrinter(fonts);
		const docDefinition = {
			content : [],
			styles: {
				header: {
					fontSize: 16,
					bold: true
				},
				normal:{
					fontSize: 12,
				},
				bigger: {
					fontSize: 15,
					italics: true,
				}
			}
		};

		filePaths.forEach((img) =>{

			// console.log(img);

			docDefinition.content.push(
			{
				text : `Name: `,
				style: 'header'
			},
			'\n',
			{
				text : `${img.name}`,
				style: 'normal'
			},
			'\n',
			{
				text : `Full Image Path: `,
				style: 'header'
			},
			'\n',
			{
				text : `${img.imgSrc}`,
				style: 'normal'
			},
			'\n',
			{
				text : `Params: `,
				style: 'header'
			},
			'\n',
			{
				text : `${img.params}`,
				style: 'normal'
			},
			'\n',
			{
				image     : `./${img.path}`,
				pageBreak : 'after',
				fit       : [510, 510]
			}
			)
		});

	  // console.log(docDefinition);

	  const pdfPath = `./public/pdf/proof-${moment().format('MM-DD-YYYY_HHmmss')}.pdf`;
	  const pdfDoc = printer.createPdfKitDocument(docDefinition);
	  pdfDoc.pipe(fs.createWriteStream(pdfPath));
	  pdfDoc.end(); 

	  const file = fs.readFileSync(pdfPath);
  	this.deletePNG(filePaths);

  	const object = {
  		pdfPath,
  		dataString : file.toString('base64'),
  		rawData 	 : file
  	}
  	return object;

	},

	deletePNG(filePaths){
		filePaths.forEach((img) => { fs.unlink(img.path, ()=>{}); })
	}

}

async function takeScreenShot(img, path){
	try{

		// const browser = await puppeteer.launch({headless : true});
		const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
		const page    = await browser.newPage();
		await page.goto(img, {waitUntil : 'networkidle'});

		const imageBuffer = await page.screenshot({
			path : path,
			type : 'png'
		});

		browser.close();

		return imageBuffer;

	} catch(error){
		console.log(error);
	}
}

module.exports = pdfMaker;