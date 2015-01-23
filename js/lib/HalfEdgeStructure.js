/**
 * @author dzhurley / http://shiftfoc.us/
 */

THREE.HalfEdgeStructure = function(object) {
    this.geometry = object.geometry !== undefined ? object.geometry : new THREE.Geometry();

    // edges keyed on 'v1:v2'
    this.edges = {};
    // TODO: should be mapping, keyed on index?
    this.faces = [];
    // TODO: should be mapping, keyed on index?
    this.vertices = [];

    function createHalfEdge(edge, face) {
        return {
            pair: undefined,
            next: undefined,
            vertex: edge.v1,
            face: face
        };
    }

    function createVertex(vertex) {
        return {
            x: vertex.x,
            y: vertex.y,
            z: vertex.z,
            edge: undefined
        };
    }

    function createFace(face) {
        return {
            edge: undefined
        };
    }

    function getNextEdgeKey(faceEdges, edge) {
        // safe wrap on indexing edges
        if (faceEdges.length === edge) {
            return faceEdges[0].v1 + ':' + faceEdges[0].v2;
        }
        return faceEdges[edge + 1].v1 + ':' + faceEdges[edge + 1].v2;
    }

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
            edgeKey = edge.v1 + ':' + edge.v2;
            this.edges[edgeKey] = createHalfEdge(edge, face);
        }

        for (j in faceEdges) {
            edge = faceEdges[j];
            edgeKey = edge.v1 + ':' + edge.v2;

            // set next edge in rotation on current edge
            nextEdgeKey = getNextEdgeKey(faceEdges, edge);
            this.edges[edgeKey].next = this.edges[nextEdgeKey];

            // find pairs for half edges
            pairEdgeKey = edge.v2 + ':' + edge.v1;
            if (this.edges[pairEdgeKey]) {
                this.edges[edgeKey].pair = this.edges[pairEdgeKey];
                this.edges[pairEdgeKey].pair = this.edges[edgeKey];
            }
        }

        // use last edge from iteration to inform face
        // TODO: store reference to array of faces?
        face.edge = edge;
    }
};
 
THREE.HalfEdgeStructure.prototype = {
    constructor: THREE.HalfEdgeStructure,

    edgesForFace: function(face) { },

    facesForEdge: function(edge) { },

    facesForVertex: function(vertex) { },

    isSameEdge: function(first, second) { },

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

