import React, { Component } from 'react';

import mark from './mark.svg';

import './LoadingIcon.css';

export default class LoadingIcon extends Component {
    render() {
        return (
            <img src={mark} className="panlex-loading" width={this.props.size || 28} alt="loading"/>
        )
  }
}