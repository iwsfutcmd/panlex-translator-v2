import React, { Component } from 'react';
import muiThemeable from 'material-ui/styles/muiThemeable';

import './LngInfo.css';

class LngInfo extends Component {
  render() {
    return (
      <div className="lng-info-box">
        <div
          className="chip droppable"
          onTouchStart={this.props.onTouchStart}
        >
          <span className="chip-label">{this.props.lang.name_expr_txt}</span>
        </div>
        <details className="lng-info">
          <summary>
            <span className="lng-info-line">
              <span className="lng-info-label">
                {this.props.nomLabel}
              </span>
              {this.props.lang.otherNames &&
                <span className="lng-info-data">{this.props.lang.otherNames.slice(0,3).join(' — ')}</span>
              }
            </span>
          </summary>
          <div className="lng-info-line">
            <span className="lng-info-label">
              {this.props.karLabel}
            </span>
            {this.props.lang.scriptNames &&
              <span className="lng-info-data">{this.props.lang.scriptNames.slice(0,3).join(' — ')}</span>
            }
          </div>
          {this.props.lang.region_expr !== 26528845 && //region = world
            <div className="lng-info-line">
              <span className="lng-info-label">
                {this.props.locLabel}
              </span>
              {this.props.lang.regionNames &&
                <span className="lng-info-data">{this.props.lang.regionNames.slice(0,3).join(' — ')}</span>
              }
            </div>
          }
        </details>
      </div>
    )
  }
}

export default muiThemeable()(LngInfo);
