import React, { Component } from 'react';

import './TrnDe.scss';

import TextField, { HelperText, Input } from '@material/react-text-field';
import MaterialIcon from '@material/react-material-icon';
import Card from '@material/react-card';

import LvInfo from './LvInfo';

export default class TrnDe extends Component {
  render() {
    return (
      <Card>
        <div className="trn-de-content">
          <div className="lv-input-dot">
            <LvInfo
              label={[this.props.getLabel('lng'), this.props.getLabel('de')].join(' — ')}
              interfaceLangvar={this.props.interfaceLang.id}
              onNewRequest={this.props.onLvPick}
              lv={this.props.lv}
            />
            <div style={{
              backgroundColor: this.props.colorMap.get(this.props.lv.id),
              inlineSize: 16,
              blockSize: 16,
              borderRadius: 8,
              }}/>
          </div>
          <TextField
            label={this.props.getLabel("txt")}
            helperText={<HelperText >{this.props.getLabel("npo")}</HelperText>}
            trailingIcon={
              <MaterialIcon
                icon="clear"
                alt={this.props.getLabel("del")}
                onClick={this.props.delTxt}
                tabIndex={0}
              />
            }
            outlined
          >
            <Input
              value={this.props.txt || ""}
              onChange={this.props.onTxtChange}
              lang={this.props.inputLangTag}
              autoCapitalize="none"
              type="text"
            />
          </TextField>
        </div>
      </Card>
    )
  }
}