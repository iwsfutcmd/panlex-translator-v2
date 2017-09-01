import React, { Component } from 'react';

import Graph from 'react-graph-vis';

var options = {
    layout: {
        hierarchical: true
    },
    edges: {
        // color: "#000000"
    }
};

var events = {
    select: function(event) {
        var { nodes, edges } = event;
    }
};

export default class ExprGraph extends Component{
  prepGraph = (props) => {
    let exprNodes = Array.map(props.pathExprs, (expr, index) => ({id: index, label: expr.txt + '\n' + expr.uid, level: 1}))
    exprNodes[0].level = 0
    exprNodes[exprNodes.length - 1].level = 2
    let exprEdges = []
    for (let node of exprNodes.slice(1, -1)) {
      exprEdges.push({from: 0, to: node.id})
      exprEdges.push({from: node.id, to: exprNodes.length - 1})
    }
    return({nodes: exprNodes, edges: exprEdges})
  }
  
  render() {
    return (
      <Graph graph={this.prepGraph(this.props)} options={options} events={events}/>
    )
  }
}