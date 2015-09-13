'use strict';

let THREE = require('three');

class Graph {
    constructor() {
        this.nodeSet = {};
        this.nodes = [];
        this.edges = [];
    }

    addNode(node) {
        if (typeof this.nodeSet[node.nid] === 'undefined') {
            this.nodeSet[node.nid] = node;
            this.nodes.push(node);
            return node;
        }
        return false;
    }

    addEdge(source, target) {
        if (source.addConnectedTo(target) === true) {
            let edge = new Edge(source, target);
            this.edges.push(edge);
            return edge;
        }
        return false;
    }
}

class Node extends THREE.Mesh {
    constructor(nodeId) {
        super(
            new THREE.SphereGeometry(2, 15, 15),
            new THREE.MeshBasicMaterial({color: Math.random() * 0xffffff})
        );

        let area = 10000;
        this.position.x = Math.floor(Math.random() * (area + area + 1) - area);
        this.position.y = Math.floor(Math.random() * (area + area + 1) - area);

        this.nid = nodeId;
        this.nodesTo = [];
        this.nodesFrom = [];
    }

    addConnectedTo(node) {
        if (this.connectedTo(node) === false) {
            this.nodesTo.push(node);
            return true;
        }
        return false;
    }

    connectedTo(node) {
        for (let i = 0; i < this.nodesTo.length; i++) {
            let connectedNode = this.nodesTo[i];
            if (connectedNode.nid === node.nid) {
                return true;
            }
        }
        return false;
    }
}

class Edge extends THREE.Line {
    constructor(source, target) {
        super(
            new THREE.Geometry(),
            new THREE.LineBasicMaterial({
                color: 0xCCCCCC, opacity: 1, linewidth: 0.5
            }),
            THREE.LinePieces
        );

        this.geometry.vertices.push(source.position);
        this.geometry.vertices.push(target.position);
        this.scale.x = this.scale.y = this.scale.z = 1;
        this.originalScale = 1;

        this.source = source;
        this.target = target;
    }
}

module.exports = { Graph, Node, Edge };
