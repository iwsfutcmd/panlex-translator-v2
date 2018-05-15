import React, { Component } from 'react';

import '@material/dialog/dist/mdc.dialog.min.css';
import {MDCDialog} from '@material/dialog/dist/mdc.dialog.min';
import '@material/list/dist/mdc.list.min.css';
import '@material/menu/dist/mdc.menu.min.css';
import {MDCMenu} from '@material/menu/dist/mdc.menu.min';
import '@material/toolbar/dist/mdc.toolbar.min.css';

import logo from './logo.png';
// import trnIcon from './trn.svg';
// import trnTrnIcon from './trn-trn.svg';

import './PanLexAppBar.css';
import LvInput from './LvInput';

export default class PanLexAppBar extends Component{
  constructor(props) {
    super(props);
    this.state = {
      interfaceLangDialogOpen: false,
    }
  }
  
  componentDidMount() {
    this.interfaceLangDialog = new MDCDialog(document.querySelector('#interface-lang-dialog'));
    this.moreMenu = new MDCMenu(document.querySelector('#more-menu'));
  }

  render () {
    return (
      <div>
        <header className="mdc-toolbar mdc-toolbar--fixed">
          <div className="mdc-toolbar__row">
            <section className="mdc-toolbar__section mdc-toolbar__section--align-start">
              <a id="logo" href="https://panlex.org">
                <img src={logo} alt={this.props.panlexLabel} height={48} width={48}/>
              </a>
              <span id="title" className="mdc-toolbar__title">{this.props.title}</span>
            </section>
            <section className="toolbar-section mdc-toolbar__section mdc-toolbar__section--align-end">
              <a id="don-container" href="https://panlex.org/donate" className="mdc-toolbar__icon">
                <button className="don-button mdc-button mdc-theme--background">
                  {this.props.donLabel}
                </button>
              </a>            
              <a 
                id="menu-icon"
                className="material-icons mdc-toolbar__icon toggle"
                onClick={() => {this.moreMenu.open = !this.moreMenu.open}}
              >
                more_vert
              </a>
              <div className="mdc-menu-anchor">
                <div className="mdc-menu" id="more-menu">
                  <ul className="mdc-menu__items mdc-list" role="menu">
                    {this.props.debug &&
                      <li className="mdc-list-item" role="menuitem" onClick={this.props.switchDirection}>
                        <span className="material-icons">swap_horiz</span>
                      </li>
                    }
                    <li className="mdc-list-item" role="menuitem" onClick={() => this.interfaceLangDialog.show()}>
                      {this.props.lngModLabel}
                    </li>
                    <li className="mdc-list-item" role="menuitem" onClick={this.props.handleTrnTrn}>
                      {(() => {
                                switch(this.props.trnTrn) {
                                  case 1:
                                    return this.props.trnLabel;
                                  case 2:
                                    return this.props.trnTrnLabel;
                                  default:
                                    return "";
                                }
                              })()}                    
                    </li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
        </header>
        <aside
          id="interface-lang-dialog" 
          className="mdc-dialog" 
          role="alertdialog">
          <div id="interface-lang-dialog-surface" className="mdc-dialog__surface">
            <section className="mdc-dialog__body">
              <span className="material-icons close-button mdc-dialog__footer__button--accept">close</span>
              <LvInput
                label={this.props.lngModLabel}
                interfaceLangvar={this.state.interfaceLangvar}                        
                onNewRequest={lv => {
                  this.interfaceLangDialog.close();
                  this.props.setInterfaceLangvar(lv);
                }}
              />

            </section>
          </div>
          <div className="mdc-dialog__backdrop"></div>
        </aside>
      </div>
  )}
}