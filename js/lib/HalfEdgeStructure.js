/**
 * @author dzhurley / http://shiftfoc.us/
 */

function keyForEdge(edge) {
    return edge.v1 + ':' + edge.v2;
}

function createHalfEdge(edge, face) {
    return {
        pair: undefined,
        next: undefined,
        vertex: edge.v1,
        face: face
    };
}

function getNextEdgeKey(faceEdges, index) {
    // safe wrap on indexing edges
    index = parseInt(index, 10);
    if (faceEdges.length === index + 1) {
        return keyForEdge(faceEdges[0]);
    }
    return keyForEdge(faceEdges[index + 1]);
}

THREE.HalfEdgeStructure = function(object) {
    this.geometry = object.geometry !== undefined ? object.geometry : new THREE.Geometry();

    // edges keyed on 'v1:v2'
    this.edges = {};

    var faceEdges = [];
    var edgeKey = '';
    var nextEdgeKey = '';
    var pairEdgeKey = '';
    var edge, face, i = 0, j = 0;

    for (i in this.geometry.faces) {
        face = this.geometry.faces[i];

        // always counter-clockwise
        faceEdges = [{v1: face.a, v2: face.b},
                     {v1: face.b, v2: face.c},
                     {v1: face.c, v2: face.a}];

        for (j in faceEdges) {
            edge = faceEdges[j];
            edgeKey = keyForEdge(edge);
            this.edges[edgeKey] = createHalfEdge(edge, face);
            // save edge information on vertex
            this.geometry.vertices[edge.v1].edge = this.edges[edgeKey];
        }

        for (j in faceEdges) {
            edge = faceEdges[j];
            edgeKey = keyForEdge(edge);

            // set next edge in rotation on current edge
            nextEdgeKey = getNextEdgeKey(faceEdges, j);
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
 
THREE.HalfEdgeStructure.prototype = {
    constructor: THREE.HalfEdgeStructure,

    adjacentFaces: function(face) {
        return [
            face.edge.pair.face,
            face.edge.next.pair.face,
            face.edge.next.next.pair.face
        ];
    },

    edgesForFace: function(face) {
        return [
            face.edge,
            face.edge.next,
            face.edge.next.next
        ];
    },

    facesForEdge: function(edge) {
        var halfEdge = this.edges[keyForEdge(edge)];
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

    isSameEdge: function(first, second) {
        return first.v1 === second.v1 && first.v2 === second.v2 ||
            first.v1 === second.v2 && first.v2 === second.v1;
    },

    isSameFace: function(first, second) { },

    // old utils methods:
    //
    // addEquidistantMarks
    // faceCentroid
    // findClosestFace
    // findClosestFreeFace
    // findEquidistantFaces
    // removeEdge
    // resetFaces
};

