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
      {this.props.translations.map( trn => (
        <li className="mdc-list-item back-trn-item">
          <div className="bon-bar-cell-dense">
            <BonBar bon={trn.trans_quality / maxBon}/>
          </div>
          {trn.txt}
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
            <details onToggle={() => this.props.onTrnToggle(index)}>
              <summary className="trn-summary">
                <li className="mdc-list-item" key={index}>
                  <div
                    className="graph-button material-icons mdc-elevation--z3"
                    onClick={this.openGraph}
                    alt={this.props.graphButtonAlt}
                    data-index={index}
                  >
                    more_vert
                  </div>
                  <div className="bon-bar-cell">
                    <BonBar bon={trn.trans_quality / maxBon}/>
                  </div>
                  {trn.txt}
                </li>
              </summary>
              {trn.backTranslations && [
                <BackTrn translations={trn.backTranslations}/>,
                <li className="mdc-list-divider" role="separator"/>
              ]}
            </details>
        )})}
      </ul>
    )
  }
}

// {trn.backTranslations && <TrnResult
//   translations={trn.backTranslations}
//   // onExprClick={this.handleTrnExprClick}
//   // onTrnToggle={this.backTranslate}
//   graphButtonAlt={this.graphButtonAlt}
// />}
