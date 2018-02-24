import React, { Component } from 'react';

import '@material/elevation/dist/mdc.elevation.min.css';
import '@material/list/dist/mdc.list.min.css';
import '@material/theme/dist/mdc.theme.min.css';

import './TrnResult.css';
// import networkIcon from './network.svg';

const BonBar = (props) => (
  <div className="bon-bar-background mdc-theme--secondary-bg">
    <div 
      className="bon-bar mdc-theme--primary-bg" 
      style={{inlineSize: props.bon * 100 + '%'}}
    />
  </div>
)

class BackTrn extends Component {
  render() {
    let maxBon = (this.props.translations.length) ? this.props.translations[0].trans_quality : 1;
    return (
      <ul className="mdc-list mdc-list--dense">
      {this.props.translations.map( (trn, index) => (
        <li key={index} className="mdc-list-item mdc-ripple-surface back-trn-item">
          <div className="bon-bar-cell-dense">
            <BonBar bon={trn.trans_quality / maxBon}/>
          </div>
          <span tabIndex="0">{trn.txt}</span>
        </li>
      ))}
      </ul>
    )
  }
}

export default class TrnResult extends Component {
  openGraph = event => {this.props.onExprClick(event.target.dataset.index)}
  
  render() {
    let maxBon = (this.props.translations.length) ? this.props.translations[0].trans_quality : 1;
    return (
      <ul className="mdc-list">  
        {this.props.translations.map( (trn, index) => {
          return (
            <details key={index} onToggle={() => this.props.onTrnToggle(index)}>
              <summary className="trn-summary">
                <li className="mdc-list-item mdc-ripple-surface" key={index}>
                  <button
                    className="graph-button mdc-elevation--z3"
                    // className="mdc-button mdc-button--raised"
                    onClick={this.openGraph}
                    alt={this.props.graphButtonAlt}
                    data-index={index}
                  >
                    <i className="material-icons" data-index={index}>
                      more_vert
                    </i>
                  </button>
                  <div className="bon-bar-cell">
                    <BonBar bon={trn.trans_quality / maxBon}/>
                  </div>
                  <span lang={this.props.tagAl} tabIndex="0">{trn.txt}</span>
                </li>
              </summary>
              {trn.backTranslations && 
                <div className="back-trn-container">
                  <BackTrn lang={this.props.tagDe} translations={trn.backTranslations}/>
                  <li className="mdc-list-divider" role="separator"/>
                </div>
              }
            </details>
        )})}
      </ul>
    )
  }
}