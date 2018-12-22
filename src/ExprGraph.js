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
    selected ? `<b>${expr.txt}</b>\n<i>${this.props.lvCache.get(expr.langvar).name_expr_txt || expr.uid}</i>` : expr.txt
  )
  
  prepGraph = (props) => {
    let startNodes = new Set(props.nodesDe);
    let endNodes = new Set(props.nodesAl);
    // let exprNodes = props.pathExprs.map((expr, index) => ({
    //   id: index,
    //   label: this.labelIfSelected(expr, index === this.state.nodeSelected),
    //   shape: "box",
    //   font: {
    //     multi: true,
    //     ital: {size: 12, vadjust: 2},
    //   },
    //   title: props.lvCache.get(expr.langvar).name_expr_txt,
    // }))
    // let lastNodeIndex = exprNodes.length - 1;
    // if (exprNodes.length) {
    //   for (let node of [exprNodes[0], exprNodes[lastNodeIndex]]) {
    //     node.mass = exprNodes.length - 2;
    //     node.font.size = 16;
    //     node.font.ital.size = 14;
    //     node.shape = "ellipse";
    //   }
    // }
    // let exprEdges = []
    // if (props.pathDirect) {
    //   exprEdges.push({width: 2, from: 0, to: lastNodeIndex, arrows: {to: true, from: true}});
    // }
    // for (let node of exprNodes.slice(1, -1)) {
    //   exprEdges.push({from: 0, to: node.id})
    //   exprEdges.push({from: node.id, to: lastNodeIndex})
    // }
    // return({nodes: exprNodes, edges: exprEdges})
    let nodeIds = Array.from(new Set(props.edges.flat()));
    let nodes = nodeIds.map(n => ({
      id: n, 
      label: n.toString(),
      shape: (startNodes.has(n) || endNodes.has(n)) ? "ellipse" : "box",
      font: {
        multi: true,
        ital: {size: 12, vadjust: 2},
      },
      mass: 
        endNodes.has(n) ? (nodeIds.length - 2) * 2 : 
        startNodes.has(n) ? (nodeIds.length - 2) :
        1,
    }));

    let edges = props.edges.map(([from, to]) => ({from, to}));
    return({nodes, edges})

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
    nodes: {
      borderWidth: 2,
      // color: {
      //   border: "#C82521", background: "#ffc2a7", 
      //   highlight: {border: "#C82521", background: "#ffc2a7"},
      //   hover: {border: "#C82521", background: "#ffc2a7"},
      // },
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
    // this.options.width = '' + window.innerWidth * 0.85;
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