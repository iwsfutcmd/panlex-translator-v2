import React, { Component } from 'react';

import { Table, TableBody, TableRow, TableRowColumn } from 'material-ui/Table';
import RaisedButton from 'material-ui/RaisedButton';
import muiThemeable from 'material-ui/styles/muiThemeable';
import './TrnResult.css';
import networkIcon from './network.svg';

class TrnResult extends Component {
  render() {
    let maxBon = (this.props.translations.length) ? this.props.translations[0].trans_quality : 1;
    let bonBarStyle = {transform: (this.props.direction === 'rtl') ? "scaleX(-1)" : "scaleX(1)"};
    return (
      <Table
        onCellClick={(rowNumber, columnId) => {
          if (columnId === 2) {
            this.props.onExprClick(rowNumber)
          }
        }}
      >
        <TableBody displayRowCheckbox={false}>
          {this.props.translations.map( (trn, index) => {
            let bonWidth = (trn.trans_quality / maxBon) * 48;
            return (
              <TableRow
                className="trn-row"
                key={index}
              >
                <TableRowColumn 
                  className="bon-bar-cell"
                  style={bonBarStyle}
                >
                  <svg className="bon-bar" width={48} height={16}>
                    <rect width={48} height={16} rx={4} ry={4} fill="rgb(189, 189, 189)"/>
                    <rect width={bonWidth} height={16} rx={4} ry={4} fill={this.props.muiTheme.palette.primary1Color}/>
                  </svg>

                </TableRowColumn>
                <TableRowColumn
                  className="trn-cell"
                >
                  {trn.txt}
                </TableRowColumn>
                <TableRowColumn
                  className="graph-button-cell"
                >
                  <RaisedButton 
                    icon={<img src={networkIcon} width="24px" height="24px"/>}
                    style={{minWidth: 'unset', width: "36px"}}
                  />
                </TableRowColumn>
              </TableRow>
            )})}
        </TableBody>
      </Table>
    )
  }
}

export default muiThemeable()(TrnResult);
