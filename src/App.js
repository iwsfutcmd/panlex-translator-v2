import React, { Component } from 'react';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import CircularProgress from 'material-ui/CircularProgress';
import SwapHoriz from 'material-ui/svg-icons/action/swap-horiz';
import SwapVert from 'material-ui/svg-icons/action/swap-vert';
import {Card, CardText, CardTitle} from 'material-ui/Card';
import Subheader from 'material-ui/Subheader';
import injectTapEventPlugin from 'react-tap-event-plugin';
import Dialog from 'material-ui/Dialog';

import debounce from 'lodash/debounce';
import uniqBy from 'lodash/uniqBy';
import uniq from 'lodash/uniq';
import shuffle from 'lodash/shuffle';
import countBy from 'lodash/countBy';
import orderBy from 'lodash/orderBy';

import './App.css';
import logo from './logo.svg';
import { query, getTranslations, getMultTranslations, getTransPath } from './api';
import UidChips from './UidChips';
import UidInput from './UidInput';
import PanLexAppBar from './PanLexAppBar';
import TrnResult from './TrnResult';
import ExprGraph from './ExprGraph';

const compactWidth = 840
injectTapEventPlugin();

const DEBUG = false;
const initialUids = ['uig-000', 'bre-000', 'oss-000', 'sme-000', 'mhr-000', 'san-000', 'quz-000', 'oci-000', 'nci-000']

