import React, { Component } from 'react';

import '@material/elevation/dist/mdc.elevation.min.css';
import '@material/chips/dist/mdc.chips.min.css';

import './LvChips.css';

export default class LvChips extends Component {

  drag = event => {
    event.dataTransfer.setData("text", event.target.dataset.lv);
    [].forEach.call(document.getElementsByClassName("droppable"), e => e.classList.add("drop-highlight"));
  }

  dragStop = event => {
    [].forEach.call(document.getElementsByClassName("droppable"), e => e.classList.remove("drop-highlight"));
  }
  
  render() {
    return (
      <span className="chip-list">
      {/* <span className="mdc-chip-set"> */}

        {(this.props.langList.length > 0) &&
          this.props.langList.map((lang, index) => (
            <div
              key={index}
              className="chip mdc-theme--secondary-light-bg mdc-elevation--z1 draggable"
              // className="mdc-chip mdc-theme--secondary-light-bg mdc-elevation--z1 draggable"
              draggable={true}
              onDragStart={this.drag}
              onDragEnd={this.dragStop}
              onTouchStart={event => this.props.onTouchStart(event, lang.id)}
              data-lv={lang.id}
            >
              <span className="chip-label">{lang.name_expr_txt}</span>
              {/* <span className="mdc-chip__text">{lang.name_expr_txt}</span> */}
            </div>
          ))
        }
      </span>
    )
  }
}