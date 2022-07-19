import './App.css';
import React from 'react';
import FormHandler from './helpers/FormHandler';
const AllPageConfig = require('./pageConfig');

const GetPageConfig = pageName => AllPageConfig[pageName];
const PageList = Object.keys(AllPageConfig);



class App extends React.Component {
  constructor(props) {
    super(props);
    const defaultPage = 'archibus';
    const pageMetadata = GetPageConfig(defaultPage);
    this.state = {
      page: defaultPage,
      pageMetadata
    };
    this.formHandler = new FormHandler(this, pageMetadata);
  }

  handleFormChange = e => this.formHandler.handleFormChange(e);
  clearForm = e => this.formHandler.clearForm(e);
  submitForm = e => this.formHandler.submitForm(e);
  downloadJsonAsCsv = () => this.formHandler.downloadJsonAsCsv();
  renderForm = () => this.formHandler.renderForm();
  jsonListToTable = (jsonList) => this.formHandler.jsonListToTable(jsonList);
  DefaultFormState = () => this.formHandler.DefaultFormState();

  // On page change, update pageMetadata
  componentDidUpdate(prevProps, prevState) {
    if (prevState.page !== this.state.page) {
      this.setState({
        pageMetadata: GetPageConfig(this.state.page),
        page: this.state.page
      });
    }
  }

  render() {
    const rawResult = this.state.result;
    const resultHasJson = !!rawResult && typeof rawResult !== 'string';
    const isLoading = this.state.isLoading;
    const showResult = resultHasJson && !isLoading;
    
    const form = this.renderForm();

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
