import React, { Component } from 'react';

import './App.scss';

import '@material/card/dist/mdc.card.min.css';
import '@material/dialog/dist/mdc.dialog.min.css';
import { MDCDialog } from '@material/dialog/dist/mdc.dialog.min';
// import '@material/fab/dist/mdc.fab.min.css';
// import '@material/textfield/dist/mdc.textfield.min.css';
// import {MDCTextField} from '@material/textfield/dist/mdc.textfield.min';
// import '@material/typography/dist/mdc.typography.min.css';
// import '@material/toolbar/dist/mdc.toolbar.min.css';
// import '@material/ripple/dist/mdc.ripple.min.css';

import Button from '@material/react-button';
import Fab from '@material/react-fab';
import MaterialIcon from '@material/react-material-icon';

import debounce from 'lodash/debounce';
import shuffle from 'lodash/shuffle';
import countBy from 'lodash/countBy';
import orderBy from 'lodash/orderBy';

import { query, getTranslations, getMultTranslations, getTransPath, getAllTranslations, getNormTranslations } from './api';
import LvInfo from './LvInfo';
// import LvChips from './LvChips';
// import LvInput from './LvInput';
import PanLexAppBar from './PanLexAppBar';
import TrnResult from './TrnResult';
import ExprGraph from './ExprGraph';
import './material.css';
import LoadingIcon from './LoadingIcon';
import TrnDe from './TrnDe';


const compactWidth = 840

const DEBUG = true;

const ColorArray = ["red", "yellow", "blue", "green", "orange", "purple"];

// const initialUids = [
//   'uig-000', 'bre-000', 'oss-000', 'sme-000', 'mhr-000', 'san-000', 'quz-000', 'oci-000', 'nci-000'
// ];
const initialUids = [
  "eng-000", "fra-000", "ind-000", "por-000", "spa-000"
]
let u = new URLSearchParams(window.location.search);
const initialInterfaceUid = u.get("lang") || "eng-000";

class App extends Component {
  constructor(props) {
    super(props);
    this.txtInputList = [];
    window.addEventListener('resize', () => this.setState({ compact: window.innerWidth <= compactWidth }));
    let labelsToTranslate = [
      'PanLex', 'lng', 'tra', 'al', 'de', 'txt', 'mod', 'npo', 'don', 'plu',
      'trn', 'viz', 'nom', 'kar', 'loc', 'del', 'nno',
    ]

    this.state = {
      compact: window.innerWidth <= compactWidth,
      lvCache: new Map(),
      loading: false,
      exprGraphLoading: false,
      direction: 'ltr',
      langDe: {},
      langDeList: [],
      langAl: {},
      langs: [],
      txt: sessionStorage.getItem("txt") || "",
      txtList: ["dog", "chien", "anjing", "cão", "perro"],
      // txtList: [],
      txtError: false,
      trnTxt: '',
      trnTrn: 0,
      interfaceLangDialogOpen: false,
      interfaceLvTag: "",
      translations: [],
      pathExprs: [],
      exprGraphOpen: false,
      pathDirect: false,
      labels: labelsToTranslate.reduce((obj, v) => { obj[v] = v; return obj; }, {}),
      notFound: false,
      edges: [],
      nodesDe: [],
      nodesAl: [],
    }
  }

  getTransPath = getTransPath;

  componentDidMount() {
    this.cacheLvs().then(
      () => this.getInitialLangs(initialUids)).then(
        () => {
          if (this.state.txt) { this.translate() }
        });
    // TODO: fix for txtList
    this.exprGraphDialog = new MDCDialog(document.querySelector('#expr-graph-dialog'));
    // this.txtInputList = this.state.langDeList.map((_, id) => (
    //   new MDCTextField(document.querySelector('#txt-input-container-' + id))
    // ));
  }

  componentWillUnmount() {
    window.removeEventListener('resize', () => this.setState({ windowWidth: window.innerWidth }));
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.interfaceLangvar !== this.state.interfaceLangvar) {
      this.setLabels();
      this.getOtherNames();
      this.cacheKar();
      this.cacheLoc();
      // if (!this.fromLvCache(this.state.interfaceLangvar).IETFTags) {
      //   this.cacheIETFTags(this.state.interfaceLangvar);
      // }
      // let button = document.querySelector('.mdc-button');
      // let ripple = new mdc.ripple.MDCRipple(button);
      // ripple.layout();
      // mdc.ripple.MDCRipple.attachTo(document.querySelector('.mdc-button'));
    }
    if (prevState.langDe.id && (prevState.langDe.id !== this.state.langDe.id)) {
      localStorage.setItem("langDe", this.state.langDe.id);
      this.setState(
        { langs: [...new Set([prevState.langDe, ...prevState.langs])] },
        () => { this.translate(); this.validateTxt(); this.getOtherNames() }
      )
    }
    if (!prevState.langDeList.every((lang, i) => lang.id === this.state.langDeList[i].id)) {
      console.log("new langs");
      this.getOtherNames();
    }
    // TODO: adjust for langDeList

