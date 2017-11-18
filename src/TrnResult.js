import React, { Component } from 'react';

import 'material-components-web/dist/material-components-web.css';

import './TrnResult.css';
import networkIcon from './network.svg';

export default class TrnResult extends Component {
  openGraph = event => {this.props.onExprClick(event.target.dataset.index)}
  
  render() {
    let maxBon = (this.props.translations.length) ? this.props.translations[0].trans_quality : 1;
    return (
      <ul className="mdc-list">  
        {this.props.translations.map( (trn, index) => {
          return (
            <li className="mdc-list-item" key={index}>
              <input
                type="image"
                className="graph-button mdc-elevation--z1"
                onClick={this.openGraph}
                src={networkIcon}
                alt={this.props.graphButtonAlt}
                data-index={index}
              />
              <div 
                className="bon-bar-background mdc-theme--secondary-light-bg" 
              >
                <div 
                  className="bon-bar mdc-theme--primary-bg" 
                  style={{inlineSize: (trn.trans_quality / maxBon) * 100 + '%'}}
                />
              </div>
              {trn.txt}
            </li>
        )})}
      </ul>
    )
  }
}