import {
  Ion, Viewer, EncodedCartesian3,
  BoxGeometry,
  Cartesian3,
  VertexFormat,
  GeometryInstance,
  Matrix4,
  Transforms,
  ColorGeometryInstanceAttribute,
  Color,
  Primitive,
  PerInstanceColorAppearance,
  Interval,
  ShadowMode,
  JulianDate,
  Appearance,
  Material,
  EllipsoidSurfaceAppearance,
  MaterialAppearance,
  Simon1994PlanetaryPositions,
  Ray,
  Cartographic,
  Plane,
  Cartesian2,
  CallbackProperty,
  Matrix3,
  GeometryInstanceAttribute,
  ComponentDatatype,
  GeometryAttribute,
  ScreenSpaceEventType,
} from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import "../src/css/main.css"
import GUI from "lil-gui";

import { ComputeSunPos } from "./SunHelper";
import { createTangentPlane } from "./lxshelper";
import { boxintersect } from "./boxintersect";
import { createRefBox } from "./refbox";

const center = Cartesian3.fromDegrees(120, 20.0);
const transform = Transforms.eastNorthUpToFixedFrame(center);
const rotation = Matrix4.getRotation(transform, new Matrix3());
const axisx = new Cartesian3(1, 0, 0);
const axisx_lxs = Matrix3.multiplyByVector(rotation, axisx, new Cartesian3());
const axisy = new Cartesian3(0, 1, 0);
const axisy_lxs = Matrix3.multiplyByVector(rotation, axisy, new Cartesian3());
const anglexy = Cartesian3.angleBetween(axisx_lxs, axisy_lxs);
console.log(axisx_lxs);

// Your access token can be found at: https://cesium.com/ion/tokens.
// This is the default access token
Ion.defaultAccessToken = 'your key';

const gui = new GUI();

// Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.
const viewer = new Viewer('cesiumContainer', {
  // terrainProvider: createWorldTerrain()
});
boxintersect(viewer, gui);
viewer.scene.globe.enableLighting = true;
viewer.shadows = true
const scene = viewer.scene;

const suninitpos = Cartesian3.fromDegrees(120, 30, 200);

// const utc = JulianDate.fromDate(new Date("2023/06/23 21:00:00"));
// viewer.clockViewModel.currentTime = JulianDate.addHours(utc, 8, new JulianDate());

// const blueBox = viewer.entities.add({
//   name: "Blue box",
//   position: Cartesian3.fromDegrees(120, 30.0, 200),
//   box: {
//     dimensions: new Cartesian3(50, 50, 50),
//     material: Color.BLUE,
//   },
// });

const surfacepos = Cartesian3.fromDegrees(120, 30, 200);
const ellipsoid = scene.globe.ellipsoid;
const nor = ellipsoid.geodeticSurfaceNormal(surfacepos);
const dist = Cartesian3.magnitude(surfacepos);
const tgplane = new Plane(nor, dist);

// const bluePlane = viewer.entities.add({
//   name: "Blue plane",
//   position: surfacepos,
//   plane: {
//     plane: new Plane(Cartesian3.UNIT_Z, 0),
//     dimensions: new Cartesian2(400.0, 300.0),
//     material: Color.YELLOW,
//   },
// });

const startDate = JulianDate.fromDate(new Date("2023/07/02 18:00:00"));
viewer.clockViewModel.currentTime = startDate;
const hours = 24;
const sunposs = [];
for (let i = 0; i < hours; i++) {
  const date = new JulianDate();
  JulianDate.addHours(startDate, i, date);
  console.log(date);
  let sunpos = ComputeSunPos(date);
  const dir = new Cartesian3();
  Cartesian3.subtract(sunpos, suninitpos, dir);
  Cartesian3.normalize(dir, dir);
  const dist = Plane.getPointDistance(tgplane, sunpos);
  if (dist > 0) {
    sunposs.push(dir);
  }
}

var polyline = viewer.entities.add({
  polyline: {
    //使用cesium的peoperty
    positions: new CallbackProperty(function () {
      return lxs.positions
    }, false),
    show: true,
    material: Color.RED,
    width: 3,
  }
});


const lxs = {
  dist: 0,
  positions: [
    suninitpos,
    Cartesian3.fromDegrees(120, 30, 300),
  ]
};

const LAT = 30, LNG = 120, INTERVAL = 0.001;

