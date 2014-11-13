define([
    'underscore',
    'threejs'
], function(_, THREE) {
    return function() {
        var projector = new THREE.Projector();
        var mouse = { x: 0, y: 0 };

        var updateMouse = function(evt) {
            mouse.x = (evt.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(evt.clientY / window.innerHeight) * 2 + 1;
        };

        var findIntersects = function() {
            var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
            projector.unprojectVector(vector, App.three.camera);
            var position = App.three.camera.position;
            var ray = new THREE.Raycaster(position, vector.sub(position).normalize());
            return ray.intersectObject(App.three.mesh.globe);
        };

        var headsUp = {
            template: _.template("<span><%= artist %>, played <%= plays %> time(s)</span>"),

            bindHeadsUp: function() {
                this.active = null;
                this.showing = false;

                App.container.addEventListener('click', function(evt) {
                    if (evt.target.nodeName === 'BUTTON') {
                        return false;
                    }
                    updateMouse(evt);
                    var intersects = findIntersects();
                    this.updateActive(intersects);
                }.bind(this));
            },

            updateActive: function(intersects) {
                var data;
                if (intersects.length === 0) {
                    this.active = null;
                    return;
                }

                var face = intersects[0].face;
                if (face != this.active) {
                    this.active = face;
                }

                if (face.data && face.data.artist) {
                    data = _.extend({}, this.active.data);
                    App.headsUpDisplay.innerHTML = this.template(data);
                    App.headsUpDisplay.style.display = 'none';
                } else {
                    App.headsUpDisplay.style.display = 'none';
                }
            }
        };

        headsUp.bindHeadsUp();
        return headsUp;
    };
});
