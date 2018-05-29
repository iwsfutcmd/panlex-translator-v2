import React, { Component } from 'react';

import '@material/elevation/dist/mdc.elevation.min.css';
import '@material/chips/dist/mdc.chips.min.css';

import './LvInfo.css';

export default class LvInfo extends Component {
  render() {
    return (
      <div className="lv-info-box">
        <div
          className="chip mdc-theme--secondary-light-bg mdc-elevation--z1 droppable"
          // className="mdc-chip mdc-theme--secondary-light-bg mdc-elevation--z1 droppable"
          onTouchStart={this.props.onTouchStart}
        >
          <span className="chip-label">{this.props.lang.name_expr_txt}</span>
          {/* <span className="mdc-chip__text">{this.props.lang.name_expr_txt}</span> */}
        </div>
        {/* <details className="lv-info">
          <summary> */}
            <span className="lv-info lv-info-line">
              {/* <span className="lv-info-label">
                {this.props.nomLabel}
              </span> */}
              {this.props.lang.otherNames &&
                <span className="lv-info-data">{this.props.lang.otherNames.slice(0,3).join(' — ')}</span>
              }
            </span>
          {/* </summary> */}
          {/* <div className="lv-info-line">
            <span className="lv-info-label">
              {this.props.karLabel}
            </span>
            {this.props.lang.scriptNames &&
              <span className="lv-info-data">{this.props.lang.scriptNames.slice(0,3).join(' — ')}</span>
            }
          </div>
          {this.props.lang.region_expr !== 26528845 && //region = world
            <div className="lv-info-line">
              <span className="lv-info-label">
                {this.props.locLabel}
              </span>
              {this.props.lang.regionNames &&
                <span className="lv-info-data">{this.props.lang.regionNames.slice(0,3).join(' — ')}</span>
              }
            </div>
          }
        </details> */}
      </div>
    )
  }
}