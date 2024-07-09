export default {
  logout() {
    // Check if userId exists in the Appsmith store
    if (appsmith.store.userId) {
      // Remove userId from the store
      removeValue("userId");
			removeValue("userToken");
    }
    // Navigate to the Login Page
    navigateTo("Login_Page");
  }
}
