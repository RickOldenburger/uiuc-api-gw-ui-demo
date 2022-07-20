// Keep secrets here
const config = require('./config.json');

// Validation
const RequiredConfigSchemaKeys = ['url', 'name', 'description', 'apiUrl', 'formMetadata', 'apiFormReqMap'];
// Form schema validation is a bit extra but I have that json schema format saved outside this repo
// const RequiredFormKeys = ['name', 'label', 'type'];
const ValidateSchema = (obj, requiredKeys) => {
  const keys = Object.keys(obj);
  const missingKeys = requiredKeys.filter(key => !keys.includes(key));
  if (missingKeys.length > 0) {
    throw new Error(`Missing keys in formMetadata: ${missingKeys.join(', ')}`);
  }
}

// Details about pages and forms
const pageConfigs = {
  archibus: {
    url: 'archibus',
    displayName: 'Archibus',
    description: 'Archibus',
    apiUrl: config.azure_api_url,
    formMetadata: [
      { name: 'buildingId', label: 'Building ID', type: 'text' },
      { name: 'buildingName', label: 'Building Name', type: 'text' },
      { name: 'bannerName', label: 'Banner Name', type: 'text' },
      { name: 'floorId', label: 'Floor ID', type: 'text' },
      { name: 'floorName', label: 'Floor Name', type: 'text' },
      { name: 'fileType', label: 'File Type', type: 'dropdown', options: ['json', 'pdf', 'csv'], default: 'json' },
      { name: 'isFlatFile', label: 'Flat File?', type: 'dropdown', visibility: 'visible', options: ['yes', 'no'], default: 'yes' }
    ],
    apiFormReqMap: formData => ({
      building: {
        bl_id: formData.buildingId,
        name: {
          contains: formData.buildingName
        },
        banner_name_abrev: formData.bannerName
      },
      floor: {
        fl_id: formData.floorId,
        name: formData.floorName
      },
      flat_file: formData.isFlatFile,
      file_type: formData.fileType,
    })
  }
};

// Validate schema for each page
// Object.keys(pageConfigs).forEach(page => {
//   ValidateSchema(pageConfigs[page], RequiredConfigSchemaKeys);
// }

module.exports = {...pageConfigs};