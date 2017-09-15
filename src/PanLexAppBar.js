import React, { Component } from 'react';

import AppBar from 'material-ui/AppBar';
import RaisedButton from 'material-ui/RaisedButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import Dialog from 'material-ui/Dialog';
import IconButton from 'material-ui/IconButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';

import UidInput from './UidInput';



const Menu = (props) => (
  <div style={{display: 'flex', alignItems: 'center'}}>
    <a href="https://panlex.org/donate">
      <RaisedButton
        label={props.donLabel}
      />
    </a>
    <IconMenu 
      {...props}
      iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
      anchorOrigin={{horizontal: props.originHorizontal, vertical: 'top'}}
      targetOrigin={{horizontal: props.originHorizontal, vertical: 'top'}}
    >
      <MenuItem
        primaryText="🔁"
        onClick={props.switchDirection}
      />
      <MenuItem
        primaryText={props.lngModLabel}
        onClick={props.handleLngMod}
      />
    </IconMenu>
  </div>
)

Menu.muiName = "IconMenu"

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
            <Menu 
              originHorizontal={originHorizontal}
              switchDirection={this.props.switchDirection}
              lngModLabel={this.props.lngModLabel}
              donLabel={this.props.donLabel}
              handleLngMod={() => this.setState({interfaceLangDialogOpen: true})}
            />
          }
          iconStyleRight={{margin: "8px -16px"}}
          // iconElementLeft={<img src={logo} className="App-logo" alt="logo" />}
          showMenuIconButton={false}
        >
        </AppBar>
        <Dialog
          open={this.state.interfaceLangDialogOpen}
          onRequestClose={() => this.setState({interfaceLangDialogOpen: false})}
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