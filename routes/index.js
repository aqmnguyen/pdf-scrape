const express 	= require('express');
const router 		= express.Router();
const pdfmaker 	= require('../config/pdfmaker');
const pdfMaker  = new pdfmaker();

router.get('/', function(req, res, next) {

	const renderObject = {
		title 		: 'PDF Creator'
	}

	res.render('index', renderObject);

});

module.exports = router;
