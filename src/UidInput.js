import React, { Component } from 'react';

import AutoComplete from 'material-ui/AutoComplete';
import MenuItem from 'material-ui/MenuItem';

import { query } from './api';
import './UidInput.css';

export default class UidInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      suggestions: [],
    }
  }
  
  getSuggestions = (txt) => {
    query('/suggest/langvar', {'txt': txt, 'pref_trans_langvar': this.props.interfaceLangvar})
    .then((response) => {
      if (response.suggest) {
        let suggestions = response.suggest.map((s) => {
          let altNameString = s.trans.slice(1).map(tran => tran.txt).join(' — ');
          return {
            text: s.uid, 
            value: (
              <MenuItem>
                <div className='uid-item' style={{direction: this.props.direction}}>
                  <div className='uid-line uid-main'>
                    <span>{s.trans[0].txt}</span>
                    <span>{s.uid}</span>
                  </div>
                  <div className='uid-line uid-alt'>
                    {altNameString}
                  </div>
                </div>
              </MenuItem>
            ),
            langName: s.trans[0].txt,
          }});
        this.setState({ suggestions });
      } else {
        this.setState({ suggestions: []});
      }
    });
  }
  
  render() {
    return (
      <AutoComplete
        floatingLabelText={this.props.label}
        floatingLabelStyle={{transformOrigin: (this.props.direction === 'rtl') ? "right top 0px" : "left top 0px"}}
        searchText={this.state.searchText}
        filter={AutoComplete.noFilter}
        dataSource={this.state.suggestions}
        onUpdateInput={this.getSuggestions}
        onNewRequest={(suggestion) => {
          this.setState({searchText: suggestion.langName});
          this.props.onNewRequest(suggestion);
        }}
        fullWidth={true}
        menuProps={{maxHeight: 240}}
      />
    )
  }
}

