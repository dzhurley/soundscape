/**
  Implements a force-directed layout, the algorithm is based on Fruchterman and Reingold and
  the JUNG implementation.
 */

var Layout = Layout || {};

Layout.ForceDirected = function(graph, options = {}) {
    this.repulsion_multiplier = 0.75;
    this.max_iterations = 1000;
    this.graph = graph;
    this.width = 200;
    this.height = 200;
    this.finished = false;

    var callback_positionUpdated = options.positionUpdated;

    var EPSILON = 0.000001;
    var repulsion_constant;
    var forceConstant;
    var layout_iterations = 0;
    var temperature = 0;
    var nodes_length;
    var edges_length;
    var that = this;

    /**
     * Initialize parameters used by the algorithm.
     */
    this.init = function() {
        this.finished = false;
        temperature = this.width / 10.0;
        nodes_length = this.graph.nodes.length;
        edges_length = this.graph.edges.length;
        forceConstant = Math.sqrt(this.height * this.width / nodes_length);
        repulsion_constant = this.repulsion_multiplier * forceConstant;
    };

    /**
     * Generates the force-directed layout.
     *
     * It finishes when the number of max_iterations has been reached or when
     * the temperature is nearly zero.
     */
    this.generate = function() {
        if(layout_iterations < this.max_iterations && temperature > 0.000001) {
            // calculate repulsion
            for(var i=0; i < nodes_length; i++) {
                var node_v = graph.nodes[i];
                node_v.layout = node_v.layout || {};
                if(i==0) {
                    node_v.layout.offset_x = 0;
                    node_v.layout.offset_y = 0;
                    node_v.layout.offset_z = 0;
                }

                node_v.layout.force = 0;
                node_v.layout.tmp_pos_x = node_v.layout.tmp_pos_x || node_v.position.x;
                node_v.layout.tmp_pos_y = node_v.layout.tmp_pos_y || node_v.position.y;
                node_v.layout.tmp_pos_z = node_v.layout.tmp_pos_z || node_v.position.z;

                for(var j=i+1; j < nodes_length; j++) {
                    var node_u = graph.nodes[j];
                    if(i != j) {
                        node_u.layout = node_u.layout || {};
                        node_u.layout.tmp_pos_x = node_u.layout.tmp_pos_x || node_u.position.x;
                        node_u.layout.tmp_pos_y = node_u.layout.tmp_pos_y || node_u.position.y;
                        node_u.layout.tmp_pos_z = node_u.layout.tmp_pos_z || node_u.position.z;

                        var delta_x = node_v.layout.tmp_pos_x - node_u.layout.tmp_pos_x;
                        var delta_y = node_v.layout.tmp_pos_y - node_u.layout.tmp_pos_y;
                        var delta_z = node_v.layout.tmp_pos_z - node_u.layout.tmp_pos_z;

                        var delta_length = Math.max(EPSILON, Math.sqrt((delta_x * delta_x) + (delta_y * delta_y)));
                        var delta_length_z = Math.max(EPSILON, Math.sqrt((delta_z * delta_z) + (delta_y * delta_y)));

                        var force = (repulsion_constant * repulsion_constant) / delta_length;
                        var force_z = (repulsion_constant * repulsion_constant) / delta_length_z;

                        node_v.layout.force += force;
                        node_u.layout.force += force;

                        node_v.layout.offset_x += (delta_x / delta_length) * force;
                        node_v.layout.offset_y += (delta_y / delta_length) * force;

                        if(i==0) {
                            node_u.layout.offset_x = 0;
                            node_u.layout.offset_y = 0;
                            node_u.layout.offset_z = 0;
                        }
                        node_u.layout.offset_x -= (delta_x / delta_length) * force;
                        node_u.layout.offset_y -= (delta_y / delta_length) * force;

                        node_v.layout.offset_z += (delta_z / delta_length_z) * force_z;
                        node_u.layout.offset_z -= (delta_z / delta_length_z) * force_z;
                    }
                }
            }

            // calculate positions
            for(var i=0; i < nodes_length; i++) {
                var node = graph.nodes[i];

                var delta_length = Math.max(EPSILON, Math.sqrt(node.layout.offset_x * node.layout.offset_x + node.layout.offset_y * node.layout.offset_y));
                var delta_length_z = Math.max(EPSILON, Math.sqrt(node.layout.offset_z * node.layout.offset_z + node.layout.offset_y * node.layout.offset_y));

                node.layout.tmp_pos_x += (node.layout.offset_x / delta_length) * Math.min(delta_length, temperature);
                node.layout.tmp_pos_y += (node.layout.offset_y / delta_length) * Math.min(delta_length, temperature);
                node.layout.tmp_pos_z += (node.layout.offset_z / delta_length_z) * Math.min(delta_length_z, temperature);

                var updated = true;
                node.position.x -=  (node.position.x-node.layout.tmp_pos_x)/10;
                node.position.y -=  (node.position.y-node.layout.tmp_pos_y)/10;
                node.position.z -=  (node.position.z-node.layout.tmp_pos_z)/10;

                // execute callback function if positions has been updated
                if(updated && typeof callback_positionUpdated === 'function') {
                    callback_positionUpdated(node);
                }
            }
            temperature *= (1 - (layout_iterations / this.max_iterations));
            layout_iterations++;
        } else {
            this.finished = true;
            return false;
        }
        return true;
    };

    /**
     * Stops the calculation by setting the current_iterations to max_iterations.
     */
    this.stop_calculating = function() {
        layout_iterations = this.max_iterations;
    }
};

module.exports = Layout;
