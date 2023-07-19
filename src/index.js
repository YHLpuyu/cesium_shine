import {
  Ion, Viewer, createWorldTerrain,
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
} from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import "../src/css/main.css"
import GUI from "lil-gui";

import { ComputeSunPos } from "./SunHelper";
import { createTangentPlane } from "./lxshelper";
import { boxintersect } from "./boxintersect";

boxintersect();
// Your access token can be found at: https://cesium.com/ion/tokens.
// This is the default access token
Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3YWU3ZjI2YS03MTVlLTRlOTItOWRmZC0xYTJiMTRiYTc0MDAiLCJpZCI6MzY2NzcsImlhdCI6MTYzMTg1NTMwNH0.20xeGHU5b77CmOUM7bxXdB_gkGfdkCyNAI7T14cEME8';

const gui = new GUI();

// Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.
const viewer = new Viewer('cesiumContainer', {
  // terrainProvider: createWorldTerrain()
});
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
viewer.clockViewModel.currentTime=startDate;
const hours = 1;
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

gui.add(lxs, "dist").listen();

gui.add(suninitpos, "x").onChange(v => {
  blueBox.position.setValue(suninitpos);
})

const LAT = 30, LNG = 120, INTERVAL = 0.001;

const box_axis_x = new Cartesian3(40, 0, 0);
const box_axis_y = new Cartesian3(0, 15, 0);
const box_axis_z = new Cartesian3(0, 0, 50);

scene.primitives.add(createBox(2, sunposs));

scene.preRender.addEventListener(function (s, t) {
  // let sunpos = ComputeSunPos(viewer.clockViewModel.currentTime);
  // console.log(viewer.clockViewModel.currentTime);
  // let dir=new Cartesian3();
  // Cartesian3.subtract(sunpos,blueBox.position._value,dir);
  // Cartesian3.normalize(dir,dir);

  // const r=new Ray(blueBox.position._value,dir);

  // sunBox.position.setValue(Ray.getPoint(r,200));

});

viewer.camera.flyTo({
  destination: new Cartesian3(-2764033.613852088, 4787666.170287514, 3171230.9780017845),
  orientation: {
    heading: 2.7046360461107177,
    pitch: -25.0 * Math.PI / 180,
    roll: 0.0
  }
});

const dir = new Cartesian3();
const dis = new Cartesian3;
scene.preRender.addEventListener((s, t) => {
  let sunpos = ComputeSunPos(
    viewer.clockViewModel.currentTime
  );
  // lxs.dist = Plane.getPointDistance(tgplane, sunpos);
  Cartesian3.subtract(sunpos, suninitpos, dir);
  Cartesian3.normalize(dir, dir);
  Cartesian3.multiplyByScalar(dir, 300, dis);
  Cartesian3.add(suninitpos, dis, lxs.positions[1]);
  // console.log(plane_dist);
  // Cartesian3.multiplyByScalar(sundir,100,sundir);
  // Cartesian3.normalize(sunpos,sunpos);
  // // console.log(sunpos);
  // Cartesian3.multiplyByScalar(sunpos,100,sunpos);

  // const sunpos =new Cartesian3();
  // Cartesian3.add(suninitpos,sunpos,sunpos);
  // blueBox.position.setValue(sunpos);
  // 需要知道什么时候天黑
})



