define([
    'underscore',
    'helpers',
    'threejs',
    'three/scene',
], function(_, h, THREE, scene) {
    return function(geometry) {
        var Facer = {
            geo: geometry,

            resetFaces: function() {
                // zero face values for fresh paint
                _.map(this.geo.faces, function(f) {
                    f.data = {};
                    f.color.setHex(0xFFFFFF);
                });
                this.geo.colorsNeedUpdate = true;
            },

            addEquidistantMarks: function(num) {
                if (this.markers && this.markers.length) {
                    // TODO: check on scene addition/removal?
                    return this.markers;
                }
                this.markers = [];
                var mark;
                var points = h.equidistantishPointsOnSphere(num);

                for (var i in points) {
                    mark = new THREE.Sprite(new THREE.SpriteMaterial({color: 0xff0000}));
                    mark.position.x = points[i][0];
                    mark.position.y = points[i][1];
                    mark.position.z = points[i][2];
                    mark.position.multiplyScalar(App.three.mesh.radius + 2);
                    this.markers.push(mark);
                    scene.add(mark);
                }
            },

            findEquidistantFaces: function(numMarkers) {
                // add transient helper marks
                this.addEquidistantMarks(numMarkers);

                var caster = new THREE.Raycaster();
                var intersectingFaces = [];
                var globe = App.three.mesh.getGlobe();
                var marker;
                for (var i = 0; i < this.markers.length; i++) {
                    marker = this.markers[i].position.clone();
                    caster.set(globe.position, marker.normalize());
                    intersectingFaces.push(caster.intersectObject(globe));
                }

                // remove transient helper marks
                _.map(this.marks, function(mark) {
                    scene.remove(mark);
                });

                return _.map(intersectingFaces, function(hit) {
                    // return at most one face for each intersection
                    return hit[0];
                });
            }
        };

        return Facer;
    };
});
