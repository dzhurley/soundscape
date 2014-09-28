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
                this.addEquidistantMarks(numMarkers);

                // ray intersect and paint
                var caster = new THREE.Raycaster();
                var intersectingFaces = [];
                var globe = App.three.mesh.getGlobe();
                for (var i = 0; i < this.markers.length; i++) {
                    caster.set(this.markers[i].position,
                               this.markers[i].position.angleTo(globe.position));
                    intersectingFaces.push(caster.intersectObject(globe));
                    debugger;
                }

                // blink for now
                _.delay(_.bind(function() {
                    _.map(this.marks, function(mark) {
                        scene.remove(mark);
                    });
                }, this), 1000);
            }
        };

        return Facer;
    };
});
