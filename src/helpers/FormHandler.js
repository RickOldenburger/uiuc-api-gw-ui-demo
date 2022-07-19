
class FormHandler {
  constructor(state, FormMetadata) {
    // todo: once refactor works use default form state for init
    this.state = state;
    this.FormMetadata = FormMetadata;
  }

  DefaultFormState = this.FormMetadata.reduce((state, field) => ({
    ...state,
    [field.name]: field.default || '',
  }), {});

  handleFormChange = e => {
    console.log(`changing state for ${e.target.name} to ${e.target.value} from ${this.state.formData[e.target.name]}`);
    // console.log(e);
    const target = e.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    this.setState(prevState => ({
      formData: { ...prevState.formData, [name]: value }
    }));
  }

  clearForm = e => {
    e.preventDefault();
    this.setState(prevState => ({
      formData: DefaultFormState,
      result: ''
    }));
  };

  /**
   * Submit data to API
   * TODO if maintaining: dont use callbacks if possible
   */
  submitForm = e => {
    this.setState({ isLoading: true });
    const formData = this.state.formData;
    // Map state values to API specs
    const requestBody = {
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
    };
    console.log('[DEBUG] request body:');
    console.log(requestBody);

    fetch(azureApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })
      .then(res => {
        this.setState({ isLoading: false });
        console.log(res);
        console.log('test');
        if (res.status >= 300) {
          this.setState({ result: `${res.status >= 500 ? 'Server ' : ''}Error ${res.status}: ${res.statusText}` });
        } else {
          res.text().then(text => {
            // if string is array, parse it
            if (text.startsWith('[')) {
              text = JSON.parse(text);
            }
            this.setState({ result: text });
          });
        }
      })
      .catch(e => {
        console.log(e);
        this.setState({ result: e });
      });
    e.preventDefault();
  };

  /**
   * Download JSON as CSV
   * TODO: Handle nested objects
   */
  downloadJsonAsCsv = () => {
    const data = this.state.result;
    const csv = data.map(item => {
      return Object.keys(item).map(key => {
        return item[key];
      }).join(',');
    }).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'data.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Dynamically render form based on FormMetadata
   * Metadata Structure:
   * name: string -- corresponds to name in state.formData
   * label: string
   * type: string  -- oneOf: text, dropdown, checkbox
   * visibility?: string -- oneOf: hidden, visible
   * options?: array
   * @param {array} formMetadata
   */
  renderForm = formMetadata => {
    return formMetadata.map(field => (
      <div className="form-group" key={field.name} style={{ visibility: field.visibility || 'visible' }}>
        <label>{field.label} &nbsp;</label>
        {field.type === 'text' ?
          <input
            name={field.name}
            type="text"
            className="form-control"
            value={this.state.formData[field.name]}
            onChange={this.handleFormChange}
          /> : null
        }
        {field.type === 'dropdown' ?
          <select
            name={field.name}
            className="form-control"
            value={this.state.formData[field.name]}
            onChange={this.handleFormChange}
          >
            {field.options.map(option => <option key={option}>{option}</option>)}
          </select> : null
        }
      </div>
    ));
  }

  jsonListToTable = jsonList => {
    if (!jsonList || !jsonList.length) return '';
    console.log('[DEBUG] jsonListToTable');
    console.log(jsonList);
    // Deal with nested arrays
    // Prevent recalculating & re-evaluating conditionals if not necessary
    // (such as having flat file setting)
    // If necessary in the future, remove the conditional to just flatten all
    // non-flat arrays (not good for performance)
    const getCellValue = value => {
      return !value ? '--' : Array.isArray(value) ? JSON.stringify(value) : value;
    }
    // const getCellValue = this.state.formData.isFlatFile === 'no' ?
    //   value => {
    //     return !value ? '--' : Array.isArray(value) ? JSON.stringify(value) : value;
    //   } :
    //   value => value
    return (
      <table>
        <thead>
          <tr>
            {Object.keys(jsonList[0]).map((key) => <th key={key}>{key}</th>)}
          </tr>
        </thead>
        <tbody>
          {jsonList.map((row) => <tr key={row.id}>
            {Object.keys(row).map(key => {
              return (
                <td key={key}>
                  {getCellValue(row[key])}
                </td>
              );
            }
            )}
          </tr>)}
        </tbody>
      </table>
    );
  }
}

export default FormHandler;