const box_axis_x = new Cartesian3(15, 0, 0);
const box_axis_y = new Cartesian3(0, 40, 0);
const box_axis_z = new Cartesian3(0, 0, 50);

scene.primitives.add(createBox(20, sunposs));

viewer.camera.flyTo({
  destination: new Cartesian3(-2764033.613852088, 4787666.170287514, 3171230.9780017845),
  orientation: {
    heading: 2.7046360461107177,
    pitch: -25.0 * Math.PI / 180,
    roll: 0.0
  }
});

viewer.screenSpaceEventHandler.setInputAction(function onLeftClick(
  movement
) {
  const lxs_pos=scene.pickPosition(movement.position);
  console.log(lxs_pos);  
},
ScreenSpaceEventType.LEFT_CLICK);

function createBox(box_num, sunposs) {
  const long = 30, width = 80, height = 100;
  const box_geom = BoxGeometry.fromDimensions({
    vertexFormat: VertexFormat.POSITION_AND_NORMAL,
    dimensions: new Cartesian3(long, width, height)
  });

  const inses = [];
  const boxcenters = [];
  const boxaxies = [];
  const grid_res = Math.ceil(Math.sqrt(box_num));
  let boxid = 0;
  for (let x = 0; x < grid_res; x++) {
    for (let y = 0; y < grid_res; y++) {
      const cur_pos = Cartesian3.fromDegrees(
        LNG + y * INTERVAL, LAT + x * INTERVAL
      );
      const localmatrix = Transforms.eastNorthUpToFixedFrame(cur_pos);
      const modelmatrix = Matrix4.multiplyByTranslation(
        localmatrix, new Cartesian3(0, 0, 50), new Matrix4());

      const geometry = BoxGeometry.createGeometry(box_geom);
      const positionAttr = geometry.attributes.position;
      const vertexCount = positionAttr.values.length / positionAttr.componentsPerAttribute;
      geometry.attributes.boxid = new GeometryAttribute({
        componentDatatype: ComponentDatatype.FLOAT,
        componentsPerAttribute: 1,
        values: new Float32Array((new Array(vertexCount)).fill(boxid))
      });

      const ins = new GeometryInstance({
        geometry: geometry,
        modelMatrix: modelmatrix,
      });
      inses.push(ins);
      const boxcenter = Matrix4.multiplyByPoint(modelmatrix, new Cartesian3(), new Cartesian3());
      const rotation = Matrix4.getRotation(localmatrix, new Matrix3());
      const box_x = new Cartesian3();
      Matrix3.multiplyByVector(rotation, box_axis_x, box_x);
      const box_y = new Cartesian3();
      Matrix3.multiplyByVector(rotation, box_axis_y, box_y);
      const box_z = new Cartesian3();
      Matrix3.multiplyByVector(rotation, box_axis_z, box_z);

      console.log(boxcenter);

      const encodeCenter = EncodedCartesian3.fromCartesian(boxcenter, new EncodedCartesian3());
      boxcenters.push(
        encodeCenter.high,
        encodeCenter.low
      );

      boxaxies.push(box_x, box_y, box_z);
      boxid++;
    }
  }

  console.log(boxaxies);

  const material = new Material({
    translucent: false,
    fabric: {
      uniforms: {
        lxs: { type: `vec3[${sunposs.length}]`, value: sunposs },
        boxcenters: { type: `vec3[${boxcenters.length}]`, value: boxcenters },
        boxaxies: { type: `vec3[${boxaxies.length}]`, value: boxaxies },
        rtc_lxs:new Cartesian3(-2764233.530084816, 4787599.944020384, 3170398.735383637)
      }
    }
  });
  const primitive = new Primitive({
    geometryInstances: inses,
    asynchronous: false,
    appearance: new MaterialAppearance({
      translucent: false,
      fragmentShaderSource: `#define FLT_MAX 3.402823466e+38
#define FLT_MIN -3.402823466e+38
#define DIST_THRESHOLD=3.;

in vec3 v_positionMC;
in vec3 v_positionEC;
in vec3 v_normalEC;
in float v_boxid;
in vec4 v_color;
in vec3 v_positionHigh;
in vec3 v_positionLow;
in vec3 v_normal;

struct lxs_planeset
{
  vec3 normal;
  float dfar;
  float dnear;
};

lxs_planeset createPlaneSet(vec3 center,vec3 axis,vec3 normal)
{
  vec3 point_far=center+axis;
  vec3 point_near=center-axis;
  float dfar=dot(normal,point_far);
  float dnear=dot(normal,point_near);
  lxs_planeset lxs=lxs_planeset(normal,dfar,dnear);
  return lxs;
}

bool intersect_PlaneSet(lxs_planeset planeset,vec3 origin,vec3 dir,out float intersect_far,out float intersect_near)
{
  float no=dot(planeset.normal,origin);
  float nr=dot(planeset.normal,dir);

  if(nr==0.0) return false;

  intersect_near=(planeset.dnear-no)/nr;
  intersect_far=(planeset.dfar-no)/nr;
  if(nr<0.){
    float temp=intersect_near;
    intersect_near=intersect_far;
    intersect_far=temp;
  }
  return true;
}

vec2 boxIntersect_lxs(vec3 pos,vec3 dir,vec3 boxcenter,vec3 axisx,vec3 axisy,vec3 axisz)
{
  int intersectcount=0;
  float temp_lxs=0.;
  vec3 x_nor=normalize(axisx);
  vec3 y_nor=normalize(axisy);
  vec3 z_nor=normalize(axisz);

  lxs_planeset x_plantset=createPlaneSet(boxcenter,axisx,x_nor);
  lxs_planeset y_plantset=createPlaneSet(boxcenter,axisy,y_nor);
  lxs_planeset z_plantset=createPlaneSet(boxcenter,axisz,z_nor);

  float near=FLT_MIN;
  float far=FLT_MAX;

  float tem_near,tem_far;

  bool x_intersected=intersect_PlaneSet(x_plantset,pos,dir,tem_far,tem_near);
  if(x_intersected){
    far=min(far,tem_far);
    near=max(near,tem_near);
  }

  bool y_intersected=intersect_PlaneSet(y_plantset,pos,dir,tem_far,tem_near);
  if(y_intersected){
    far=min(far,tem_far);
    near=max(near,tem_near);
  }

  bool z_intersected=intersect_PlaneSet(z_plantset,pos,dir,tem_far,tem_near);
  if(z_intersected){
    far=min(far,tem_far);
    near=max(near,tem_near);
  }
  return vec2(far,near);
}

// 一次光源下，空间位置同立方体相交的次数
float sunshine(int sunidx,vec3 pos,int boxcount,int boxidx){
  float intersectCount=0.;

  for(int i=0;i<boxcount;i++){
    vec3 boxcenter=boxcenters_1[i*2]+boxcenters_1[i*2+1]-rtc_lxs_3;
    vec3 axisx=boxaxies_2[i*3];
    vec3 axisy=boxaxies_2[i*3+1];
    vec3 axisz=boxaxies_2[i*3+2];
    vec3 dir=lxs_0[sunidx];
    vec3 lxs_pos=pos-rtc_lxs_3;

    //lxs
    vec2 lxs=boxIntersect_lxs(lxs_pos,dir,boxcenter,axisx,axisy,axisz);
    float enough_dist=step(3.,lxs.x-lxs.y);
    float min_near=step(3.,lxs.y);
    intersectCount += (enough_dist*min_near);
  }
  return intersectCount;
}

void main()
{
  vec3 positionToEyeEC = -v_positionEC;

  vec3 normalEC = normalize(v_normalEC);

  vec4 color = czm_gammaCorrect(v_color);

  czm_materialInput materialInput;
  materialInput.normalEC = normalEC;
  materialInput.positionToEyeEC = positionToEyeEC;
  czm_material material = czm_getDefaultMaterial(materialInput);
  material.diffuse = color.rgb;
  material.alpha = color.a;

  int suncount=lxs_0.length();
  int boxuniform_count=boxcenters_1.length()/2;
  float shinecount=0.;
  vec3 pos=v_positionHigh+v_positionLow;


  for(int i=0;i<suncount;i++){
    float lxs_front=dot(v_normal,lxs_0[i]);
    lxs_front=step(0.01,lxs_front);
    shinecount+=(1.-step(0.1,sunshine(i,pos,boxuniform_count,int(v_boxid))))*lxs_front;
  }
  // 噪声严重！！！
  // 单独计算一个立方体相交，结果尚可

  color=vec4(shinecount/13.,0.,0.,1.);
  out_FragColor=color;
}`,
      vertexShaderSource: `in vec3 position3DHigh;
in vec3 position3DLow;
in float batchId;
in float boxid;
in float compressedAttributes;

out vec3 v_positionMC;
out vec3 v_positionEC;
out vec3 v_normalEC;
out float v_boxid;
out vec4 v_color;
out vec3 v_positionHigh;
out vec3 v_positionLow;
out vec3 v_normal;


void main()
{
    vec4 p = czm_computePosition();

    v_positionMC = p.xyz;
    v_positionEC = (czm_modelViewRelativeToEye * p).xyz;
    vec3 normal=czm_octDecode(compressedAttributes);
    v_normalEC=czm_normal*normal;
    v_boxid=boxid;
    v_color=vec4(p.w/2.);
    v_positionHigh=position3DHigh;
    v_positionLow=position3DLow;
    v_normal=normal;

    gl_Position = czm_modelViewProjectionRelativeToEye * p;
}
`
    }),
  });
  primitive.appearance.material = material;

  return primitive;
}

