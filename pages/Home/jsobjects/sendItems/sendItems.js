export default {
	// copyItemsList () {
		  // const keys = Object.keys(JSONForm3.formData);
   		// const keysString = keys.join('\n'); // Join keys with new line for better readability
			// // console.log(keysString);
			// copyToClipboard(keysString);
	// },

 sendProductListToWhatsApp() {
    const keys = Object.keys(JSONForm3.formData);
    
    // Map through keys and extract text after the slash mark
    const modifiedKeys = keys.map(key => {
        const parts = key.split('/');
        return parts[1] || parts[0]; // In case there is no slash, return the original key
    });

    const productList = modifiedKeys.join('\n'); // Join keys with new line for better readability
    
    // Encode the message for the WhatsApp URL
    const message = encodeURIComponent(`सब्जियों की सूची:\n${productList}`);
    
    // Create the WhatsApp URL with just the pre-filled message
    const whatsappURL = `https://wa.me/?text=${message}`;
    
    // Use navigateTo to open the WhatsApp URL
    navigateTo(whatsappURL);
},

};