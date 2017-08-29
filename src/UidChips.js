import React, { Component } from 'react';
import Chip from 'material-ui/Chip';
import muiThemeable from 'material-ui/styles/muiThemeable';
import VisibilitySensor from 'react-visibility-sensor';

import './UidChips.css';

class UidChips extends Component {
  selectPrevLang = (event, index) => {
    let langList = this.props.langList.slice();
    let selectedLang = langList.splice(index, 1)[0];
    this.props.onSelectLang([selectedLang, ...langList], 'uid');
  }
    
  render() {
    return (
      <span className="chips" ref="chips">
        {(this.props.langList.length > 0) &&
          <Chip
            className="lng-chip"
            backgroundColor={this.props.muiTheme.palette.accent1Color}
            labelColor={this.props.muiTheme.palette.alternateTextColor}
          >
            {this.props.langList[0].name}
          </Chip>
        }
        {(this.props.langList.length > 1) &&
          this.props.langList.slice(1).map((lang, index) => (
            <VisibilitySensor key={index+1}
              containment={this.refs.chips}
            >
              {({isVisibile}) =>
                <Chip
                  className="lng-chip"
                  onClick={(event) => this.selectPrevLang(event, index+1)}
                >
                  {lang.name}
                </Chip>
              }
            </VisibilitySensor>
          ))
        }
      </span>
    )
  }
}

export default muiThemeable()(UidChips);
