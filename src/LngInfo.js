import React, { Component } from 'react';
import Chip from 'material-ui/Chip';
import muiThemeable from 'material-ui/styles/muiThemeable';

class LngInfo extends Component {
  render() {
    return (
      <div className="lng-info">
        <Chip
          className="lng-chip droppable"
        >
          {this.props.lang.name_expr_txt}
        </Chip>
        <div className="lng-nom">
          <span className="lng-nom-label">
            {this.props.label}
            {/* {this.getLabel('nom')} — {this.fromLvCache(this.state.interfaceLangvar).name_expr_txt}: */}
          </span>
          {this.props.lang.otherNames &&
            <span className="lng-nom-plu">{this.props.lang.otherNames.join(' — ')}</span>
          }
        </div>
      </div>
    )
  }
}

export default muiThemeable()(LngInfo);
