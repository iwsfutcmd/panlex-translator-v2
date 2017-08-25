import React, { Component } from 'react';
import Chip from 'material-ui/Chip';
import muiThemeable from 'material-ui/styles/muiThemeable';

import UidInput from './UidInput';
import './UidInputChipped.css';

class UidInputChipped extends Component {
  constructor(props) {
    super(props);
    this.state = {
      langList: [{}],
    }
  }
  
  selectPrevLang = (event, index) => {
    let langList = this.props.langList.slice();
    let selectedLang = langList.splice(index, 1)[0];
    // console.log(langList, selectedLang)
    this.setState({langList: [selectedLang, ...langList]})
    this.props.onSelectLang([selectedLang, ...langList]);
  }
  
  render() {
    return (
      <span className="uid-input-chipped">
        <span className="chips">
          {(this.props.langList.length > 0) &&
            <Chip
              className="lng-chip"
              backgroundColor={this.props.muiTheme.palette.primary1Color}
              labelColor={this.props.muiTheme.palette.alternateTextColor}
            >
              {this.props.langList[0].name}
            </Chip>
          }
          {(this.props.langList.length > 1) &&
            this.props.langList.slice(1).map((lang, index) => {
              return (
                <Chip className="lng-chip" key={index+1} onClick={(event) => this.selectPrevLang(event, index+1)}>
                  {lang.name}
                </Chip>
              )})
          }
        </span>
        <UidInput
          style={{margin: "0 8px"}}
          onNewRequest={(item) => {
            let selectedLang = {uid: item.uid, name: item.text};
            this.setState(prevState => ({
              langList: [selectedLang, ...prevState.langList],
            }));
            this.props.onSelectLang([selectedLang, ...this.props.langList]);
          }}
          direction={this.props.direction}
          label={this.props.label}
          interfaceLangvar={this.props.interfaceLangvar}
        />
      </span>
    )
  }
}

export default muiThemeable()(UidInputChipped);
