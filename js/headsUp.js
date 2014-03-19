define([
    'underscore',
    'three',
    'camera',
    'mesh',
    'scene'
], function(_, THREE, camera, mesh, scene) {
    var projector = new THREE.Projector();
    var mouse = { x: 0, y: 0 };
    var active;

    var updateMouse = function(evt) {
        mouse.x = (evt.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(evt.clientY / window.innerHeight) * 2 + 1;
    };

    var findIntersects = function() {
        var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
        projector.unprojectVector(vector, camera);
        var ray = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
        return ray.intersectObjects([mesh.globe]);
    };


    var headsUp = {
        bindHeadsUp: function() {
            $(document).click(_.bind(function(evt) {
                updateMouse(evt);
                var intersects = findIntersects();
                this.updateActive(intersects);
            }, this));
        },

        updateActive: function(intersects) {
            if (intersects.length === 0) {
                active = null;
            } else if (intersects[0].face != active) {
                active = intersects[0].face;

                if(active.data){
                    var html = '';
                    _.each(_.keys(active.data), function(key) {
                        html += '<span>' + key + ': ' + active.data[key] + '</span>';
                    });
                    App.$headsUp.html(html);
                    return App.showHeadsUp ? App.$headsUp.show() : App.$headsUp.hide();
                }
            }
        }
    };

    return headsUp;
});
