const express 	= require('express');
const router 		= express.Router();
const pdfmaker 	= require('../config/pdfmaker');
const pdfMaker  = new pdfmaker();

// Sample payload
// const payload = [
//     {
//       params : '?mi_display=test&mi_lat=33.4499672&mi_lon=-112.0724112&mi_eaddr=0&mi_update=0816&mi_h_cluster=3&mi_f_cluster=1',
//       src    : 'http://www.movable-ink-7158.com/p/rp/81e206d9e3b253f8.png',
//       name   : 'Hot banner'
//     },
//     {
//       params : '?mi_display=test&mi_lat=42.3601&mi_lon=-71.0589&mi_eaddr=0&mi_update=0816&mi_h_cluster=3&mi_f_cluster=1',
//       src    : 'http://www.movable-ink-7158.com/p/rp/81e206d9e3b253f8.png',
//       name   : 'Another banner'
//     }
// ];

function requestPayLoad(body){

	const payload = [];

	const imagesPassed = (Object.keys(body).length) / 2;

	for (let i = 1; i <= imagesPassed; i++) {
		
		if(body[`image-${i}`]){
			
			const imgPath = body[`image-${i}`] || null;
			const src 		= imgPath.split('?')[0];
			const params 	= (imgPath.split('?')[1]) ? '?' + imgPath.split('?')[1] : '';
			const name 		= body[`name-${i}`] || null;

			if(imgPath){
				payload.push({
					src,
					params,
					name
				});
			}
		}

	};

	return payload;

}

router.post('/', function(req, res, next) {


	const payload = requestPayLoad(req.body);
	
	if(!payload.length){
		// handle error
	}

	const data = pdfMaker.init(payload);

	Promise.all(data.pdfPromise).then((screenshots) => {
			
		const object = pdfMaker.createPDF(data.filePaths);
		// console.log(object);

		const renderObject = {
			title 		: 'Re-direct',
			pdfPath		: object.pdfPath.replace('./public', ''),
			raw				: object.rawData,
			string		: object.dataString
		}

		res.render('generate', renderObject);

	}).catch((e) => {
		console.log(e);
	});

});

module.exports = router;
