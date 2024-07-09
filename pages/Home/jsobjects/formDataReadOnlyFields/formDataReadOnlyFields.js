export default {
  generateReadOnlyFields: () => {
    const submittedData = appsmith.store.submittedData;
    const readOnlyFieldsArray = [];

    Object.keys(submittedData).forEach((key) => {
      readOnlyFieldsArray.push({ Name: key, Price: submittedData[key] });
    });

    console.log(readOnlyFieldsArray);

    return readOnlyFieldsArray;
  },
};
