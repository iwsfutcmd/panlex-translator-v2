import React, { Component } from 'react';

import AppBar from 'material-ui/AppBar';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import Dialog from 'material-ui/Dialog';
import IconButton from 'material-ui/IconButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';

import UidInput from './UidInput';

export default class PanLexAppBar extends Component{
  constructor(props) {
    super(props);
    this.state = {
      interfaceLangDialogOpen: false,
    }
  }

  
  render () {
    let originHorizontal = (this.props.direction === 'rtl') ? "left" : "right";
    return (
      <div>
        <AppBar
          title={this.props.title}
          iconElementRight={
            <IconMenu 
              iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
              anchorOrigin={{horizontal: originHorizontal, vertical: 'top'}}
              targetOrigin={{horizontal: originHorizontal, vertical: 'top'}}
            >
              <MenuItem
                primaryText="🔁"
                onClick={this.props.switchDirection}
              />
              <MenuItem
                primaryText={this.props.lngModLabel}
                onClick={() => this.setState({interfaceLangDialogOpen: true})}
              />
            </IconMenu>
          }
          iconStyleRight={{margin: "8px -16px"}}
          // iconElementLeft={<img src={logo} className="App-logo" alt="logo" />}
          showMenuIconButton={false}
        />
        <Dialog
          open={this.state.interfaceLangDialogOpen}
        >
          <UidInput
            onNewRequest={(lang) => {
              this.setState({interfaceLangDialogOpen: false});
              this.props.setInterfaceLang(lang);
            }}
            direction={this.state.direction}
            label={this.props.lngModLabel}
            interfaceLangvar={this.props.interfaceLangvar}
          />
        </Dialog>
      </div>
  )}
}