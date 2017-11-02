import React, { Component } from 'react';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import RaisedButton from 'material-ui/RaisedButton';
import IconButton from 'material-ui/IconButton';
import TextField from 'material-ui/TextField';
import CircularProgress from 'material-ui/CircularProgress';
import SwapHoriz from 'material-ui/svg-icons/action/swap-horiz';
import SwapVert from 'material-ui/svg-icons/action/swap-vert';
import Close from 'material-ui/svg-icons/navigation/close';
import {Card, CardText, CardTitle} from 'material-ui/Card';
import Dialog from 'material-ui/Dialog';

import debounce from 'lodash/debounce';
import uniqBy from 'lodash/uniqBy';
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

const DEBUG = false;
const initialUids = ['uig-000', 'bre-000', 'oss-000', 'sme-000', 'mhr-000', 'san-000', 'quz-000', 'oci-000', 'nci-000'];
const initialInterfaceUid = "eng-000";
class App extends Component {
  constructor(props) {
    super(props);
    const muiTheme = getMuiTheme({
      palette: {
        primary1Color: "#C82521",
        primary2Color: "#DF4A34",
        primary3Color: "#700000",
        accent1Color: "#424242",
        accent2Color: "#6d6d6d",
        accent3Color: "#1b1b1b",
      }
    })
    let labelsToTranslate = ['PanLex', 'lng', 'tra', 'al', 'de', 'txt', 'mod', 'npo', 'don', 'plu', 'trn', 'viz']
    
    this.state = {
      compact: window.innerWidth <= compactWidth,
      muiTheme,
      lvCache: new Map(),
      loading: false,
      exprGraphLoading: false,
      direction: 'ltr',
      langsDe: [],
      langsAl: [],
      txt: DEBUG ? "house" : '',
      txtError: false,
      trnTxt: '',
      trnTrn: 0,
      interfaceLangDialogOpen: false,
      translations: [],
      pathExprs: [],
      exprGraphOpen: false,
      pathDirect: false,
      labels: labelsToTranslate.reduce((obj, v) => {obj[v] = v; return obj;}, {}),
    }
  }


  componentWillMount() {
    window.addEventListener('resize', () => this.setState({compact: window.innerWidth <= compactWidth}));
  }

  componentDidMount() {
    // this.cacheLvs();
    this.cacheLvs().then(
      () => this.getInitialLangs(initialUids)).then(
        () => {if (DEBUG) {
          this.translate().then(() => this.handleTrnExprClick(0))
        }
      });
  }

