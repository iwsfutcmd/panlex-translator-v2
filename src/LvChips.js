import React, { Component } from 'react';
import Chip from 'material-ui/Chip';
import muiThemeable from 'material-ui/styles/muiThemeable';

import './LvChips.css';

class LvChips extends Component {
  // selectPrevLang = (event, index) => {
  //   let langList = this.props.langList.slice();
  //   let selectedLang = langList.splice(index, 1)[0];
  //   this.props.onSelectLang([selectedLang, ...langList]);
  // }
  
  drag = event => {
    event.dataTransfer.setData("text", event.target.dataset.lv);
    [].forEach.call(document.getElementsByClassName("droppable"), e => e.classList.add("drop-highlight"));
  }

  dragStop = event => {
    [].forEach.call(document.getElementsByClassName("droppable"), e => e.classList.remove("drop-highlight"));
  }
  
  render() {
    return (
      <span className="chips" ref="chips">
        {(this.props.langList.length > 0) &&
          this.props.langList.map((lang, index) => (
            <Chip
              key={index}
              className="lng-chip draggable"
              draggable={true}
              onDragStart={this.drag}
              onDragEnd={this.dragStop}
              onTouchStart={event => this.props.onTouchStart(event, lang.id)}
              data-lv={lang.id}
            >
              {lang.name_expr_txt}
            </Chip>
          ))
        }
      </span>
    )
  }
}

export default muiThemeable()(LvChips);
