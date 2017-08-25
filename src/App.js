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
import SwapVert from 'material-ui/svg-icons/action/swap-vert';
import MenuItem from 'material-ui/MenuItem';
import {Card, CardText, CardTitle} from 'material-ui/Card';
import Dialog from 'material-ui/Dialog';

// import SvgIcon from 'material-ui/SvgIcon';
import injectTapEventPlugin from 'react-tap-event-plugin';

import './App.css';
import logo from './logo.svg';
import { getTranslations } from './api';
import UidInput from './UidInput';
import UidInputChipped from './UidInputChipped';
import TrnResult from './TrnResult';

const panlexRed = '#A60A0A';
const compactWidth = 840
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
      compact: window.innerWidth <= compactWidth,
      muiTheme,
      loading: false,
      direction: 'ltr',
      uidDe: '',
      langsDe: [],
      uidAl: '',
      langsAl: [],
      txt: '',
      trnTxt: '',
      // interfaceLang: 'eng-000',
      interfaceLangDialogOpen: false,
      translations: [],
      labels: labelsToTranslate.reduce((obj, v) => {obj[v] = v; return obj;}, {}),
    }
    // this.setLabels();
  }


  componentWillMount() {
    window.addEventListener('resize', () => this.setState({compact: window.innerWidth <= compactWidth}));
  }

  componentDidMount() {
    this.setLabels('eng-000');
  }

  componentWillUnmount() {
    window.removeEventListener('resize', () => this.setState({windowWidth: window.innerWidth}));
  }

  setLabels = (uid) => {
    getTranslations(Object.keys(this.state.labels), 'art-000', uid)
    .then((result) => {
      let output = {};
      for (let txt of Object.keys(this.state.labels)) {
        try {
          output[txt] = result.filter(trn => (trn.trans_txt === txt))[0].txt;
        } catch (e) {
          output[txt] = txt;
        }
      };
      this.setState({labels: output, interfaceLangvar: result.length ? result[0].langvar : 0});
    });
  };

  getLabel = (label) => (this.state.labels[label]) ? this.state.labels[label] : label;

  translate = (event) => {
    try {
      event.preventDefault();
    } catch (e) {}
    this.setState({loading: true});
    if (this.state.txt.trim() && this.state.langsDe.length && this.state.langsAl.length) {
      getTranslations(this.state.txt.trim(), this.state.langsDe[0].uid, this.state.langsAl[0].uid)
        .then((result) => {
          let trnTxt = result.length ? result[0].txt : '';
          this.setState({trnTxt, translations: result, loading: false});
        })
    } else {
      this.setState({loading: false});
    }
  }

  swapLng = (event) => {
    this.setState(prevState => ({
      langsDe: prevState.langsAl,
      langsAl: prevState.langsDe,
      txt: prevState.trnTxt}),
      this.translate);
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
                  <MenuItem
                    primaryText={[this.getLabel('lng'), this.getLabel('mod')].join(' — ')}
                    onClick={() => this.setState({interfaceLangDialogOpen: true})}
                  />
                </IconMenu>
              }
              iconStyleRight={{margin: "8px -16px"}}
              // iconElementLeft={<img src={logo} className="App-logo" alt="logo" />}
              showMenuIconButton={false}
            />
            <Dialog
              open={this.state.interfaceLangDialogOpen}
            >
              <UidInput
                onNewRequest={(item) => {
                  this.setState({ 
                      interfaceLang: item.uid,
                      interfaceLangDialogOpen: false,
                  });
                  this.setLabels(item.uid);
                }}
                direction={this.state.direction}
                label={[this.getLabel('lng'), this.getLabel('mod')].join(' — ')}
                interfaceLangvar={this.state.interfaceLangvar}
              />
            </Dialog>
            <div className="trn" style={{flexDirection: this.state.compact ? 'column': 'row'}}>
              <div className="trn-box">
                <div className="uid-box">
                  <UidInputChipped
                    langList={this.state.langsDe}
                    onSelectLang={(langList) => this.setState({langsDe: langList, uidDe: langList[0].uid})}
                    direction={this.state.direction}
                    label={[this.getLabel('lng'), this.getLabel('de')].join(' — ')}
                    interfaceLangvar={this.state.interfaceLangvar}
                  />
                  <RaisedButton
                    icon={this.state.compact ? <SwapVert/> : <SwapHoriz/>}
                    style={{minWidth: 36}}
                    onClick={this.swapLng}
                  />
                </div>
                <Card>
                  <CardText>
                    <form id="trn-txt">
                      <TextField
                        hintText={this.getLabel('txt')}
                        fullWidth={true}
                        onChange={(event, txt) => this.setState({txt})}
                        value={this.state.txt}
                      />
                    </form>
                  </CardText>
                </Card>
              </div>
              <div className="trn-box">
                <div className="uid-box">
                  <UidInputChipped
                    langList={this.state.langsAl}
                    onSelectLang={(langList) => this.setState({langsAl: langList, uidAl: langList[0].uid})}
                    direction={this.state.direction}
                    label={[this.getLabel('lng'), this.getLabel('al')].join(' — ')}
                    interfaceLangvar={this.state.interfaceLangvar}
                  />
                  <RaisedButton
                    style={{minWidth: 'unset'}}
                    type="submit"
                    label={this.getLabel('tra')}
                    primary={true}
                    onClick={this.translate}
                    form="trn-txt"
                  />
                </div>
                <Card>
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
