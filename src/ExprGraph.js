import React, { Component } from 'react';

import Graph from 'react-graph-vis';

export default class ExprGraph extends Component{
  constructor(props) {
    super(props);
    this.state = {
      nodeSelected: null,
    }
  }
  
  labelIfSelected = (expr, index) => (
    index === this.state.nodeSelected ? expr.txt + '\n' + expr.uid : expr.txt
  )
  
  prepGraph = (props) => {
    
    let exprNodes = props.pathExprs.map((expr, index) => ({id: index, label: this.labelIfSelected(expr, index)}))
    exprNodes[0].mass = exprNodes.length - 2;
    exprNodes[exprNodes.length - 1].mass = exprNodes.length - 2;
    let exprEdges = []
    if (props.pathDirect) {
      exprEdges.push({from: 0, to: exprNodes.length - 1});
    }
    for (let node of exprNodes.slice(1, -1)) {
      exprEdges.push({from: 0, to: node.id})
      exprEdges.push({from: node.id, to: exprNodes.length - 1})
    }
    return({nodes: exprNodes, edges: exprEdges})
  };
  
  events = {
    selectNode: event => {
      this.setState({
        nodeSelected: event.nodes[0],
      })
    },
  };
  
  options = {
    autoResize: true,
    width: "100%",
    layout: {
    },
    edges: {
      smooth: true,
      arrows: {
        to: false,
      }
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