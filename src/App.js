import React, { Component } from 'react';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
// import { Table, TableBody, TableRow, TableRowColumn } from 'material-ui/Table';
import CircularProgress from 'material-ui/CircularProgress';
import injectTapEventPlugin from 'react-tap-event-plugin';

import './App.css';
import { getTranslations } from './api';
import UidInput from './UidInput';
import TrnResult from './TrnResult';

const panlexRed = '#A60A0A';
injectTapEventPlugin();

const DEBUG = false;

class App extends Component {
  constructor(props) {
    super(props);
    const muiTheme = getMuiTheme({
      palette: {
        primary1Color: panlexRed,
      }
    })
    let labelsToTranslate = ['lng', 'tra', 'al', 'de', 'txt', 'mod']
    
    this.state = {
      muiTheme,
      loading: false,
      direction: 'ltr',
      uidDe: '',
      uidAl: '',
      txt: '',
      interfaceLang: 'eng-000',
      translations: [],
      labels: labelsToTranslate.reduce((obj, v) => {obj[v] = v; return obj;}, {}),
    }
    this.setLabels();
  }

  setLabels = () => {
    getTranslations(Object.keys(this.state.labels), 'art-000', this.state.interfaceLang)
    .then((result) => {
      let output = {};
      for (let txt of Object.keys(this.state.labels)) {
        output[txt] = result.filter(trn => (trn.trans_txt === txt))[0].txt
      };
      this.setState({labels: output, interfaceLangvar: result[0].langvar});
    });
  };

  getLabel = (label) => (this.state.labels[label]) ? this.state.labels[label] : label;

  translate = (event) => {
    // let savedFakeExprs = this.state.fakeExprs.filter((fakeExpr) => fakeExpr.saved)
    this.setState({loading: true})
    // query('/fake_expr', {'uid': this.state.uid, 'state_size': 11 - this.state.chaos, 'count': 25})
    getTranslations(this.state.txt, this.state.uidDe, this.state.uidAl)
    .then((result) => this.setState({translations: result, loading: false}));
  }

  render() {
    this.state.muiTheme.isRtl = (this.state.direction === 'rtl');
    return (
      <div className="App" style={{direction: this.state.direction}}>
        <MuiThemeProvider muiTheme={this.state.muiTheme}>
          <div>
            {DEBUG && [
              <RaisedButton
                label="🔁"
                onClick={() => this.setState({direction: (this.state.direction === 'rtl') ? 'ltr' : 'rtl'})}
              />,
              <UidInput
                onNewRequest={(item) => {
                  this.setState({ interfaceLang: item.text });
                  this.setLabels();
                }}
                direction={this.state.direction}
                label={[this.getLabel('lng'), this.getLabel('mod')].join(' — ')}
                interfaceLangvar={this.state.interfaceLangvar}
              />]
            }
            <div className="langvar-select">
              <UidInput
                onNewRequest={(item) => this.setState({ uidDe: item.text })}
                direction={this.state.direction}
                label={[this.getLabel('lng'), this.getLabel('de')].join(' — ')}
                interfaceLangvar={this.state.interfaceLangvar}
              />
              <UidInput
                onNewRequest={(item) => this.setState({ uidAl: item.text })}
                direction={this.state.direction}
                label={[this.getLabel('lng'), this.getLabel('al')].join(' — ')}
                interfaceLangvar={this.state.interfaceLangvar}
              />
            </div>
            <TextField
              floatingLabelText={this.getLabel('txt')}
              floatingLabelStyle={{transformOrigin: (this.state.direction === 'rtl') ? "right top 0px" : "left top 0px"}}
              fullWidth={true}
              onChange={(event, txt) => this.setState({txt})}
            />
            <RaisedButton
              label={this.getLabel('tra')}
              onClick={this.translate}
            />
            <div className="result">
              {(this.state.loading) ?
                <div><CircularProgress/></div> :
                <TrnResult
                  muiTheme={this.state.muiTheme}
                  direction={this.state.direction}
                  translations={this.state.translations}/>
              }
            </div>
          </div>
        </MuiThemeProvider>
      </div>
    );
  }
}

export default App;
