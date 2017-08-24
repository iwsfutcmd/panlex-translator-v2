import React, { Component } from 'react';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import AppBar from 'material-ui/AppBar';
import CircularProgress from 'material-ui/CircularProgress';
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import SwapHoriz from 'material-ui/svg-icons/action/swap-horiz';
import MenuItem from 'material-ui/MenuItem';
import {Card, CardText, CardTitle} from 'material-ui/Card';
// import SvgIcon from 'material-ui/SvgIcon';
import injectTapEventPlugin from 'react-tap-event-plugin';

import './App.css';
import logo from './logo.svg';
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
    let labelsToTranslate = ['PanLex', 'lng', 'tra', 'al', 'de', 'txt', 'mod']
    
    this.state = {
      windowWidth: window.innerWidth,
      muiTheme,
      loading: false,
      direction: 'ltr',
      uidDe: '',
      uidAl: '',
      txt: '',
      trnTxt: '',
      interfaceLang: 'eng-000',
      translations: [],
      labels: labelsToTranslate.reduce((obj, v) => {obj[v] = v; return obj;}, {}),
    }
    this.setLabels();
  }

  componentWillMount() {
    window.addEventListener('resize', () => this.setState({windowWidth: window.innerWidth}));
  }
  
  componentWillUnmount() {
    window.removeEventListener('resize', () => this.setState({windowWidth: window.innerWidth}));
  }

  setLabels = () => {
    getTranslations(Object.keys(this.state.labels), 'art-000', this.state.interfaceLang)
    .then((result) => {
      let output = {};
      for (let txt of Object.keys(this.state.labels)) {
        try {
          output[txt] = result.filter(trn => (trn.trans_txt === txt))[0].txt;
        } catch (e) {
          output[txt] = txt;
        }
      };
      this.setState({labels: output, interfaceLangvar: result[0].langvar});
    });
  };

  getLabel = (label) => (this.state.labels[label]) ? this.state.labels[label] : label;

  translate = (event) => {
    try {
      event.preventDefault();
    } catch (e) {}
    this.setState({loading: true});
    getTranslations(this.state.txt.trim(), this.state.uidDe, this.state.uidAl)
    .then((result) => {
      let trnTxt = result.length ? result[0].txt : '';
      this.setState({trnTxt, translations: result, loading: false});
    })
  }

  swapLng = (event) => {
    let uidDeName = this.refs.uidDe.state.searchText;
    this.refs.uidDe.setState({searchText: this.refs.uidAl.state.searchText});
    this.refs.uidAl.setState({searchText: uidDeName});

    let uidDe = this.state.uidAl;
    let uidAl = this.state.uidDe;
    this.setState({uidDe, uidAl, txt: this.state.trnTxt}, this.translate);
  }

  render() {
    let originHorizontal = (this.state.direction === 'rtl') ? "left" : "right";
    this.state.muiTheme.isRtl = (this.state.direction === 'rtl');
    return (
      <div className="App" style={{direction: this.state.direction}}>
        <MuiThemeProvider muiTheme={this.state.muiTheme}>
          <div>
            <AppBar
              title={[this.getLabel('PanLex'), this.getLabel('tra')].join(' — ')}
              iconElementRight={
                <IconMenu 
                  iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
                  anchorOrigin={{horizontal: originHorizontal, vertical: 'top'}}
                  targetOrigin={{horizontal: originHorizontal, vertical: 'top'}}
                >
                  <MenuItem
                    primaryText="🔁"
                    onClick={() => this.setState({direction: (this.state.direction === 'rtl') ? 'ltr' : 'rtl'})}
                  />
                  {/* <MenuItem>
                    <UidInput
                      onNewRequest={(item) => {
                    this.setState({ interfaceLang: item.text });
                    this.setLabels();
                      }}
                      direction={this.state.direction}
                      label={[this.getLabel('lng'), this.getLabel('mod')].join(' — ')}
                      interfaceLangvar={this.state.interfaceLangvar}
                    />
                  </MenuItem> */}
                </IconMenu>
              }
              iconStyleRight={{margin: "8px -16px"}}
              // iconElementLeft={<img src={logo} className="App-logo" alt="logo" />}
              showMenuIconButton={false}
            />
            {DEBUG && 
              <UidInput
                onNewRequest={(item) => {
                  this.setState({ interfaceLang: item.text });
                  this.setLabels();
                }}
                direction={this.state.direction}
                label={[this.getLabel('lng'), this.getLabel('mod')].join(' — ')}
                interfaceLangvar={this.state.interfaceLangvar}
              />
            }
            {DEBUG && this.state.windowWidth}
            <div className="trn" style={{flexDirection: (this.state.windowWidth <= 840) ? 'column': 'row'}}>
              <div className="trn-box">
                <div className="uid-box">
                  <UidInput
                    ref="uidDe"
                    onNewRequest={(item) => this.setState({ uidDe: item.text })}
                    direction={this.state.direction}
                    label={[this.getLabel('lng'), this.getLabel('de')].join(' — ')}
                    interfaceLangvar={this.state.interfaceLangvar}
                    // style={{flex: 1}}
                  />
                  <RaisedButton
                    icon={<SwapHoriz/>}
                    style={{minWidth: 36}}
                    onClick={this.swapLng}
                  />
                </div>
                <Card>
                  <CardText>
                    <form id="trn-txt">
                      <TextField
                        // floatingLabelText={this.getLabel('txt')}
                        // floatingLabelStyle={{transformOrigin: (this.state.direction === 'rtl') ? "right top 0px" : "left top 0px"}}
                        hintText={this.getLabel('txt')}
                        fullWidth={true}
                        onChange={(event, txt) => this.setState({txt})}
                        value={this.state.txt}
                        // multiLine={true}
                      />
                    </form>
                  </CardText>
                </Card>
              </div>
              <div className="trn-box">
                <div className="uid-box">
                  <UidInput
                    ref="uidAl"
                    onNewRequest={(item) => this.setState({ uidAl: item.text })}
                    direction={this.state.direction}
                    label={[this.getLabel('lng'), this.getLabel('al')].join(' — ')}
                    interfaceLangvar={this.state.interfaceLangvar}
                    // style={{flex: 0}}
                  />
                  <RaisedButton
                    type="submit"
                    label={this.getLabel('tra')}
                    primary={true}
                    onClick={this.translate}
                    form="trn-txt"
                  />
                </div>
                {/* <TextField
                  fullWidth={true}
                  disabled={true}
                  // multiLine={true}
                /> */}
                <Card
                  // showExpandableButton={Boolean(this.state.translations && this.state.translations.length)}
                >
                  <CardTitle
                    className="trn-title"
                    title={this.state.trnTxt}
                    actAsExpander={true}
                    showExpandableButton={Boolean(this.state.trnTxt)}
                  >
                    {this.state.loading ? <CircularProgress/> : ''}
                  </CardTitle>
                  <CardText expandable={true}>
                    <TrnResult
                      muiTheme={this.state.muiTheme}
                      direction={this.state.direction}
                      translations={this.state.translations}
                    />
                  </CardText>
                </Card>
              </div>
            </div>
          </div>
        </MuiThemeProvider>
      </div>
    );
  }
}

export default App;
