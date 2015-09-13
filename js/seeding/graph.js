'use strict';

function Graph() {
    this.nodeSet = {};
    this.nodes = [];
    this.edges = [];
}

Graph.prototype.addNode = function(node) {
    if (typeof this.nodeSet[node.nid] === 'undefined') {
        this.nodeSet[node.nid] = node;
        this.nodes.push(node);
        return true;
    }
    return false;
};

Graph.prototype.getNode = function(nodeId) {
    return this.nodeSet[nodeId];
};

Graph.prototype.addEdge = function(source, target) {
    if (source.addConnectedTo(target) === true) {
        let edge = new Edge(source, target);
        this.edges.push(edge);
        return true;
    }
    return false;
};

function Node(nodeId) {
    this.nid = nodeId;
    this.nodesTo = [];
    this.nodesFrom = [];
    this.position = {};
    this.data = {};
}

Node.prototype.addConnectedTo = function(node) {
    if (this.connectedTo(node) === false) {
        this.nodesTo.push(node);
        return true;
    }
    return false;
};

Node.prototype.connectedTo = function(node) {
    for (let i = 0; i < this.nodesTo.length; i++) {
        let connectedNode = this.nodesTo[i];
        if (connectedNode.nid === node.nid) {
            return true;
        }
    }
    return false;
};

function Edge(source, target) {
    this.source = source;
    this.target = target;
    this.data = {};
}

module.exports = { Graph, Node, Edge };
