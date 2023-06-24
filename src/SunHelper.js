import { Cartesian3, Matrix3, Simon1994PlanetaryPositions, Transforms } from "cesium";

function ComputeSunPos(date){
    let transforMatrix=Transforms.computeTemeToPseudoFixedMatrix(date);
    let sunpos=Simon1994PlanetaryPositions.computeSunPositionInEarthInertialFrame(date);
    Matrix3.multiplyByVector(transforMatrix,sunpos,sunpos);
    // Cartesian3.normalize(sunpos,sunpos);
    return sunpos;
}

export {ComputeSunPos}