function drawNormal(boxcenter, axisx, axisy, axisz) {
  const x1 = Cartesian3.add(boxcenter, axisx, new Cartesian3());
  const x1n = Cartesian3.add(x1, axisx, new Cartesian3());
  viewer.entities.add({
    polyline: {
      positions: [x1, x1n],
      material: Color.RED,
      width: 2
    }
  });

  const y1 = Cartesian3.add(boxcenter, axisy, new Cartesian3());
  const y1n = Cartesian3.add(y1, axisy, new Cartesian3());
  viewer.entities.add({
    polyline: {
      positions: [y1, y1n],
      material: Color.GREEN,
      width: 2
    }
  });

  const z1 = Cartesian3.add(boxcenter, axisz, new Cartesian3());
  const z1n = Cartesian3.add(z1, axisz, new Cartesian3());
  viewer.entities.add({
    polyline: {
      positions: [z1, z1n],
      material: Color.BLUE,
      width: 2
    }
  });

  const x2 = Cartesian3.subtract(boxcenter, axisx, new Cartesian3());
  const x2n = Cartesian3.subtract(x2, axisx, new Cartesian3());
  viewer.entities.add({
    polyline: {
      positions: [x2, x2n],
      material: Color.RED,
      width: 2
    }
  });

  const y2 = Cartesian3.subtract(boxcenter, axisy, new Cartesian3());
  const y2n = Cartesian3.subtract(y2, axisy, new Cartesian3());
  viewer.entities.add({
    polyline: {
      positions: [y2, y2n],
      material: Color.GREEN,
      width: 2
    }
  });

  const z2 = Cartesian3.add(boxcenter, axisz, new Cartesian3());
  const z2n = Cartesian3.add(z2, axisz, new Cartesian3());
  viewer.entities.add({
    polyline: {
      positions: [z2, z2n],
      material: Color.BLUE,
      width: 2
    }
  });
}