const testPath = [
  {txt: 'dog', uid: 'eng-000'},
  {txt: 'chien', uid: 'fra-000'},
  {txt: 'perro', uid: 'spa-000'},
  {txt: 'hundur', uid: 'isl-000'},
  {txt: 'hund', uid: 'dan-000'},
  {txt: 'ancing', uid: 'ind-000'},
  {txt: 'كلب', uid: 'arb-000'},
  {txt: 'कुत्ता', uid: 'hin-000'},
  {txt: 'श्वन्', uid: 'san-000'},
];

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
    let labelsToTranslate = ['PanLex', 'lng', 'tra', 'al', 'de', 'txt', 'mod', 'npo', 'don', 'plu']
    
    this.state = {
      compact: window.innerWidth <= compactWidth,
      muiTheme,
      loading: false,
      direction: 'ltr',
      langsDe: [],
      langsAl: [],
      txt: '',
      txtError: false,
      trnTxt: '',
      interfaceLangDialogOpen: false,
      translations: [],
      pathExprs: DEBUG ? testPath : [],
      pathOpen: DEBUG ? true : false,
      pathDirect: DEBUG ? true: false,
      labels: labelsToTranslate.reduce((obj, v) => {obj[v] = v; return obj;}, {}),
    }
  }


  componentWillMount() {
    window.addEventListener('resize', () => this.setState({compact: window.innerWidth <= compactWidth}));
  }

  componentDidMount() {
    this.getInitialLangs(initialUids);
    this.setLabels('eng-000');
  }

  componentWillUnmount() {
    window.removeEventListener('resize', () => this.setState({windowWidth: window.innerWidth}));
  }

  getInitialLangs = (initialUids) => {
    query('/langvar', {uid: initialUids}).then(
      (response) => {
        let uidNames = response.result.reduce((obj, lang) => {obj[lang.uid] = lang.name_expr_txt; return(obj)}, {})
        let langs = initialUids.map(uid => ({uid, name: uidNames[uid]}));
        let langsDe = [{uid: 'eng-000', name: 'English'}].concat(shuffle(langs));
        let langsAl = shuffle(langs).concat([{uid: 'eng-000', name: 'English'}]);
        this.setState({langsDe, langsAl});
    })
  }

  setLabels = (uid) => {
    getMultTranslations(Object.keys(this.state.labels), 'art-000', uid).then(
      result => {
        let interfaceLangvar
        let labels = Object.keys(this.state.labels).reduce((obj, label) => {
          if (result[label][0]) {
            obj[label] = result[label][0].txt;
            interfaceLangvar = result[label][0].langvar;
          }
          return(obj)
        }, {})
        this.setState({labels, interfaceLangvar})
      }
        
    )
  }

  getLabel = (label) => (this.state.labels[label]) ? this.state.labels[label] : label;

  validateTxt = debounce(() => {
    if (this.state.txt.trim() && this.state.langsDe.length) {
      query('/expr', {uid: this.state.langsDe[0].uid, txt: this.state.txt.trim()})
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

  handleTrnExprClick = (trnExprNum) => {
    let trn = this.state.translations[trnExprNum]
    getTransPath(trn.trans_expr, trn.id).then(expr => {
      let path;
      if (expr) {
        let pathExprCount = Object.entries(countBy(expr.trans_path.map(p => p[0].expr2)));
        let sortedPathExprs = orderBy(pathExprCount, o => o[1], 'desc');
        let pathExprs = sortedPathExprs.slice(0, 20).map(p => p[0]);
        path = [expr.trans_expr, ...pathExprs, expr.id];
      } else {
        path = [trn.trans_expr, trn.id]
      }
      query('/expr', {trans_expr: path[0], id: path[path.length - 1]}).then(response => {
        let pathDirect = Boolean(response.result.length);
        query('/expr', {id: path, include: 'uid'}).then(response => {
          let exprObj = response.result.reduce((obj, e) => {obj[e.id] = {txt: e.txt, uid: e.uid}; return(obj)}, {});
          this.setState({pathExprs: path.map(e => exprObj[e]), pathOpen: true, pathDirect});
        })
      })
    });
  }

  handlePathClose = () => {
    this.setState({pathOpen: false})
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
              donLabel={this.getLabel('don')}
              switchDirection={() => this.setState({direction: (this.state.direction === 'rtl') ? 'ltr' : 'rtl'})}
              setInterfaceLang={(lang) => {
                this.setState({ 
                  interfaceLang: lang.uid,
                });
                this.setLabels(lang.uid);
              }}
              interfaceLangvar={this.state.interfaceLangvar}
            />
            <Dialog 
              open={this.state.pathOpen}
              onRequestClose={this.handlePathClose}
              contentStyle={{maxWidth: "none"}}
              // autoDetectWindowHeight={false}
            >
              {/* <div>beeeewp</div> */}
              <ExprGraph pathExprs={this.state.pathExprs} pathDirect={this.state.pathDirect}/>
            </Dialog>
            <div className="trn">
              <div className="trn-box">
                {/* <Subheader>
                  {[this.getLabel('lng'), this.getLabel('de')].join(' — ')}
                </Subheader> */}
                <div className="uid-box">
                  <div className="uid-box-button">
                    <UidInput
                      onNewRequest={(item) => {
                        let selectedLang = {uid: item.uid, name: item.text};
                        this.setState({langsDe: uniqBy([selectedLang, ...this.state.langsDe], 'uid')}, () => {this.translate(); this.validateTxt()});
                      }}
                      label={[this.getLabel('lng'), this.getLabel('plu')].join(' — ')}
                      interfaceLangvar={this.state.interfaceLangvar}
                      align="start"
                    />
                    <RaisedButton
                      icon={this.state.compact ? <SwapVert/> : <SwapHoriz/>}
                      style={{minWidth: 36}}
                      onClick={this.swapLng}
                    />
                  </div>
                  <UidChips
                    langList={this.state.langsDe}
                    onSelectLang={(langList) => this.setState({langsDe: langList}, () => {this.translate(); this.validateTxt()})}
                    // onSelectLang={(lang) => this.setState({langDe: lang}, () => {this.translate(); this.validateTxt()})}
                  />
                </div>
                <Card className="trn-card">
                  <CardText>
                    <form id="trn-txt">
                      <TextField
                        hintText={this.getLabel('txt')}
                        fullWidth={true}
                        onChange={(event, txt) => {
                          this.setState({txt}, this.validateTxt);
                        }}
                        value={this.state.txt}
                        errorText={this.state.txtError ? this.getLabel('npo') : ""}
                      />
                    </form>
                  </CardText>
                </Card>
              </div>
              <div className="trn-box">
                {/* <Subheader>
                  {[this.getLabel('lng'), this.getLabel('al')].join(' — ')}
                </Subheader> */}
                <div className="uid-box">
                  <div className="uid-box-button">
                    <UidInput
                      onNewRequest={(item) => {
                        let selectedLang = {uid: item.uid, name: item.text};
                        this.setState({langsAl: uniqBy([selectedLang, ...this.state.langsAl], 'uid')}, this.translate);
                      }}
                      label={[this.getLabel('lng'), this.getLabel('plu')].join(' — ')}
                      interfaceLangvar={this.state.interfaceLangvar}
                      align="start"
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
                  <UidChips
                    langList={this.state.langsAl}
                    onSelectLang={(langList) => this.setState({langsAl: langList}, this.translate)}
                    // onSelectLang={(lang) => this.setState({langAl: lang}, this.translate)}
                  />
                </div>
                <Card className="trn-card">
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
                      onExprClick={this.handleTrnExprClick}
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
