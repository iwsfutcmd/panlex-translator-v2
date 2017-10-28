import React, { Component } from 'react';

import { Table, TableBody, TableRow, TableRowColumn } from 'material-ui/Table';
import RaisedButton from 'material-ui/RaisedButton';
import muiThemeable from 'material-ui/styles/muiThemeable';
import './TrnResult.css';
import networkIcon from './network.svg';

class TrnResult extends Component {
  render() {
    let maxBon = (this.props.translations.length) ? this.props.translations[0].trans_quality : 1;
    return (
      <Table
        onCellClick={(rowNumber, columnId) => {
          if (columnId === 0) {
            this.props.onExprClick(rowNumber)
          }
        }}
      >
        <TableBody displayRowCheckbox={false}>
          {this.props.translations.map( (trn, index) => {
            return (
              <TableRow
                className="trn-row"
                key={index}
              >
                <TableRowColumn
                  className="graph-button-cell"
                >
                  <RaisedButton 
                    icon={<img src={networkIcon} width="24px" height="24px" alt={this.props.graphButtonAlt}/>}
                    style={{minWidth: 'unset', width: "36px"}}
                  />
                </TableRowColumn>
                <TableRowColumn 
                  className="bon-bar-cell"
                >
                  <div className="bon-bar-background" style={{
                    backgroundColor: this.props.muiTheme.palette.borderColor,
                  }}>
                    <div className="bon-bar" style={{
                      inlineSize: (trn.trans_quality / maxBon) * 100 + '%',
                      backgroundColor: this.props.muiTheme.palette.primary1Color,
                    }}/>
                  </div>
                </TableRowColumn>
                <TableRowColumn
                  className="trn-cell"
                >
                  {trn.txt}
                </TableRowColumn>
              </TableRow>
            )})}
        </TableBody>
      </Table>
    )
  }
}

export default muiThemeable()(TrnResult);
