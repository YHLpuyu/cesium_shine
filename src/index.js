import {
  Ion, Viewer, EncodedCartesian3,
  BoxGeometry,
  Cartesian3,
  VertexFormat,
  GeometryInstance,
  Matrix4,
  Transforms,
  Color,
  Primitive,
  JulianDate,
  Material,
  MaterialAppearance,
  Plane,
  CallbackProperty,
  Matrix3,
  ComponentDatatype,
  GeometryAttribute,
} from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import "../src/css/main.css"
import GUI from "lil-gui";

import { ComputeSunPos } from "./SunHelper";
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
Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3YWU3ZjI2YS03MTVlLTRlOTItOWRmZC0xYTJiMTRiYTc0MDAiLCJpZCI6MzY2NzcsImlhdCI6MTYzMTg1NTMwNH0.20xeGHU5b77CmOUM7bxXdB_gkGfdkCyNAI7T14cEME8';

const gui = new GUI();

// Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.
const viewer = new Viewer('cesiumContainer', {
  // terrainProvider: createWorldTerrain()
});
boxintersect(viewer, gui);
viewer.scene.globe.enableLighting = true;
viewer.shadows = true;
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
    //使用cesium的property
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

const box_axis_x = new Cartesian3(80, 0, 0);
const box_axis_y = new Cartesian3(0, 30, 0);
const box_axis_z = new Cartesian3(0, 0, 100);

scene.primitives.add(createBox(2, sunposs));
scene.primitives.add(createRefBox(surfacepos));
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
  // let local_south=null;
  for (let x = 0; x < grid_res; x++) {
    for (let y = 0; y < grid_res; y++) {
      const cur_pos = Cartesian3.fromDegrees(
        LNG + (y - 2 * x) * INTERVAL, LAT + x * INTERVAL
        // LNG,LAT
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

      // if(x===0) debugRay(geometry,modelmatrix,500);
      const boxcenter = Matrix4.multiplyByPoint(modelmatrix, new Cartesian3(), new Cartesian3());
      // store box info
      const rotation = Matrix4.getRotation(localmatrix, new Matrix3());
      const box_x = new Cartesian3(1, 0, 0);
      Matrix3.multiplyByVector(rotation, box_axis_x, box_x);
      const box_y = new Cartesian3();
      Matrix3.multiplyByVector(rotation, box_axis_y, box_y);
      const box_z = new Cartesian3();
      Matrix3.multiplyByVector(rotation, box_axis_z, box_z);

      const angle_xy = Cartesian3.angleBetween(box_x, box_y);
      const angle_xz = Cartesian3.angleBetween(box_x, box_z);
      const angle_yz = Cartesian3.angleBetween(box_y, box_z);

      console.log(Math.PI / 2);
      console.log(angle_xy, angle_xz, angle_yz);
      const encodeCenter = EncodedCartesian3.fromCartesian(boxcenter, new EncodedCartesian3());
      // cur_pos.z+=50;
      boxcenters.push(
        encodeCenter.high,
        encodeCenter.low
      );

      boxaxies.push(box_x, box_y, box_z);

      drawNormal(boxcenter, box_x, box_y, box_z);

      cur_pos.z += 50;
      // drawAxisOFBox(boxcenter, box_x, box_y, box_z);
      boxid++;
    }
  }

  const material = new Material({
    translucent: false,
    fabric: {
      uniforms: {
        lxs: { type: `vec3[${sunposs.length}]`, value: sunposs },
        boxcenters: { type: `vec3[${boxcenters.length}]`, value: boxcenters },
        boxaxies: { type: `vec3[${boxaxies.length}]`, value: boxaxies }
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

  // 平行，必不相交
  if(nr==0.0) return false;

  intersect_near=(planeset.dnear-no)/nr;
  intersect_far=(planeset.dfar-no)/nr;
  // 法向和射线反向，交换near,far
  if(nr<0.){
    float temp=intersect_near;
    intersect_near=intersect_far;
    intersect_far=temp;
  }
  return true;
}

int boxIntersect_lxs(vec3 pos,vec3 dir,vec3 boxcenter,vec3 axisx,vec3 axisy,vec3 axisz)
{
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

  intersectcount+=far>near && near>5. && far-near>1.?1:0;

  return intersectcount;
}

//is the point illuminate by sun
int sunshine(int sunidx,vec3 pos,int boxcount,int boxidx){
  int intersect=0;
  for(int i=0;i<boxcount;i++){
    if(i==boxidx) continue;
    vec3 boxcenter=boxcenters_1[i*2]+boxcenters_1[i*2+1];
    vec3 axisx=boxaxies_2[i*3];
    vec3 axisy=boxaxies_2[i*3+1];
    vec3 axisz=boxaxies_2[i*3+2];
    vec3 dir=lxs_0[sunidx];
    intersect+=boxIntersect_lxs(pos,dir,boxcenter,axisx,axisy,axisz);
  }
  return intersect>0?0:1;
}

void main()
{
  vec3 positionToEyeEC = -v_positionEC;

  vec3 normalEC = normalize(v_normalEC);
#ifdef FACE_FORWARD
  normalEC = faceforward(normalEC, vec3(0.0, 0.0, 1.0), -normalEC);
#endif

  vec4 color = czm_gammaCorrect(v_color);

  czm_materialInput materialInput;
  materialInput.normalEC = normalEC;
  materialInput.positionToEyeEC = positionToEyeEC;
  czm_material material = czm_getDefaultMaterial(materialInput);
  material.diffuse = color.rgb;
  material.alpha = color.a;

  // out_FragColor = czm_phong(normalize(positionToEyeEC), material, czm_lightDirectionEC);
    
  int suncount=lxs_0.length();
  int boxuniform_count=boxcenters_1.length()/2;
  int shinecount=0;
  vec3 pos=v_positionHigh+v_positionLow;
  for(int i=0;i<suncount;i++){
    //如果法线和太阳方向反向
    float lxs_dis=dot(v_normal,lxs_0[i]);
    if(lxs_dis<0.001) continue;
    shinecount+=sunshine(i,pos,boxuniform_count,int(v_boxid));
  }

  // show model coordinate
  // vec3 nor_mc=(v_positionMC+vec3(15.,40.,50.))/vec3(30.,80.,100.);

  color=vec4(float(shinecount),0.,0.,1.);
  float lxs=dot(v_normal,lxs_0[0]);
  // color=vec3(lxs,0.,0.);
  out_FragColor=color;
}
`,
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

    v_positionMC = p.xyz;           // position in model coordinates
    v_positionEC = (czm_modelViewRelativeToEye * p).xyz;     // position in eye coordinates
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
    // shadows: ShadowMode.ENABLED
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
    // if(value[i]<0) continue;
    // if(value[i+1]<0) continue;
    // if(value[i+2]>0) continue;
    const origin = new Cartesian3();
    Matrix4.multiplyByPoint(modelmatrix,
      new Cartesian3(value[i], value[i + 1], value[i + 2]), origin);
    const dest = new Cartesian3();
    dest.x = origin.x + sunposs[0].x * dist;
    dest.y = origin.y + sunposs[0].y * dist;
    dest.z = origin.z + sunposs[0].z * dist;

    // console.log("lxs origin",origin);
    // console.log("lxs dest",dest);

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
  // x axis
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