'use strict';

class Swapper {
    constructor(mesh) {
        this.mesh = mesh;
    }

    handleSwappers(startFace) {
        let goal = this.mesh.findClosestFreeFace(startFace);
        let currentFace = startFace;
        let candidates = [];
        let path = [currentFace];

        while (currentFace !== goal) {
            candidates = self.HEDS.adjacentFaces(currentFace);
            currentFace = this.mesh.findClosestFace(candidates, goal);
            path.push(currentFace);
        }

        let prevFace;
        path.reverse().forEach((face, index) => {
            prevFace = path[index + 1];
            if (prevFace) {
                // TODO: account for edge info, see expandArtistEdges
                face.data = Object.assign({}, prevFace.data);
                face.color.copy(prevFace.color);
            }
        });

        this.mesh.geometry.colorsNeedUpdate = true;
        return goal;
    }
}

module.exports = Swapper;
