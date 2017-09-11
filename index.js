const puppeteer  = require('puppeteer');
const moment     = require('moment');
const pdfMake    = require('pdfmake');
const PdfPrinter = require('pdfmake/src/printer');
const fs         = require('fs');


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


init(payload);

/**
 *
 * @param data
 */
function init({data}){

  let filePaths      = [];
  let numOfCompleted = 0;

  data.forEach(async (img) =>{
    const timeStamp  = moment().format('MM-DD-YYYY__h:mm:ssa');
    const path       = `${timeStamp}__${img.name.split(' ').join('-').toLowerCase()}.png`;
    const imgSrc     = `${img.src}${img.params}`;
    const screenshot = await takeScreenShot(imgSrc, path);
    filePaths.push({
      path   : path,
      name   : img.name,
      params : img.params,
    });
    numOfCompleted++;
    if(data.length === numOfCompleted){
      createPDF(filePaths);
    }
  });

}

/**
 *
 * @param filePaths
 */
function createPDF(filePaths){

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

  const pdfDoc = printer.createPdfKitDocument(docDefinition);
  pdfDoc.pipe(fs.createWriteStream(`proof-${moment().format('MM-DD-YYYY')}.pdf`));
  pdfDoc.end();

}


/***
 *
 * @param img
 * @param path
 * @returns {Promise.<*>}
 */
async function takeScreenShot(img, path){
  try{

    const browser = await puppeteer.launch({headless : true});
    const page    = await browser.newPage();
    await page.goto(img, {waitUntil : 'networkidle'});
    const imageBuffer = await page.screenshot({
      path : path,
      type : 'png'
    });
    // const pdfBuffer  = await page.pdf({
    //   path                : path,
    //   format              : 'A4',
    //   displayHeaderFooter : true,
    // });

    browser.close();

    return imageBuffer;

  } catch(error){
    console.log(error);
  }
}