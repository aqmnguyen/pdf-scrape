$(document).ready(function(){
		
	$('.add').click(function(){

		const currentAmount = $('.image-form .current-images').val();
		const newAmount = parseInt(currentAmount, 10) + 1; 
		console.log(currentAmount);
		console.log(newAmount);

		const html = [
			`<div class="break"></div>`,
			`<label>Image ${newAmount}:</label>`,
      `<input type="text" name="image-${newAmount}">`,
    	`<label>Name ${newAmount}:</label>`,
      `<input type="text" name="name-${newAmount}" class="border">`
		].join('');
		$('.image-form .inputs').append(html);
		$('.image-form .current-images').val(newAmount);

	});

});