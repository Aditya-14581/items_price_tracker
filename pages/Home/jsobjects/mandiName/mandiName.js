export default {
  fetchMandiNames() {
    return fetch("https://api.odoo.farmd.in//warehouses")
      .then(response => {
        if (!response.ok) {
          throw new Error("HTTP Error: " + response.status);
        }
        return response.json();
      })
      .then(data => {
        // Transform the object to the desired format: Array<Object> with label and value
        const products = Object.entries(data).map(([key, value]) => ({
          label: value.name,
          value: value.id
        }));
        console.log(products);
        return products;
      })
      .catch(error => {
        console.error("Failed to fetch products:", error);
        return [];
      });
  }
};
