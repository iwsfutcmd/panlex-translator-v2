import React, { Component } from 'react';

import { Table, TableBody, TableRow, TableRowColumn } from 'material-ui/Table';
import muiThemeable from 'material-ui/styles/muiThemeable';
import './TrnResult.css';

class TrnResult extends Component {
  render() {
    let maxBon = (this.props.translations.length) ? this.props.translations[0].trans_quality : 1;
    return (
      <Table
        onCellClick={this.props.onExprClick}
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
                  style={{transform: (this.props.direction === 'rtl') ? "scaleX(1)" : "scaleX(-1)"}}
                >
                  <svg className="bon-bar" width={48} height={16}>
                    <rect width={48} height={16} rx={4} ry={4} fill="rgb(189, 189, 189)"/>
                    <rect width={bonWidth} height={16} rx={4} ry={4} fill={this.props.muiTheme.palette.primary1Color}/>
                  </svg>

                </TableRowColumn>
                <TableRowColumn
                  style={{fontSize: '16px', height: '40px'}}
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