function createBox(box_num, sunposs) {
  const long=80,width=30,height=100;
  const box_geom = BoxGeometry.fromDimensions({
    vertexFormat: VertexFormat.POSITION_AND_NORMAL,
    dimensions: new Cartesian3(long, width, height)
  });

  const inses = [];
  const boxinfos = [];
  const grid_res = Math.ceil(Math.sqrt(box_num));
  let boxid = 0;
  // let local_south=null;
  for (let x = 0; x < grid_res; x++) {
    for (let y = 0; y < grid_res-1; y++) {
      const cur_pos = Cartesian3.fromDegrees(
        LNG + (y-2*x) * INTERVAL, LAT + x * INTERVAL
        // LNG,LAT
      );
      const localmatrix = Transforms.eastNorthUpToFixedFrame(cur_pos);
      const modelmatrix = Matrix4.multiplyByTranslation(
        localmatrix, new Cartesian3(0, 0, 50), new Matrix4());
      const geometry=BoxGeometry.createGeometry(box_geom);
      const positionAttr=geometry.attributes.position;
      const vertexCount=positionAttr.values.length/positionAttr.componentsPerAttribute;
      geometry.attributes.boxid=new GeometryAttribute({
        componentDatatype:ComponentDatatype.FLOAT,
        componentsPerAttribute:1,
        values:new Float32Array((new Array(vertexCount)).fill(boxid))
      });

      const ins = new GeometryInstance({
        geometry: geometry,
        modelMatrix: modelmatrix,
      });
      inses.push(ins);

      if(x===0) debugRay(geometry,modelmatrix,500);

      // store box info
      const rotation=Matrix4.getRotation(modelmatrix,new Matrix4());
      const box_x = new Cartesian3();
      Matrix4.multiplyByPoint(rotation, box_axis_x, box_x);
      // Cartesian3.normalize(box_x,box_x);
      // Cartesian3.multiplyByScalar(box_x,long*0.5,box_x);
      const box_y = new Cartesian3();
      Matrix4.multiplyByPoint(rotation, box_axis_y, box_y);
      // Cartesian3.normalize(box_y,box_y);
      // Cartesian3.multiplyByScalar(box_y,width*0.5,box_y);
      const box_z = new Cartesian3();
      Matrix4.multiplyByPoint(rotation, box_axis_z, box_z);
      // Cartesian3.normalize(box_z,box_z);
      // Cartesian3.multiplyByScalar(box_z,height*0.5,box_z);
      boxinfos.push(
        cur_pos,
        box_x,
        box_y,
        box_z
      );

      cur_pos.z+=50;
      drawAxisOFBox(cur_pos,box_x,box_y,box_z);
      boxid++;
    }
  }

  const material = new Material({
    translucent: false,
    fabric: {

      uniforms: {
        lxs: { type: `vec3[${sunposs.length}]`, value: sunposs },
        boxs: { type: `vec3[${boxinfos.length}]`, value: boxinfos },
      }
    }
  });
  const primitive = new Primitive({
    geometryInstances: inses,
    asynchronous: false,
    appearance: new MaterialAppearance({
      translucent: false,
      fragmentShaderSource: `#define FLT_MAX 3.402823466e+38
#define FLT_MIN 1.175494351e-38

in vec3 v_positionMC;
in vec3 v_positionEC;
in vec2 v_st;
in vec3 v_normal;
in float v_boxid;

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

int boxIntersect_lxs(int sunidx,int boxuniformidx,vec3 pos)
{
  int intersectcount=0;
  float temp_lxs=0.;
  vec3 x_nor=normalize(boxs_1[boxuniformidx+1]);
  vec3 y_nor=normalize(boxs_1[boxuniformidx+2]);
  vec3 z_nor=normalize(boxs_1[boxuniformidx+3]);

  lxs_planeset x_plantset=createPlaneSet(boxs_1[boxuniformidx],boxs_1[boxuniformidx+1],x_nor);
  lxs_planeset y_plantset=createPlaneSet(boxs_1[boxuniformidx],boxs_1[boxuniformidx+2],y_nor);
  lxs_planeset z_plantset=createPlaneSet(boxs_1[boxuniformidx],boxs_1[boxuniformidx+3],z_nor);

  float x_no=dot(x_nor,pos);
  float y_no=dot(y_nor,pos);
  float z_no=dot(z_nor,pos);

  float near=FLT_MIN;
  float far=FLT_MAX;

  float x_nr=dot(x_nor,lxs_0[sunidx]);
  float y_nr=dot(y_nor,lxs_0[sunidx]);
  float z_nr=dot(z_nor,lxs_0[sunidx]);

  if(x_nr!=0.){
    float x_tnear=(x_plantset.dnear-x_no)/x_nr;
    float x_tfar=(x_plantset.dfar-x_no)/x_nr;
    if(x_nr<0.) {temp_lxs=x_tnear;x_tnear=x_tfar;x_tfar=temp_lxs;}
    near=max(near,x_tnear);
    far=min(far,x_tfar);
  }

  if(y_nr!=0.){
    float y_tnear=(y_plantset.dnear-y_no)/y_nr;
    float y_tfar=(x_plantset.dfar-y_no)/y_nr;
    if(y_nr<0.) {temp_lxs=y_tnear;y_tnear=y_tfar;y_tfar=temp_lxs;}
    near=max(near,y_tnear);
    far=min(far,y_tfar);
  }

  if(z_nr!=0.){
    float z_tnear=(z_plantset.dnear-z_no)/z_nr;
    float z_tfar=(z_plantset.dfar-z_no)/z_nr;
    if(z_nr<0.) {temp_lxs=z_tnear;z_tnear=z_tfar;z_tfar=temp_lxs;}
    near=max(near,z_tnear);
    far=min(far,z_tfar);
  }

  intersectcount+=far>near?1:0;

  return intersectcount;
}

//is the point illuminate by sun
int sunshine(int sunidx,vec3 pos,int boxuniform_count,int boxidx){
  int intersect=0;
  int boxcount=boxs_1.length();
  for(int i=0;i<boxuniform_count;i+=4){
    if(i/4==boxidx) continue;
    intersect+=boxIntersect_lxs(sunidx,i,pos);
  }
  return intersect>0?1:0;
}

void main()
{
    czm_materialInput materialInput;

    vec3 normalMC=czm_geodeticSurfaceNormal(v_positionMC, vec3(0.0), vec3(1.0));
    vec3 normalEC = normalize(czm_normal3D * normalMC);
#ifdef FACE_FORWARD
    normalEC = faceforward(normalEC, vec3(0.0, 0.0, 1.0), -normalEC);
#endif

    materialInput.s = v_st.s;
    materialInput.st = v_st;
    materialInput.str = vec3(v_st, 0.0);

    // Convert tangent space material normal to eye space
    materialInput.normalEC = normalEC;
    materialInput.tangentToEyeMatrix = czm_eastNorthUpToEyeCoordinates(v_positionMC, materialInput.normalEC);

    // Convert view vector to world space
    vec3 positionToEyeEC = -v_positionEC;
    materialInput.positionToEyeEC = positionToEyeEC;

    czm_material material = czm_getMaterial(materialInput);
    
    int suncount=lxs_0.length();
    int boxuniform_count=boxs_1.length();
    int shinecount=0;
    for(int i=0;i<suncount;i++){
      shinecount+=sunshine(i,v_positionMC,boxuniform_count,int(v_boxid));
    }

    vec3 color=vec3(float(shinecount/suncount),0.,0.);
    // float lxs=dot(v_normal,lxs_0[0]);
    // color=vec3(lxs,0.,0.);
    out_FragColor=vec4(color,1.);
}
`,
      vertexShaderSource: `in vec3 position3DHigh;
in vec3 position3DLow;
in vec2 st;
in float batchId;
in float boxid;

// uniform vec3 localsouth_2;

out vec3 v_positionMC;
out vec3 v_positionEC;
out vec2 v_st;
out vec3 v_normal;
out float v_boxid;


void main()
{
    vec4 p = czm_computePosition();

    v_positionMC = position3DHigh + position3DLow;           // position in model coordinates
    v_positionEC = (czm_modelViewRelativeToEye * p).xyz;     // position in eye coordinates
    v_st = st;
    v_normal=czm_octDecode(compressedAttributes);
    v_boxid=boxid;
    // float dotnorm_south=dot(v_normal,localsouth_2);
    // if(dotnorm_south<-.001)v_normal=vec3(0.);
    gl_Position = czm_modelViewProjectionRelativeToEye * p;
}
`
    }),
    // shadows: ShadowMode.ENABLED
  });
  primitive.appearance.material = material;

  console.log("lxs boxs:",boxinfos);

  return primitive;
}

