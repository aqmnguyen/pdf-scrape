const puppeteer  = require('puppeteer');
const moment     = require('moment');
const pdfMake    = require('pdfmake');
const PdfPrinter = require('pdfmake/src/printer');
const fs         = require('fs');
var path 				 = require('path');

const payload = {
  data : [
    {
      params : '?mi_display=test&mi_lat=33.4499672&mi_lon=-112.0724112&mi_eaddr=0&mi_update=0816&mi_h_cluster=3&mi_f_cluster=1',
      src    : 'http://www.movable-ink-7158.com/p/rp/81e206d9e3b253f8.png',
      name   : 'Hot banner'
    },
    {
      params : '?mi_display=test&mi_lat=42.3601&mi_lon=-71.0589&mi_eaddr=0&mi_update=0816&mi_h_cluster=3&mi_f_cluster=1',
      src    : 'http://www.movable-ink-7158.com/p/rp/81e206d9e3b253f8.png',
      name   : 'Another banner'
    },
  ]
};


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

	    docDefinition.content.push(
	      {
	        text : `Name: `,
	        style: 'header',
	      },
	      '\n',
	      {
	        text : `${img.name}`,
	        style: 'normal',
	      },
	      '\n',
	      '\n',
	      {
	        text : `Params: `,
	        style: 'header',
	      },
	      '\n',
	      {
	        text : `${img.params}`,
	        style: 'normal',
	      },
	      '\n',
	      {
	        image     : `./${img.path}`,
	        pageBreak : 'after',
	        fit       : [510, 510],
	      },
	    )
	  });

	  console.log(docDefinition);

	  const pdfPath = `./pdf/proof-${moment().format('MM-DD-YYYY_HHmmss')}.pdf`;
	  const pdfDoc = printer.createPdfKitDocument(docDefinition);
	  pdfDoc.pipe(fs.createWriteStream(pdfPath));
	  pdfDoc.end(); 

	  this.deletePNG(filePaths);

	  return pdfPath;

	},

	deletePNG(filePaths){
		filePaths.forEach((img) => { fs.unlink(img.path, ()=>{}); })
	}

}

async function takeScreenShot(img, path){
		try{

	    const browser = await puppeteer.launch({headless : true});
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