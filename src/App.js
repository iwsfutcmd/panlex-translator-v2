import React, { Component } from 'react';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import CircularProgress from 'material-ui/CircularProgress';
import SwapHoriz from 'material-ui/svg-icons/action/swap-horiz';
import SwapVert from 'material-ui/svg-icons/action/swap-vert';
import {Card, CardText, CardTitle} from 'material-ui/Card';
import injectTapEventPlugin from 'react-tap-event-plugin';

import debounce from 'lodash/debounce';

import './App.css';
import logo from './logo.svg';
import { query, getTranslations } from './api';
import UidInputChipped from './UidInputChipped';
import PanLexAppBar from './PanLexAppBar';
import TrnResult from './TrnResult';

const compactWidth = 840
injectTapEventPlugin();

const DEBUG = false;

class App extends Component {

  constructor(props) {
    super(props);
    const muiTheme = getMuiTheme({
      palette: {
        primary1Color: "#A60A0A",
        primary2Color: "#DF4A34",
        primary3Color: "#700000",
        accent1Color: "#424242",
        accent2Color: "#6d6d6d",
        accent3Color: "#1b1b1b",
      }
    })
    let labelsToTranslate = ['PanLex', 'lng', 'tra', 'al', 'de', 'txt', 'mod', 'npo']
    
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
      txtError: false,
      trnTxt: '',
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

  validateTxt = debounce((txt) => {
    if (txt.trim() && this.state.langsDe.length) {
      query('/expr', {uid: this.state.langsDe[0].uid, txt: txt.trim()})
        .then((response) => {
          this.setState({txtError: !response.result.length})
        })
    }
  }, 200)

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
    this.state.muiTheme.isRtl = (this.state.direction === 'rtl');
    return (
      <div className="App" style={{direction: this.state.direction}}>
        <MuiThemeProvider muiTheme={this.state.muiTheme}>
          <div>
            <PanLexAppBar 
              direction={this.state.direction}
              title={[this.getLabel('PanLex'), this.getLabel('tra')].join(' — ')}
              lngModLabel={[this.getLabel('lng'), this.getLabel('mod')].join(' — ')}
              switchDirection={() => this.setState({direction: (this.state.direction === 'rtl') ? 'ltr' : 'rtl'})}
              setInterfaceLang={(lang) => {
                this.setState({ 
                  interfaceLang: lang.uid,
                });
                this.setLabels(lang.uid);
              }}
              interfaceLangvar={this.state.interfaceLangvar}
            />
            <div className="trn" style={{flexDirection: this.state.compact ? 'column': 'row'}}>
              <div className="trn-box">
                <div className="uid-box">
                  <UidInputChipped
                    langList={this.state.langsDe}
                    onSelectLang={(langList) => this.setState({langsDe: langList, uidDe: langList[0].uid})}
                    direction={this.state.direction}
                    label={[this.getLabel('lng'), this.getLabel('de')].join(' — ')}
                    interfaceLangvar={this.state.interfaceLangvar}
                    compact={this.state.compact}
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
                        onChange={(event, txt) => {
                          this.setState({txt});
                          this.validateTxt(txt);
                        }}
                        value={this.state.txt}
                        errorText={this.state.txtError ? this.getLabel('npo') : ""}
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
                    compact={this.state.compact}
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
