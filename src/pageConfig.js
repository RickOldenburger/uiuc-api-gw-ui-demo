// Keep secrets here
const config = require('./config.json');

// Validation
const RequiredConfigSchemaKeys = ['url', 'displayName', 'description', 'apiUrl', 'formMetadata', 'apiFormReqMap'];
// Form schema validation is a bit extra but I have that json schema format saved outside this repo
// const RequiredFormKeys = ['name', 'label', 'type'];
const ValidateSchema = (obj, requiredKeys) => {
  const keys = Object.keys(obj);
  const missingKeys = requiredKeys.filter(key => !keys.includes(key));
  if (missingKeys.length > 0) {
    throw new Error(`Missing keys in formMetadata: ${missingKeys.join(', ')}`);
  }
}

const GetDefaultState = _this => {
  return _this.formMetadata.reduce((state, field) => ({
    ...state,
    [field.name]: field.default || '',
  }), {});
}

// Details about pages and forms
const pageConfigs = {
  archibus: {
    url: 'archibus',
    displayName: 'Archibus',
    description: 'Archibus',
    apiUrl: config.archibus_api_url,
    formMetadata: [
      { name: 'buildingId', label: 'Building ID', type: 'text', default: '0076' },
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
  },
  aim: {
    url: 'aim',
    displayName: 'AIM',
    description: 'AIM',
    apiUrl: config.aim_api_url,
    formMetadata: [
      { name: 'keyId', label: 'Key ID', type: 'text', default: '0001-' },
      { name: 'keyLink', label: 'Key Link', type: 'text', default: 'B' },
      { name: 'multiTenantId', label: 'Multi-Tenant ID', type: 'text', default: '1' },
      { name: 'exactKeyMatch', label: 'Exact Key Match?', type: 'dropdown', options: ['yes', 'no'], default: 'no' }
    ],
    apiFormReqMap: formData => {
      const hasExactKeyMatch = formData.exactKeyMatch === 'yes';
      return ({
        KEY_ID: [{
          FILTER: hasExactKeyMatch ? '=' : 'LIKE',
          VALUE: hasExactKeyMatch ? formData.keyId : `%${formData.keyId}%`
        }],
        KEY_LINK: formData.keyLink,
        MULTI_TENANT_ID: formData.multiTenantId
      })
    }
  }
};

Object.keys(pageConfigs).forEach(page => {
  const pageConfig = pageConfigs[page];
  ValidateSchema(pageConfig, RequiredConfigSchemaKeys);
  pageConfig.defaultFormData = GetDefaultState(pageConfig);
});

module.exports = {...pageConfigs};