import React, { Component } from 'react';

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
        {(this.props.langList.length > 0) &&
          this.props.langList.map((lang, index) => (
            <div
              key={index}
              className="chip draggable"
              draggable={true}
              onDragStart={this.drag}
              onDragEnd={this.dragStop}
              onTouchStart={event => this.props.onTouchStart(event, lang.id)}
              data-lv={lang.id}
            >
              <span className="chip-label">{lang.name_expr_txt}</span>
            </div>
          ))
        }
      </span>
    )
  }
}