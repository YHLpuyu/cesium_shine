import { Cartesian3, Cartographic, Matrix4, Transforms,Plane } from "cesium";

/**
 * 计算球面点的切平面
 * @param {Cartesian3} 球面上一点坐标 pos 
 * @returns 
 */
function createTangentPlane(pos){
  const nor=getNormalOnSurface(pos);
  console.log(nor);
//   console.log(getUpOnSurface(pos));
  const dist=Cartesian3.magnitude(pos);
  return new Plane(nor,dist);
}

function getNormalOnSurface(pos){
    const latlng=Cartographic.fromCartesian(pos);
    latlng.height=0;
    const carto=Cartographic.toCartesian(latlng);
    const dir=new Cartesian3();
    Cartesian3.subtract(pos,carto,dir);
    const nor=new Cartesian3();
    Cartesian3.normalize(dir,nor);
    return nor;
}

function getUpOnSurface(pos)
{
    const trans=Transforms.eastNorthUpToFixedFrame(pos);
    return trans;
}

export {createTangentPlane}