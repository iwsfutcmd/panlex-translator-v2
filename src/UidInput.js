import React, { Component } from 'react';

import AutoComplete from 'material-ui/AutoComplete';
import MenuItem from 'material-ui/MenuItem';
import CircularProgress from 'material-ui/CircularProgress';

import debounce from 'lodash/debounce';
import { query } from './api';
import './UidInput.css';

export default class UidInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      suggestions: [],
      loading: false,
    }
  }
  
  getSuggestions = debounce((txt) => {
    this.setState({loading: true});
    query('/suggest/langvar', {'txt': txt, 'pref_trans_langvar': this.props.interfaceLangvar})
    .then((response) => {
      this.setState({loading: false});
      if (response.suggest) {
        let suggestions = response.suggest.map((s) => {
          let altNameString = s.trans.slice(1).map(tran => tran.txt).join(' — ');
          return {
            uid: s.uid, 
            value: (
              <MenuItem>
                <div className='uid-item' style={{direction: this.props.direction}}>
                  <div className='uid-line uid-main'>
                    <span className='uid-name'>{s.trans[0].txt}</span>
                    <span>{s.uid}</span>
                  </div>
                  <div className='uid-line uid-alt'>
                    {altNameString}
                  </div>
                </div>
              </MenuItem>
            ),
            text: s.trans[0].txt,
          }});
        this.setState({ suggestions });
      } else {
        this.setState({ suggestions: []});
      }
    });
  }, 500);
  
  render() {
    let originHorizontal;
    if (this.props.align === 'end') {
      originHorizontal = (this.props.direction === 'rtl') ? "left" : "right";
    } else {
      originHorizontal = (this.props.direction === 'rtl') ? "right" : "left";
    }
    return (
      <span className="uid-input" style={this.props.style}>
        {this.state.loading && <CircularProgress className="loading"/>}
        <AutoComplete
          floatingLabelText={this.props.label}
          floatingLabelStyle={{transformOrigin: (this.props.direction === 'rtl') ? "right top 0px" : "left top 0px"}}
          searchText={this.state.searchText}
          filter={AutoComplete.noFilter}
          dataSource={this.state.suggestions}
          onUpdateInput={(txt) => {
            this.setState({searchText: txt});
            this.getSuggestions(txt);
          }}
          onNewRequest={(suggestion) => {
            this.setState({searchText: ''});
            console.log(this.state.searchText);
            this.props.onNewRequest(suggestion);
          }}
          fullWidth={true}
          menuProps={{maxHeight: 240}}
          popoverProps={{
            anchorOrigin: {vertical: 'bottom', horizontal: originHorizontal},
            targetOrigin: {vertical: 'top', horizontal: originHorizontal},
            style: {width: 'fit-content', direction: this.props.direction}
          }}
        />
      </span>
    )
  }
}