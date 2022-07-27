// TODO: use a proper react child component at some point.. cuz this is kind of wack

class FormHandler {
  constructor(context_passthru) {
    // todo: once refactor works use default form state for init
    // this.context_passthru.state = state;
    // bind parent context to this
    // this.clearForm = this.clearForm.bind(context_passthru);
    // this.handleFormChange = this.handleFormChange.bind(context_passthru);
    // this.submitForm = this.submitForm.bind(context_passthru);
    // this.downloadJsonAsCsv = this.downloadJsonAsCsv.bind(context_passthru);
    // this.renderForm = this.renderForm.bind(context_passthru);
    // this.jsonListToTable = this.jsonListToTable.bind(context_passthru);

    // ugh i really dont wanna do it this way
    this.context_passthru = context_passthru;
    const pageConfig = context_passthru.state.pageConfig;


    this.context_passthru.state = {
      pageConfig,
      formData: {...pageConfig.defaultFormData},
      isLoading: false,
      result: ''
    };
  }



  handleFormChange = e => {
    console.log(`changing state for ${e.target.name} to ${e.target.value} from ${this.context_passthru.state.formData[e.target.name]}`);
    // console.log(e);
    const target = e.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    this.context_passthru.setState(prevState => ({
      formData: { ...prevState.formData, [name]: value }
    }));
  }

  clearForm = e => {
    e.preventDefault();
    this.context_passthru.setState(prevState => ({
      formData: this.context_passthru.state.pageConfig.defaultFormData,
      result: ''
    }));
  };

  /**
   * Submit data to API
   * TODO if maintaining: dont use callbacks if possible
   */
  submitForm = e => {
    this.context_passthru.setState({ isLoading: true });
    const formData = this.context_passthru.state.formData;
    // Map state values to API specs
    const requestBody = this.context_passthru.state.pageConfig.apiFormReqMap(formData);

    console.log('[DEBUG] request body:');
    console.log(requestBody);

    fetch(this.context_passthru.state.pageConfig.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })
      .then(res => {
        this.context_passthru.setState({ isLoading: false });
        console.log(res);
        console.log('test');
        if (res.status >= 300) {
          this.context_passthru.setState({ result: `${res.status >= 500 ? 'Server ' : ''}Error ${res.status}: ${res.statusText}` });
        } else {
          res.text().then(text => {
            // if string is array, parse it
            if (text.startsWith('[')) {
              text = JSON.parse(text);
            }
            this.context_passthru.setState({ result: text });
          });
        }
      })
      .catch(e => {
        console.log(e);
        this.context_passthru.setState({ result: e });
      });
    e.preventDefault();
  };

  /**
   * Download JSON as CSV
   * TODO: Handle nested objects
   */
  downloadJsonAsCsv = () => {
    const data = this.context_passthru.state.result;
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
  renderForm = (formMetadata = this.context_passthru.state.pageConfig.formMetadata) => {
    console.log('renderForm state');
    console.log(' state passthrough');
    console.log(this);
    return formMetadata.map(field => (
      <div className="form-group" key={field.name} style={{ visibility: field.visibility || 'visible' }}>
        <label>{field.label} &nbsp;</label>
        {field.type === 'text' ?
          <input
            name={field.name}
            type="text"
            className="form-control"
            value={this.context_passthru.state.formData[field.name]}
            onChange={this.handleFormChange}
          /> : null
        }
        {field.type === 'dropdown' ?
          <select
            name={field.name}
            className="form-control"
            value={this.context_passthru.state.formData[field.name]}
            onChange={this.handleFormChange}
          >
            {field.options.map(option => <option key={option}>{option}</option>)}
          </select> : null
        }
      </div>
    ));
  }

  // _xmlToTable = (xmlStr) => {
  //   if (!xmlStr || !xmlStr.length) return '';
  //   console.log('[DEBUG] xmlToTable');
  //   console.log(xmlStr);

  //   const parser = new DOMParser();
  //   const xml = parser.parseFromString(xmlStr, "text/xml");
  //   // Convert to HTML table
  //   // const table = document.createElement('table');
  //   // table.className = 'table table-striped';
  //   // table.innerHTML = `<thead><tr>${xml.getElementsByTagName('column').map(col => `<th>${col.innerHTML}</th>`).join('')}</tr></thead>`;
  //   // table.innerHTML += `<tbody>
  //   // ${xml.getElementsByTagName('row').map(row => `<tr>${row.innerHTML.split('<column>').map(col => `<td>${col}</td>`).join('')}</tr>`).join('')}
  //   // </tbody>`;
  //   // TODO: Do not make this specific to AIMS WIP
  //   const xmlNodesAsList = xml.getElementsByTagName('TableName');
  //   // Get values from Node list
  //   const tableName = xmlNodesAsList[0].innerHTML;

  //   const xmlNodesAsList2 = xml.getElementsByTagName('Columns');
  //   // Get values from Node list
  //   const columns = xmlNodesAsList2[0].innerHTML.split('<Column>').map(col => col.split('</Column>')[0]);
  //   console.log('[DEBUG] columns');

  //   for (i = 0; i < x.length; i++) {
  //     txt += x[i].childNodes[0].nodeValue;
  //   }
  //   document.getElementById("demo").innerHTML = txt; 
  //   return (
  //     <table>
  //       <thead>
  //         <tr>
  //           {xmlNodesAsList.map(col => <th>${col.innerHTML}</th>)}
  //         </tr>
  //       </thead>
  //       <tbody>
  //         {xml.getElementsByTagName('row').map(row => <tr key={row.id}>
  //           {row.innerHTML.split('<column>').map(col => <td>{col}</td>)}
  //         </tr>)}
  //       </tbody>
  //     </table>
  //   );

  //   // const items = xmlStr.find('NewDataSet');
  //   // console.log('== [DEBUG] items ==');
  //   // console.log(items);
  // }
    
  xmlToTable = (xmlStr) => {
    console.log(xmlStr);
    function convertXmlToJson(xmlString) {
      const jsonData = {};
      for (const result of xmlString.matchAll(/(?:<(\w*)(?:\s[^>]*)*>)((?:(?!<\1).)*)(?:<\/\1>)|<(\w*)(?:\s*)*\/>/gm)) {
        const key = result[1] || result[3];
        const value = result[2] && convertXmlToJson(result[2]); //recusrion
        jsonData[key] = ((value && Object.keys(value).length) ? value : result[2]) || null;
      }
      return jsonData;
    }
    const res = convertXmlToJson(xmlStr);
    console.log('=======================================================');
    console.log(res)
    const jsonTable = this.jsonListToTable([res]);
    console.log(jsonTable);
    return jsonTable;
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
    // const getCellValue = this.context_passthru.state.formData.isFlatFile === 'no' ?
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