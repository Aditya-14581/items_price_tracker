export default {
  async submitForm(updatedPrices) {
		const userToken = appsmith.store.userToken;
		const userId = appsmith.store.userId;
    const selectedStore = appsmith.store.storeName;
    console.log("Selected Store:", selectedStore);
    console.log("Updated Prices:", updatedPrices); // Log the incoming form data

    // Store the submitted data
    storeValue("submittedData", updatedPrices);

    const fetchProductNames = async () => {
      try {
        const response = await fetch('https://35.154.64.184/products');
        if (!response.ok) {
          throw new Error('Failed to fetch product names');
        }
        const data = await response.json();

        // Reverse the key-value pairs
        const reversedProductNames = {};
        Object.entries(data).forEach(([id, name]) => {
          reversedProductNames[name] = id;
        });

        console.log("Reversed Product Names:", reversedProductNames); // Log reversed product names
        return reversedProductNames;
      } catch (error) {
        console.error('Error fetching product names:', error);
        return {};
      }
    };

    // Update prices in PocketBase
    const updatePricesInPocketBase = async (productNames) => {
      const today = new Date().toISOString().split('T')[0];

      try {
        // Ensure productNames has been fetched and is valid
        if (!productNames || Object.keys(productNames).length === 0) {
          throw new Error('No product names fetched or empty productNames object.');
        }

        if (!selectedStore) {
          await showModal(PleaseEnterMandiName.name);
          return; // Exit function if no mandi_id is available
        }

        // Iterate through each productName in updatedPrices
        for (const productName of Object.keys(updatedPrices)) {
          const price = updatedPrices[productName];
          console.log("Updating price for:", productName, "with price:", price);

          // Check if productName exists in productNames mapping
          const productId = productNames[productName];
          if (!productId) {
            console.warn(`No ID found for product ${productName}. Skipping update.`);
            continue;
          }

          try {
            // Fetch records from PocketBase Items_Price_Tracking for today
            const response = await fetch(`https://api.inventory.farmd.in/api/collections/items_price_tracker/records/?filter=created >= "${today} 00:00:00"`);
            if (!response.ok) {
              throw new Error('Failed to fetch product records');
            }

            const data = await response.json();

            // Find the product entry by matching type_Id
            const productEntry = data.items.find(item => item.type_id.toString() === productId);
            console.log("Found product entry:", productEntry);

            if (productEntry) {
              // Prepare the updated data object
              let newData = {
                price_updated: false,
                entered_price: productEntry.entered_price || [],  // Initialize with existing initial_Item or empty array
                user: userId,
              };

              // Check if productEntry.user is an array or convert it to an array
              const existingUserArray = Array.isArray(productEntry.user) ? productEntry.user : Object.values(productEntry.user);

              // Ensure user IDs are unique
              const updatedUserArray = [...new Set([...existingUserArray, userId.toString()])];
              newData.user = updatedUserArray;

              console.log("data", newData);

              // Check if there's already an entry for the selected mandi_id
              let existingMandiIndex = newData.entered_price.findIndex(item => item.mandi_id === selectedStore);
              if (existingMandiIndex !== -1) {
                // Only update if the new price is not null
                if (price !== null) {
                  // Update existing entry
                  newData.entered_price[existingMandiIndex].price = price;
                  newData.price_updated = false;
                }
                newData.price_updated = false;
              } else {
                // Add new entry for the selected mandi_id
                newData.entered_price.push({
                  mandi_id: selectedStore,  // Assuming selectedStore has an id
                  price: price
                });
                newData.price_updated = false;
              }

              // Update the price for the found product entry
              const updateResponse = await fetch(`https://api.inventory.farmd.in/api/collections/items_price_tracker/records/${productEntry.id}`, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
									Authorization: userToken,
									// Authorization: 'rgergrtbrtbrt',
                },
                body: JSON.stringify(newData)
              });
							
							console.log("response", updateResponse);

              if (!updateResponse.ok) {
                throw new Error('Failed to update product price');
              }
              console.log(`Updated price for ${productName}`);
            } else {
              console.warn(`No record found for product ${productName} added today.`);
            }
          } catch (error) {
            console.error(`Error updating product price for ${productName}:`, error);
          }
        }
        showModal(FormDataReadOnly.name);
      } catch (error) {
        console.error("Error in updatePricesInPocketBase:", error);
      }
    };

    try {
      const productNames = await fetchProductNames();
      console.log("Product Names:", updatedPrices); // Log the fetched product names
      await updatePricesInPocketBase(productNames);
      console.log("Prices updated successfully");
    } catch (error) {
      console.error("An error occurred while updating prices:", error);
    }
  }
};