function debugRay(geometry, modelmatrix, dist) {
  const value = geometry.attributes.position.values;
  for (let i = 0; i < value.length; i += 3) {
    const origin = new Cartesian3();
    Matrix4.multiplyByPoint(modelmatrix,
      new Cartesian3(value[i], value[i + 1], value[i + 2]), origin);
    const dest = new Cartesian3();
    dest.x = origin.x + sunposs[0].x * dist;
    dest.y = origin.y + sunposs[0].y * dist;
    dest.z = origin.z + sunposs[0].z * dist;
    viewer.entities.add({
      polyline: {
        positions: [origin, dest],
        material: Color.YELLOW,
        width: 2
      }
    });
  }
}

function drawAxisOFBox(center, x, y, z) {
  viewer.entities.add({
    polyline: {
      positions: [
        center,
        Cartesian3.add(center, Cartesian3.multiplyByScalar(x, 2, new Cartesian3()), new Cartesian3())],
      material: Color.RED,
      width: 2
    }
  });

  viewer.entities.add({
    polyline: {
      positions: [
        center,
        Cartesian3.add(center, Cartesian3.multiplyByScalar(y, 2, new Cartesian3()), new Cartesian3())],
      material: Color.GREEN,
      width: 2
    }
  });

  viewer.entities.add({
    polyline: {
      positions: [
        center,
        Cartesian3.add(center, Cartesian3.multiplyByScalar(z, 2, new Cartesian3()), new Cartesian3())],
      material: Color.BLUE,
      width: 2
    }
  })
}