  componentWillUnmount() {
    window.removeEventListener('resize', () => this.setState({windowWidth: window.innerWidth}));
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.interfaceLangvar !== this.state.interfaceLangvar) {
      this.setLabels();
      let langs = this.state.langsDe.concat(this.state.langsAl);
      this.getOtherNames(langs.map(lang => lang.id));
    }
  }

  cacheLvs = () => (
    query('/langvar', {limit: 0})
      .then(r => {
        let lvCache = new Map();
        r.result.forEach(lv => {lvCache.set(lv.id, lv)});
        this.setState({lvCache});
      })
  )

  getInitialLangs = (initialUids) => {
    let initialUidsSet = new Set(initialUids);
    let langs = [];
    let interfaceLv;
    this.state.lvCache.forEach((lv, lvId) => {
      if (initialUidsSet.has(lv.uid)) {
        langs.push(lv);
      }
      if (lv.uid === initialInterfaceUid) {
        interfaceLv = lv;
      }
    })
    let langsDe = [interfaceLv].concat(shuffle(langs));
    let langsAl = shuffle(langs).concat([interfaceLv]);
    this.setState({langsDe, langsAl, interfaceLangvar: interfaceLv.id});
    this.getOtherNames(langsDe.map(lang => lang.id), interfaceLv.id)
  }

  setLabels = () => {
    getMultTranslations(Object.keys(this.state.labels), 'art-000', this.state.interfaceLangvar).then(
      result => {
        // let interfaceLangvar
        let labels = Object.keys(this.state.labels).reduce((obj, label) => {
          if (result[label][0]) {
            obj[label] = result[label][0].txt;
            // interfaceLangvar = result[label][0].langvar;
          }
          return(obj)
        }, {})
        this.setState({labels})
      }
        
    )
  }

  getLabel = (label) => (this.state.labels[label]) ? this.state.labels[label] : label;

  getOtherNames = (langvars) => {
    getMultTranslations(langvars.map(lv => this.state.lvCache.get(lv).uid), 'art-274', this.state.interfaceLangvar)
      .then(result => {
        let lvCache = this.state.lvCache;
        langvars.forEach(lv => {
          let lang = lvCache.get(lv);
          lang.otherNames = result[lang.uid].map(r => r.txt);
          lvCache.set(lv, lang);

        })
        this.setState(lvCache);
      })
  }

  validateTxt = debounce(() => {
    if (this.state.txt.trim() && this.state.langsDe.length) {
      query('/expr', {uid: this.state.langsDe[0].uid, txt: this.state.txt.trim()})
        .then((response) => {
          this.setState({txtError: !response.result.length})
        })
    }
    // if (this.state.txt.trim() && this.state.langUnknown) {
    //   query('/expr', {txt: this.state.txt.trim(), include: 'uid'})
    //     .then((response) => {
    //       let foundLangs = response.result.map(r => ({uid: r.uid, name: r.uid}));
    //       this.setState({foundLangs});
    //     })
    // }
  }, 200)

  translate = (event) => {
    try {
      event.preventDefault();
    } catch (e) {}
    this.setState({loading: true});
    if (this.state.txt.trim() && this.state.langsDe.length && this.state.langsAl.length) {
      return getTranslations(this.state.txt.trim(), this.state.langsDe[0].uid, this.state.langsAl[0].uid, this.state.trnTrn)
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
    this.setState({exprGraphLoading: true, exprGraphOpen: true});
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
          let exprObj = response.result.reduce((obj, e) => {obj[e.id] = {txt: e.txt, uid: e.uid, langvar: e.langvar}; return(obj)}, {});
          this.setState({pathExprs: path.map(e => exprObj[e]), pathDirect, exprGraphLoading: false});
        })
      })
    });
  }

  handlePathClose = () => {
    this.setState({exprGraphOpen: false})
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
              setInterfaceLangvar={langvar => {
                this.setState({ 
                  interfaceLangvar: langvar,
                });
              }}
              interfaceLangvar={this.state.interfaceLangvar}
              trnLabel={this.getLabel('trn')}
              trnTrnLabel={[this.getLabel('trn'), this.getLabel('trn')].join(' — ')}
              handleTrnTrn={() => this.setState({trnTrn: (this.state.trnTrn + 1) % 3})}
              trnTrn={this.state.trnTrn}
              debug={DEBUG}
            />
            <Dialog 
              open={this.state.exprGraphOpen}
              onRequestClose={this.handlePathClose}
              contentStyle={{maxWidth: "none", display: "flex", justifyContent: "center"}}
              actions={
                <IconButton onClick={this.handlePathClose}>
                  <Close/>
                </IconButton>
              }
            >
              {this.state.exprGraphLoading ? 
                <CircularProgress/> :
                <ExprGraph pathExprs={this.state.pathExprs} pathDirect={this.state.pathDirect} lvCache={this.state.lvCache}/>
              }
            </Dialog>
            <div className="trn">
              <div className="trn-box">
                <div className="uid-box">
                  <div className="uid-box-button">
                    <UidInput
                      onNewRequest={(item) => {
                        let selectedLang = this.state.lvCache.get(item.id);
                        this.setState({langsDe: uniqBy([selectedLang, ...this.state.langsDe], 'uid')}, () => {this.translate(); this.validateTxt()});
                      }}
                      label={[this.getLabel('lng'), this.getLabel('de')].join(' — ')}
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
                {/* <UidChips
                  langList={this.state.foundLangs}
                /> */}
              </div>
              <div className="trn-box">
                <div className="uid-box">
                  <div className="uid-box-button">
                    <UidInput
                      onNewRequest={(item) => {
                        let selectedLang = this.state.lvCache.get(item.id);
                        this.setState({langsAl: uniqBy([selectedLang, ...this.state.langsAl], 'uid')}, this.translate);
                      }}
                      label={[this.getLabel('lng'), this.getLabel('al')].join(' — ')}
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
                      translations={this.state.translations}
                      onExprClick={this.handleTrnExprClick}
                      graphButtonAlt={[this.getLabel('trn'), this.getLabel('viz')].join(' — ')}
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
