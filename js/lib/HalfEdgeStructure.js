/**
 * @author dzhurley / http://shiftfoc.us/
 *
 * An implementation of a Half-Edge Data Structure for Three.js geometries.
 *
 * TODO: remove dependency on browserify
 *
 * For more information on this structure:
 * http://www.flipcode.com/archives/The_Half-Edge_Data_Structure.shtml
 */

var THREE = require('three');

var HalfEdgeStructure = function(geometry) {
    if (geometry instanceof THREE.Geometry === false) {
        console.error('geometry not an instance of THREE.Geometry.', geometry);
        return;
    }
    this.geometry = geometry;

    // must merge vertices to properly set `pair` and `next` references
    this.geometry.mergeVertices();

    // edges keyed on 'v1:v2'
    this.edges = {};

    var faceEdges = [];
    var edgeKey = '';
    var nextEdgeKey = '';
    var pairEdgeKey = '';

    var face, edge, faceIndex, edgeIndex;

    for (faceIndex in this.geometry.faces) {
        face = this.geometry.faces[faceIndex];

        // always counter-clockwise
        faceEdges = [this.rawEdgeFromVertices(face.a, face.b),
                     this.rawEdgeFromVertices(face.b, face.c),
                     this.rawEdgeFromVertices(face.c, face.a)];

        for (edgeIndex in faceEdges) {
            edge = faceEdges[edgeIndex];
            edgeKey = this.keyForEdge(edge);
            this.edges[edgeKey] = this.createHalfEdge(edge, face);
            // save edge information on vertex
            this.geometry.vertices[edge.v1].edge = this.edges[edgeKey];
        }

        for (edgeIndex in faceEdges) {
            edge = faceEdges[edgeIndex];
            edgeKey = this.keyForEdge(edge);

            // set next edge in rotation on current edge
            nextEdgeKey = this.getNextEdgeKey(faceEdges, edgeIndex);
            this.edges[edgeKey].next = this.edges[nextEdgeKey];

            // find pairs for half edges
            pairEdgeKey = edge.v2 + ':' + edge.v1;
            if (this.edges[pairEdgeKey]) {
                this.edges[edgeKey].pair = this.edges[pairEdgeKey];
                this.edges[pairEdgeKey].pair = this.edges[edgeKey];
            }
        }

        // use last edge from iteration to inform face
        face.edge = this.edges[edgeKey];
    }
};
 
HalfEdgeStructure.prototype = {
    constructor: THREE.HalfEdgeStructure,

    keyForEdge: function(edge) {
        return edge.v1 + ':' + edge.v2;
    },

    rawEdgeFromVertices: function(first, second) {
        return {v1: first, v2: second};
    },

    createHalfEdge: function(edge, face) {
        return {
            pair: undefined,
            next: undefined,
            vertex: edge.v1,
            face: face
        };
    },

    getNextEdgeKey: function(faceEdges, index) {
        // safe wrap on indexing edges
        index = parseInt(index, 10);
        if (faceEdges.length === index + 1) {
            return this.keyForEdge(faceEdges[0]);
        }
        return this.keyForEdge(faceEdges[index + 1]);
    },

    edgeForVertices: function(first, second) {
        return this.edges[this.keyForEdge()];
    },

    adjacentFaces: function(face) {
        return [
            face.edge.pair.face,
            face.edge.next.pair.face,
            face.edge.next.next.pair.face
        ];
    },

    edgesForFace: function(face) {
        return [face.edge,
                face.edge.next,
                face.edge.next.next];
    },

    facesForEdge: function(edge) {
        var halfEdge = this.edges[this.keyForEdge(edge)];
        return [halfEdge.face, halfEdge.pair.face];
    },

    facesForVertex: function(vertex) {
        var faces = [];

        function accumFaces(edge) {
            if (_.contains(faces, edge.face)) { return; }
            faces.push(edge.face);
            return accumFaces(edge.next.pair);
        }

        faces.push(vertex.edge.face);
        accumFaces(vertex.edge.pair);

        return faces;
    },

    verticesForEdge: function(edge) {
        return [this.geometry.vertices[edge.v1],
                this.geometry.vertices[edge.v2]];
    },

    isSameEdge: function(first, second) {
        // TODO: rework calling code to use HalfEdgeStructure methods
        return first.v1 === second.v1 && first.v2 === second.v2 ||
            first.v1 === second.v2 && first.v2 === second.v1;
    }
};

THREE.HalfEdgeStructure = HalfEdgeStructure;

module.exports = THREE;
