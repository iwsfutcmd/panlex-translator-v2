import React, { Component } from 'react';

import Graph from 'react-graph-vis';
import 'vis/dist/vis-network.min.css';

export default class ExprGraph extends Component{
  constructor(props) {
    super(props);
    this.state = {
      nodeSelected: null,
    }
  }
  
  labelIfSelected = (expr, selected) => (
    selected ? `<b>${expr.txt}</b>\n<i>${this.props.uidNames[expr.uid] || expr.uid}</i>` : expr.txt
  )
  
  prepGraph = (props) => {
    
    let exprNodes = props.pathExprs.map((expr, index) => ({
      id: index,
      label: this.labelIfSelected(expr, index === this.state.nodeSelected),
      shape: "box",
      font: {
        multi: true,
        ital: {size: 12, vadjust: 2},
      },
      title: props.uidNames[expr.uid],
    }))
    let lastNodeIndex = exprNodes.length - 1;
    exprNodes[0].mass = exprNodes.length - 2;
    exprNodes[0].font.size = 24;
    exprNodes[0].font.ital.size = 16;
    exprNodes[0].shape = "ellipse";
    exprNodes[lastNodeIndex].mass = exprNodes.length - 2;
    exprNodes[lastNodeIndex].font.size = 24;
    exprNodes[lastNodeIndex].font.ital.size = 16;
    exprNodes[lastNodeIndex].shape = "ellipse";
    let exprEdges = []
    if (props.pathDirect) {
      exprEdges.push({from: 0, to: lastNodeIndex, arrows: {to: true, from: true}});
    }
    for (let node of exprNodes.slice(1, -1)) {
      exprEdges.push({from: 0, to: node.id})
      exprEdges.push({from: node.id, to: lastNodeIndex})
    }
    return({nodes: exprNodes, edges: exprEdges})
  };
  
  events = {
    selectNode: event => {
      this.setState({
        nodeSelected: event.nodes[0],
      })
    },
    hoverNode: event => console.log(event),
  };
  
  options = {
    autoResize: true,
    width: "100%",
    nodes: {
      borderWidth: 2,
      color: {
        border: "#C82521", background: "#ffc2a7", 
        highlight: {border: "#C82521", background: "#ffc2a7"},
        hover: {border: "#C82521", background: "#ffc2a7"},
      },
      font: {
        color: "black",
      }
    },
    edges: {
      smooth: true,
      arrows: {
        to: false,
      },
      color: {color: "black", highlight: "black", hover: "black", inherit: false},
    },
    physics: {
      stabilization: true,
    },
    interaction: {
      hover: true,
    },
  };
  
  render() {
    this.options.height = '' + window.innerHeight * 0.70;
    this.options.width = '' + window.innerWidth * 0.85;
    return (
      <Graph 
        graph={this.prepGraph(this.props)}
        options={this.options}
        events={this.events}
        style={{width: "100%", height: "100%"}}
      />
    )
  }
}