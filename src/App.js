import './App.css';
import React from 'react';
import config from './config.json';
import FormHandler from './helpers/FormHandler';

const azureApiUrl = config.azure_api_url;

const FormMetadata = [
  { name: 'buildingId', label: 'Building ID', type: 'text' },
  { name: 'buildingName', label: 'Building Name', type: 'text' },
  { name: 'bannerName', label: 'Banner Name', type: 'text' },
  { name: 'floorId', label: 'Floor ID', type: 'text' },
  { name: 'floorName', label: 'Floor Name', type: 'text' },
  { name: 'fileType', label: 'File Type', type: 'dropdown', options: ['json', 'pdf', 'csv'], default: 'json' },
  { name: 'isFlatFile', label: 'Flat File?', type: 'dropdown', visibility: 'visible', options: ['yes', 'no'], default: 'yes' }
];

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      formData: {
        buildingId: '',
        buildingName: '',
        floorId: '',
        floorName: '',
        fileType: 'json',
        isFlatFile: 'yes',
      },
      result: '',
      isLoading: false
     };
     this.FormHandler = new FormHandler(this.state.formData, FormMetadata);
  }

  render() {
    const rawResult = this.state.result;
    const resultHasJson = !!rawResult && typeof rawResult !== 'string';
    const isLoading = this.state.isLoading;
    const showResult = resultHasJson && !isLoading;
    
    const form = this.renderForm(FormMetadata);

    // TODO: dont rerender table until form is submitted again
    const result = typeof this.state.result === 'string' ?
      <h2>{rawResult}</h2> :
      <h3>{this.jsonListToTable(this.state.result || [])}</h3>;

    return (
      <div className="App">
        <header className="App-header">
          <p>
            API Gateway Portal
          </p>
        </header>
        <body className='App-body'>
          <div className="disclaimer-header">
            <h4>
              This web application is developed as a proof-of-concept for the campus Business Initiative.   It is used to
              demonstrate the ability to access campus resources via a cloud based API using Microsoft's Azure API Gateway
              product.  Use of this application for any production purpose is not approved.  No guarantees of continual
              availability or fitness for any purpose other than demonstrating a concept are made.
            </h4>
          </div>
          <div>
            {form}
            <button onClick={this.submitForm}>Submit</button>
            <button className='pad-left' onClick={this.clearForm} disabled={isLoading}>Clear</button>
          </div>
          <div>
            <h1>
              {showResult ? `Results (${rawResult.length} Records)` : ''}
              {showResult ?
                <button className='download' onClick={this.downloadJsonAsCsv}>
                  Download as CSV
                </button>
                : ''
              }
            </h1>
            {isLoading ? <h2>Loading...</h2> : result}
          </div>
        </body>
      </div>
    );
}
}

export default App;