    if (prevState.langAl.id && (prevState.langAl.id !== this.state.langAl.id)) {
      localStorage.setItem("langAl", this.state.langAl.id);
      this.setState(
        { langs: [...new Set([prevState.langAl, ...prevState.langs])] },
        () => { this.translate(); this.getOtherNames() }
      )
    }
    if (prevState.txt !== this.state.txt) {
      this.validateTxt();
    }
    // TODO: adjust for txtList
    let langDeDiff = this.state.langDeList.length - prevState.langDeList.length;
    if (langDeDiff) {
      // this.txtInputList = this.state.langDeList.map((_, id) => (
      //   new MDCTextField(document.querySelector('#txt-input-container-' + id))
      // ));
      let txtList = langDeDiff > 0 ?
        [...this.state.txtList, ...Array(this.state.langDeList.length - this.state.txtList.length).fill("")] :
        this.state.txtList.slice(0, this.state.langDeList.length);
      this.setState({ txtList }, () => { this.getOtherNames(); });
    }
  }

  cacheLvs = () => (
    query('/langvar', {
      limit: 0, exclude: [
        'grp',
        'lang_code',
        'mutable',
        'name_expr',
        'name_expr_txt_degr',
        'var_code',
      ]
    }).then(
      r => {
        let lvCache = new Map();
        r.result.forEach(lv => { lvCache.set(lv.id, lv) });
        this.setState({ lvCache });
      })
  )

  cacheKar = () => (
    getAllTranslations('art-262', this.state.interfaceLangvar, true).then(
      karCache => {
        let lvCache = this.state.lvCache;
        lvCache.forEach(lv => {
          lv.scriptNames = karCache[lv.script_expr].map(r => r.txt);
        })
        this.setState({ lvCache });
      }
    )
  )

  cacheLoc = () => {
    let locExprs = [];
    this.state.lvCache.forEach(v => locExprs.push(v.region_expr));
    getMultTranslations(locExprs, '', this.state.interfaceLangvar).then(
      locCache => {
        let lvCache = this.state.lvCache;
        lvCache.forEach(lv => {
          lv.regionNames = locCache[lv.region_expr].map(r => r.txt);
        })
        this.setState({ lvCache });
      }
    )
  }

  cacheIETFTags = lvId => (
    lvId && getTranslations(this.fromLvCache(lvId).uid, "art-274", "art-420").then(
      result => {
        let lvCache = this.state.lvCache;
        let lv = lvCache.get(lvId);
        lv.IETFTags = result.sort((a, b) => a.txt.length - b.txt.length).map(t => t.txt);
        lvCache.set(lvId, lv);
        this.setState({ lvCache });
      }
    )
  )

  getTag = lvId => {
    let tags = this.fromLvCache(lvId).IETFTags;
    if (!tags) {
      this.cacheIETFTags(lvId);
    }
    return (tags && tags.length) ? tags[0] : "";
  }

  fromLvCache = lvId => (this.state.lvCache.get(lvId) || {})

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
    this.setState({
      // langDe: this.state.lvCache.get(Number(localStorage.getItem("langDe"))) || interfaceLv,
      langDeList: langs,
      // langDeList: [interfaceLv, interfaceLv], // TODO: more than 2
      langAl: this.state.lvCache.get(Number(localStorage.getItem("langAl"))) || shuffle(langs)[0],
      // langs: shuffle(langs),
      interfaceLangvar: interfaceLv.id
    });
    // this.getOtherNames(langs.map(lang => lang.id), interfaceLv.id)
  }

  setLabels = () => {
    getMultTranslations(Object.keys(this.state.labels), 'art-000', this.state.interfaceLangvar).then(
      result => {
        let labels = Object.keys(this.state.labels).reduce((obj, label) => {
          if (result[label][0]) {
            obj[label] = result[label][0].txt;
          } else {
            obj[label] = "";
          }
          return (obj)
        }, {})
        this.setState({ labels })
      }
    )
  }

  getLabel = (label) => (this.state.labels[label]) ? this.state.labels[label] : label;

  getOtherNames = () => {
    // let langs = [this.state.langDe, this.state.langAl, ...this.state.langs]
    let langs = [this.state.langAl, ...this.state.langDeList]
    getMultTranslations(langs.map(lv => lv.uid), 'art-274', this.state.interfaceLangvar)
      .then(result => {
        let lvCache = this.state.lvCache;
        langs.forEach(lv => {
          let lang = lvCache.get(lv.id);
          lang.otherNames = result[lang.uid].map(r => r.txt);
          lvCache.set(lv, lang);
        })
        this.setState(lvCache);
      })
  }

  validateTxt = debounce(() => {
    sessionStorage.setItem("txt", this.state.txt);
    if (this.state.txt.trim() && this.state.langDe.id) {
      query('/expr/count', { langvar: this.state.langDe.id, txt: this.state.txt.trim() })
        .then((response) => {
          this.setState({ txtError: !response.count });
          this.txtInput.valid = !!response.count;
        })
    } else {
      this.setState({ txtError: false });
      this.txtInput.valid = true;
    }
    // if (this.state.txt.trim() && this.state.langUnknown) {
    //   query('/expr', {txt: this.state.txt.trim(), include: 'uid'})
    //     .then((response) => {
    //       let foundLangs = response.result.map(r => ({uid: r.uid, name: r.uid}));
    //       this.setState({foundLangs});
    //     })
    // }
  }, 200)

  translate = event => {
    try {
      event.preventDefault();
    } catch (e) { }
    this.setState({ loading: true });
    if (this.state.txt.trim() && this.state.langDe.id && this.state.langAl.id) {
      return getTranslations(this.state.txt.trim(), this.state.langDe.id, this.state.langAl.id, this.state.trnTrn)
        .then((result) => {
          let trnTxt = result.length ? result[0].txt : '';
          this.setState({ trnTxt, translations: result, loading: false, notFound: !result.length });
        })
    } else {
      this.setState({ loading: false });
    }
  }

  translateMult = event => {
    try {
      event.preventDefault();
    } catch (e) { }
    this.setState({ loading: true });
    let txtList = this.state.txtList.map(txt => txt.trim());
    let langDeList = this.state.langDeList;
    let langAl = this.state.langAl;
    if (txtList.some(txt => txt) && langDeList.map(lang => lang.id).some(lang => lang) && langAl.id) {
      let trnResults = langDeList.map((langDe, i) => (
        txtList[i].trim() ?
          getNormTranslations(txtList[i].trim(), langDe.id, langAl.id) :
          Promise.resolve([])
      ));
      Promise.all(trnResults).then(trnResults => {
        let trnMap = new Map();
        trnResults.flat().forEach(trn => {
          let id = trn.id;
          if (trnMap.has(id)) {
            let oldTrn = trnMap.get(id);
            for (let prop in trn) {
              if (prop.startsWith("trans_") || prop === "high_score") {
                oldTrn[prop].push(trn[prop])
              } else if (prop === "norm_quality") {
                oldTrn[prop] += trn[prop]
              }
            }
            trnMap.set(id, oldTrn);
          } else {
            let newTrn = trn;
            for (let prop in trn) {
              if (prop.startsWith("trans_") || prop === "high_score") {
                newTrn[prop] = [trn[prop]];
              }
              // else if (prop === "norm_quality") {
              //   newTrn[prop] = trn[prop];
              // }
            }
            trnMap.set(id, newTrn);
          }
        });
        let translations = Array.from(trnMap.values()).sort((a, b) => (
          b.trans_langvar.length - a.trans_langvar.length || b.norm_quality - a.norm_quality
        ));
        this.setState({ translations, loading: false, notFound: !translations.length });
      });
    } else {
      this.setState({ loading: false });
    }
  }

  backTranslate = trnIndex => {
    let trn = this.state.translations[trnIndex];
    getTranslations(trn.txt, trn.langvar, trn.trans_langvar)
      .then(result => {
        let translations = this.state.translations;
        translations[trnIndex].backTranslations = result;
        this.setState({ translations });
      })
  }

  getDefinitions = trnIndex => {
    let trn = this.state.translations[trnIndex];
    query("/definition", { "expr_txt": trn.txt, "expr_langvar": trn.langvar, "langvar": trn.trans_langvar })
      .then(result => {
        let translations = this.state.translations;
        translations[trnIndex].definitions = result.result.map(d => d.txt);
        this.setState({ translations });
      })
  }

  swapLng = (event) => {
    this.setState(prevState => ({
      langDe: prevState.langAl,
      langAl: prevState.langDe,
      txt: prevState.trnTxt
    }),
      this.translate);
  }

  handleTrnExprClick = trnExprNum => {
    // WHILE DEBUGGING
    // this.setState({ exprGraphLoading: true });
    // this.exprGraphDialog.open();
    let trn = this.state.translations[trnExprNum]
    getTransPath(trn.trans_expr, trn.id).then((p) => {
      // let pathsDe = [];
      // let pathsAl = [];
      let edges = [];
      p.forEach((expr) => {
        if (expr) {
          let pathExprCount = Object.entries(countBy(expr.trans_path.map(p => p[0].expr2)));
          let sortedPathExprs = orderBy(pathExprCount, o => o[1], 'desc');
          let pathExprs = sortedPathExprs.slice(0, 10).map(p => parseInt(p[0]));
          // path = [expr[i].trans_expr, ...pathExprs, expr[i].id];
          pathExprs.forEach((pathExpr) => {
            edges.push([expr.trans_expr, pathExpr]);
            edges.push([pathExpr, expr.id]);
          })
          // pathsDe.push([expr.trans_expr, pathExprs]);
          // pathsAl.push([pathExprs, expr.id]);
        } else {
          // path = [trn.trans_expr, trn.id];
          // pathsDe.push([expr.trans_expr, []]);
          // pathsAl.push([[], expr.id]);
        };  
      })
      // WHILE DEBUGGING
      this.setState({nodesDe: trn.trans_expr, nodesAl: [trn.id], edges});
      // query('/expr', { trans_expr: path[0], id: path[path.length - 1] }).then(response => {
      //   let pathDirect = Boolean(response.result.length);
      //   query('/expr', { id: path, include: 'uid' }).then(response => {
      //     let exprObj = response.result.reduce((obj, e) => { obj[e.id] = { txt: e.txt, uid: e.uid, langvar: e.langvar }; return (obj) }, {});
      //     this.setState({ pathExprs: path.map(e => exprObj[e]), pathDirect, exprGraphLoading: false });
      //   })
      // })
    });
  }

  handlePathClose = () => {
    this.setState({ exprGraphOpen: false })
  }

  handleTouchLvChip = (event, lv) => {
    [].forEach.call(document.getElementsByClassName("droppable"), e => {
      e.classList.add("drop-highlight");
    });
    this.setState({ touchedLv: lv });
  }

  handleTouchLangDe = event => {
    console.log(event);
    [].forEach.call(document.getElementsByClassName("droppable"), e => {
      e.classList.remove("drop-highlight");
    });
    let langDe = this.state.lvCache.get(this.state.touchedLv);
    this.setState({ langDe, touchedLv: undefined });
  }

  handleTouchLangAl = event => {
    [].forEach.call(document.getElementsByClassName("droppable"), e => {
      e.classList.remove("drop-highlight");
    });
    let langAl = this.state.lvCache.get(this.state.touchedLv);
    this.setState({ langAl, touchedLv: undefined });
  }

  clearTxt = () => {
    this.setState({ txt: '' });
  }

  addLang = () => {
    this.setState({ langDeList: [...this.state.langDeList, {}] });
  }

  render() {
    let colorMap = new Map(this.state.langDeList.map((lang, i) => [lang.id, ColorArray[i % ColorArray.length]]));
    return (
      <div
        className="mdc-typography App"
        dir={this.state.direction}
        lang={this.getTag(this.state.interfaceLangvar)}
      >
        <div>
          <PanLexAppBar
            panlexLabel={this.getLabel('PanLex')}
            title={[this.getLabel('PanLex'), this.getLabel('tra')].join(' — ')}
            lngModLabel={[this.getLabel('lng'), this.getLabel('mod')].join(' — ')}
            donLabel={this.getLabel('don')}
            switchDirection={() => this.setState({ direction: (this.state.direction === 'rtl') ? 'ltr' : 'rtl' })}
            setInterfaceLangvar={langvar => {
              this.setState({
                interfaceLangvar: langvar,
              });
            }}
            interfaceLang={this.fromLvCache(this.state.interfaceLangvar)}
            trnLabel={this.getLabel('trn')}
            trnTrnLabel={[this.getLabel('trn'), this.getLabel('trn')].join(' — ')}
            handleTrnTrn={() => this.setState({ trnTrn: (this.state.trnTrn + 1) % 3 })}
            trnTrn={this.state.trnTrn}
            debug={DEBUG}
          >

            <main>
              <div className="trn">
                <div className="trn-box trn-de-container">
                  {this.state.langDeList.map((lang, id) => (
                    <TrnDe
                      key={id}
                      getLabel={this.getLabel}
                      interfaceLang={this.fromLvCache(this.state.interfaceLangvar)}
                      lv={this.state.langDeList[id]}
                      onLvPick={lv => {
                        let langDe = this.state.lvCache.get(lv);
                        let langDeList = this.state.langDeList;
                        langDeList[id] = langDe;
                        this.setState({ langDeList });
                      }}
                      lang={lang}
                      onTxtChange={event => {
                        let txtList = this.state.txtList;
                        txtList[id] = event.target.value;
                        this.setState({ txtList });
                      }}
                      txt={this.state.txtList[id]}
                      inputLangTag={this.getTag(lang.id)}
                      delTxt={() => {
                        let txtList = this.state.txtList;
                        txtList[id] = ''
                        this.setState({ txtList });
                      }}
                      colorMap={colorMap}
                    />
                  ))}
                  <Fab icon={<MaterialIcon icon="add" />} onClick={this.addLang} />
                </div>
                <div
                  className="trn-box"
                  onDrop={event => {
                    event.preventDefault();
                    let langAl = this.state.lvCache.get(parseInt(event.dataTransfer.getData("text"), 10));
                    if (langAl) { this.setState({ langAl }) }
                  }}
                  onDragOver={event => { event.preventDefault() }}
                >
                  <div className="uid-box">
                    <div className="uid-box-button">
                      <LvInfo
                        label={[this.getLabel('lng'), this.getLabel('al')].join(' — ')}
                        interfaceLangvar={this.state.interfaceLangvar}
                        onNewRequest={lv => {
                          let langAl = this.state.lvCache.get(lv);
                          this.setState({ langAl });
                        }}
                        lv={this.state.langAl}
                      />
                      <Button
                        onClick={this.translateMult}
                        type="submit"
                        raised={true}
                        // className="tra-button mdc-button mdc-button--raised"
                        form="trn-txt"
                      >
                        {this.getLabel('tra')}
                      </Button>
                    </div>
                    {/* <LvInfo 
                    nomLabel={this.getLabel('nom') + " — " + this.fromLvCache(this.state.interfaceLangvar).name_expr_txt + ":"}
                    karLabel={this.getLabel('kar') + ":"}
                    locLabel={this.getLabel('loc') + ":"}
                    lang={this.state.langAl}
                    onTouchStart={this.state.touchedLv && this.handleTouchLangAl}
                  /> */}
                  </div>
                  <div className="trn-card mdc-card">
                    <section className="card-title">
                      {this.state.notFound ?
                        <span className="mdc-typography--caption" id="nno-label">{this.getLabel('nno')}</span> :
                        <span lang={this.getTag(this.state.langAl.id)} id="first-trn-txt" tabIndex="0">
                          {this.state.translations.length ? this.state.translations[0].txt : ""}
                        </span>
                      }
                      {this.state.loading ? <LoadingIcon /> : ''}
                    </section>
                    <TrnResult
                      normalized={true}
                      translations={this.state.translations}
                      onExprClick={this.handleTrnExprClick}
                      onTrnToggle={this.backTranslate}
                      onDefClick={this.getDefinitions}
                      graphButtonAlt={[this.getLabel('trn'), this.getLabel('viz')].join(' — ')}
                      tagDe={this.getTag(this.state.langDe.id)}
                      // TODO: Fix for langDeList
                      tagAl={this.getTag(this.state.langAl.id)}
                      colorMap={colorMap}
                    />
                  </div>
                </div>
              </div>
            </main>
            <aside
              id="expr-graph-dialog"
              className="mdc-dialog"
              role="alertdialog">
              <div className="mdc-dialog__container">
                <div id="expr-graph-dialog-surface" className="mdc-dialog__surface">
                  <section className="mdc-dialog__body">
                    <button className="material-icons close-button mdc-dialog__footer__button--accept">close</button>
                    {this.state.exprGraphLoading ?
                      <LoadingIcon size={64} /> : <></>
                      // <ExprGraph pathExprs={this.state.pathExprs} pathDirect={this.state.pathDirect} lvCache={this.state.lvCache} />
                    }
                  </section>
                </div>

                {/* <div className="mdc-dialog__backdrop"></div> */}
              </div>
            </aside>
            <ExprGraph 
              edges={this.state.edges} 
              nodesDe={this.state.nodesDe}
              nodesAl={this.state.nodesAl} 
              lvCache={this.state.lvCache} 
            />
          </PanLexAppBar>
        </div>
      </div>
    );
  }
}

export default App;
