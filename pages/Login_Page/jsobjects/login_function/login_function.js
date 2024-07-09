export default {
	async init() {
    // Check if userId is already stored in the Appsmith store
    const storedUserId = appsmith.store.userId;
		const userToken = appsmith.store.userToken;
    if (storedUserId) {
			 try {
      // Make a POST request to refresh authentication using the token
      const response = await fetch("https://api.inventory.farmd.in/api/collections/users/auth-refresh", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: userToken,
        }
      });

      const data = await response.json();
			storeValue('userToken', data.token);
      console.log('Authentication refreshed:', data);
    } catch (error) {
      console.error('Failed to refresh authentication:', error);
      showAlert("Failed to refresh authentication. Please try again.");
    }
      navigateTo("Home");
    }
  },
  login() {
    // Fetch the username and password from the Appsmith store
		console.log(appsmith.store.userId);
    const username = appsmith.store.username;
    const password = appsmith.store.password;

    // Define the request body
    const requestBody = JSON.stringify({
      identity: username,
      password: password
    });

    // Make the POST request
    fetch("https://api.inventory.farmd.in/api/collections/users/auth-with-password", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: requestBody
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('HTTP Error: ' + response.status);
        }
        return response.json();
      })
      .then(data => {
        // Check if the authentication was successful
        if (data && data.record && data.record.id) {
					storeValue('userToken', data.token)
          storeValue('userId', data.record.id, true);
          navigateTo("Home");
        } else {
          showAlert("Authentication failed. Please check your username and password.");
        }
      })
      .catch(error => {
        console.error('Failed to authenticate:', error);
        showAlert("An error occurred. Please try again.");
      });
  }
};
