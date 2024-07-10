export default {
  async fetchItemsList() {
    const userToken = appsmith.store.userToken;
    const storedUserId = appsmith.store.userId;
    if (!storedUserId) {
      navigateTo("Login_Page");
      return;
    }

    const getDate = (daysAgo = 0) => {
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      return date.toISOString().split('T')[0];
    };

    const today = getDate(0); // Get today's date in YYYY-MM-DD format
    const yesterday = getDate(1); // Get yesterday's date in YYYY-MM-DD format
    const filterToday = `created >= "${today} 00:00:00"`;
    const filterYesterday = `created >= "${yesterday} 00:00:00" && created < "${today} 00:00:00"`;

    const fetchProductNames = async () => {
      if (storedUserId) {
        try {
          const response = await fetch('https://api.odoo.farmd.in//products');
          if (!response.ok) {
            throw new Error('Failed to fetch product names');
          }
          return await response.json();
        } catch (error) {
          console.error('Error fetching product names:', error);
          return {};
        }
      } else {
        return {};
      }
    };

    const createRecordsForYesterday = async (productNames, yesterdayProductIds) => {
      if (storedUserId) {
        try {
          const createPromises = yesterdayProductIds.map(async (type_id) => {
            const productName = productNames[type_id] || `Unknown Product (${type_id})`;
            const newData = {
              type_id: type_id,
              entered_price: null, // Placeholder for initial items
              retail_price: null, // Placeholder for retail prices
              price_updated: false,
              enabled: true,
              user: appsmith.store.userId,
            };

            console.log(`Creating record for product ${productName} with ID ${type_id} and data:`, newData);

            const createResponse = await fetch(`https://api.inventory.farmd.in/api/collections/items_price_tracker/records/`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: userToken,
              },
              body: JSON.stringify(newData)
            });

            if (!createResponse.ok) {
              throw new Error(`Failed to create record for product ${productName}`);
            }

            console.log(`Created record for product ${productName} with ID ${type_id}`);
            return createResponse.json(); // Return the response JSON directly
          });

          await Promise.all(createPromises);

          const todayProducts = await fetchProducts(productNames, filterToday);
          return todayProducts || {};
        } catch (error) {
          console.error("Failed to create products for yesterday:", error);
          return {};
        }
      } else {
        return {};
      }
    };

    const fetchProducts = async (productNames, filter) => {
      if (storedUserId) {
        try {
          const response = await fetch(`https://api.inventory.farmd.in/api/collections/items_price_tracker/records/?fields=type_id&filter=${filter}`, {
            method: 'GET',
          });
          if (!response.ok) {
            throw new Error("HTTP Error: " + response.status);
          }
          const data = await response.json();
          if (data.items.length === 0) {
            return null; // Indicate no products found
          }

          const productsObject = {};
          data.items.forEach(item => {
            const productName = productNames[item.type_id] || `Unknown Product (${item.type_id})`;
            // productsObject[productName] = Number(0);
						// console.log("type",typeof productsObject[productName] );
						// productsObject[productName] = 0;
						productsObject[productName] = 0; // Adjust as per your data structure
          });

          console.log("Fetched Products Object:", productsObject);
          return productsObject;
        } catch (error) {
          console.error("Failed to fetch products:", error);
          return null;
        }
      } else {
        return null;
      }
    };

    try {
      const productNames = await fetchProductNames();

      let productsToday = await fetchProducts(productNames, filterToday);
      if (productsToday) {
        return productsToday;
      } else {
        console.log("No products found for today, fetching products for yesterday...");
        const yesterdayProducts = await fetchProducts(productNames, filterYesterday);
        if (yesterdayProducts) {
          const yesterdayProductIds = Object.keys(yesterdayProducts).map(productName => {
            return Object.keys(productNames).find(id => productNames[id] === productName);
          }).filter(id => id !== undefined);

          console.log("Creating records for yesterday's products with IDs:", yesterdayProductIds);
          const createdRecords = await createRecordsForYesterday(productNames, yesterdayProductIds);
          return createdRecords;
        } else {
          return {};
        }
      }
    } catch (error) {
      console.error("An error occurred:", error);
      return {};
    }
  },
};
