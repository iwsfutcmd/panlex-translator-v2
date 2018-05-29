import React, { Component } from 'react';

import '@material/list/dist/mdc.list.min.css';
import '@material/menu/dist/mdc.menu.min.css';
import {MDCMenu} from '@material/menu/dist/mdc.menu.min';
import '@material/textfield/dist/mdc.textfield.min.css';
import {MDCTextField} from '@material/textfield/dist/mdc.textfield.min';

import debounce from 'lodash/debounce';
import { query } from './api';
import './LvInput.css';
import LoadingIcon from './LoadingIcon';

export default class UidInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      suggestions: [],
      loading: false,
    }
  }
  
  itemClick = id => {
    this.setState({searchText: ''});
    this.props.onNewRequest(id);
    this.suggestMenu.open = false;
  }

  renderSuggestion = s => (
    <li className="mdc-list-item" role="menuitem" onClick={
      () => {
        this.itemClick(s.id);
        // this.setState({searchText: ''}); 
        // this.props.onNewRequest(s.id);
        // this.suggestMenu.open = false;
      }} 
      key={s.id}> 
      <div className='lv-item' dir={this.props.direction}>
        <div className='lv-line lv-main-line'>
          <span className='lv-name'>{s.trans[0].txt}</span>
          <span>{s.uid}</span>
        </div>
        <div className='lv-line lv-alt-line'>
          {s.trans.slice(1).map(tran => tran.txt).join(' — ')}
        </div>
      </div>
    </li>
  );

  getSuggestions = debounce((txt) => {
    if (txt) {
      this.setState({loading: true});
      query('/suggest/langvar', {'txt': txt, 'pref_trans_langvar': this.props.interfaceLangvar})
      .then((response) => {
        this.setState({loading: false});
        if (response.suggest) {
          let suggestions = response.suggest;
          this.setState({ suggestions }, () => {this.suggestMenu.open = true});
        } else {
          this.setState({ suggestions: []});
        }
      });
    } else {
      this.setState({ suggestions: []});
    }
  }, 500);
  
  onChange = event => {
    this.setState({searchText: event.target.value});
    this.getSuggestions(event.target.value);
  }

  render() {
    return (
      <span>
        <span className="lv-input-container" style={this.props.style} dir={this.props.direction}>
          {this.state.loading && <div className="loading"><LoadingIcon/></div>}
          <form onSubmit={e => {e.preventDefault(); this.itemClick(this.state.suggestions[0].id)}}>
            <div 
              ref={div => {if (div) {this.lvInput = new MDCTextField(div)}}}
              className="mdc-text-field mdc-text-field--upgraded"
            >
              <input 
                id="lv-input"
                className="mdc-text-field__input"
                type="text"
                value={this.state.searchText}
                onChange={this.onChange}
                autoCapitalize="none"
              />
              <label className="mdc-text-field__label" htmlFor="lv-input">{this.props.label}</label>
              <div className="mdc-line-ripple"/>
            </div>
          </form>
        </span>
        {this.state.suggestions.length ? 
          <div 
            ref={div => {if (div) {this.suggestMenu = new MDCMenu(div)}}}
            id="suggest-menu"
            className="mdc-menu"
          >
            <ul className="mdc-menu__items mdc-list" role="menu">
              {this.state.suggestions.map(s => this.renderSuggestion(s))}
            </ul>
          </div>
          : ""
        }
      </span>
    )
  }
}