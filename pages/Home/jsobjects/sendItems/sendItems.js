export default {
	// copyItemsList () {
		  // const keys = Object.keys(JSONForm3.formData);
   		// const keysString = keys.join('\n'); // Join keys with new line for better readability
			// // console.log(keysString);
			// copyToClipboard(keysString);
	// },

  sendProductListToWhatsApp() {
    const keys = Object.keys(JSONForm3.formData);
    const productList = keys.join('\n'); // Join keys with new line for better readability
    
    // Encode the message for the WhatsApp URL
    const message = encodeURIComponent(`Here is the product list:\n${productList}`);
    
    // Create the WhatsApp URL with just the pre-filled message
    const whatsappURL = `https://wa.me/?text=${message}`;
    
    // Use navigateTo to open the WhatsApp URL
    navigateTo(whatsappURL);
  },

};