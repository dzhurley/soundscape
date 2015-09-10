'use strict';

/* Handle case where no free adjacent faces were found to paint
 *
 * We find an edge-wise path from the face that needs to swap to
 * the nearest free face, then travel back along the path and swap
 * each face with its predecessor until we've bubbled the entire
 * path out.
 */

let globe = require('../three/globe');

class Swapper {
    handleSwappers(startFace) {
        let goal = globe.findClosestFreeFace(startFace);
        let currentFace = startFace;
        let candidates = [];
        let path = [currentFace];

        while (currentFace !== goal) {
            candidates = self.HEDS.adjacentFaces(currentFace);
            currentFace = globe.findClosestFace(candidates, goal);
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

        globe.geometry.colorsNeedUpdate = true;
        return goal;
    }
}

module.exports = new Swapper();
