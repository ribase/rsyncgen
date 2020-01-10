$(document).ready(function() {
   $('body').on('click', 'button.generate', function() {
      makeid(90, )
   })
})


function makeid(length, chars) {
   var result           = '';
   var characters = "";

   if(!chars) {
      characters       = ';:_ÖÄÜ*!"§$%&/()=?¡“¶¢[]|{}≠≠¿ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   }else {
      characters       = chars;
   }

   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }

   $('.result').html(result)
   return result;
}

console.log(makeid(90));