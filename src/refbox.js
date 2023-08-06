import { BoxGeometry, Cartesian3, Transforms,
    Matrix4, EllipsoidSurfaceAppearance, GeometryInstance, Primitive, VertexFormat, ColorGeometryInstanceAttribute, Color, PerInstanceColorAppearance } from "cesium";

function createRefBox(pos){
    const dim=new Cartesian3(80,30,100);
    const box_geom=BoxGeometry.fromDimensions({
        vertexFormat:VertexFormat.POSITION_AND_NORMAL,
        dimensions:dim
    });
    const localmatrix = Transforms.eastNorthUpToFixedFrame(pos);
    const modelmatrix = Matrix4.multiplyByTranslation(
      localmatrix, new Cartesian3(0, 0, 50), new Matrix4());
    
    const ins=new GeometryInstance({
        geometry:box_geom,
        modelMatrix:modelmatrix,
        attributes : {
            color : ColorGeometryInstanceAttribute.fromColor(Color.WHITE)
          }
    });
    const primitive=new Primitive({
        geometryInstances:ins,
        asynchronous:false,
        appearance:new PerInstanceColorAppearance({
            translucent:false,
        })
    })
    return primitive;
}

export {createRefBox}