function debugRay(geometry,modelmatrix,dist){
  const value=geometry.attributes.position.values;
  for(let i=0;i<value.length;i+=3){
    if(value[i+2]>0) continue;
    if(value[i]<0) continue;
    if(value[i+1]<0) continue;
    const origin=new Cartesian3();
    Matrix4.multiplyByPoint(modelmatrix,
      new Cartesian3(value[i],value[i+1],value[i+2]),origin);
    const dest=new Cartesian3();
    dest.x=origin.x+sunposs[0].x*dist;
    dest.y=origin.y+sunposs[0].y*dist;
    dest.z=origin.z+sunposs[0].z*dist;

    console.log("lxs origin",origin);
    console.log("lxs dest",dest);

    viewer.entities.add({
      polyline:{
        positions:[origin,dest],
        material:Color.YELLOW,
        width:2
      }
    });
  }
}

function drawAxisOFBox(center,x,y,z){
  // x axis
  viewer.entities.add({
    polyline:{
      positions:[
        center,
        Cartesian3.add(center,Cartesian3.multiplyByScalar(x,2,new Cartesian3()),new Cartesian3())],
      material:Color.RED,
      width:2
    }
  });

  viewer.entities.add({
    polyline:{
      positions:[
        center,
        Cartesian3.add(center,Cartesian3.multiplyByScalar(y,2,new Cartesian3()),new Cartesian3())],
      material:Color.GREEN,
      width:2
    }
  });

  viewer.entities.add({
    polyline:{
      positions:[
        center,
        Cartesian3.add(center,Cartesian3.multiplyByScalar(z,2,new Cartesian3()),new Cartesian3())],
      material:Color.BLUE,
      width:2
    }
  })
}