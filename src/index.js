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
} from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import "../src/css/main.css"
import GUI from "lil-gui";

import { ComputeSunPos } from "./SunHelper";
import { createTangentPlane } from "./lxshelper";

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
console.log(scene);

const suninitpos = Cartesian3.fromDegrees(120, 30, 200);

const utc = JulianDate.fromDate(new Date("2023/06/23 21:00:00"));
viewer.clockViewModel.currentTime = JulianDate.addHours(utc, 8, new JulianDate());

const blueBox = viewer.entities.add({
  name: "Blue box",
  position: Cartesian3.fromDegrees(120, 30.0, 200),
  box: {
    dimensions: new Cartesian3(50, 50, 50),
    material: Color.BLUE,
  },
});

const surfacepos = Cartesian3.fromDegrees(120, 30, 200);
const ellipsoid = scene.globe.ellipsoid;
const nor = ellipsoid.geodeticSurfaceNormal(surfacepos);
const dist = Cartesian3.magnitude(surfacepos);
const tgplane = new Plane(nor, dist);
const bluePlane = viewer.entities.add({
  name: "Blue plane",
  position: surfacepos,
  plane: {
    plane: new Plane(Cartesian3.UNIT_Z, 0),
    dimensions: new Cartesian2(400.0, 300.0),
    material: Color.YELLOW,
  },
});

const startDate = JulianDate.fromDate(new Date("2023/06/23 20:00:00"));
const hours = 24;
const sunposs = [];
for (let i = 0; i < hours; i++) {
  const date = new JulianDate();
  JulianDate.addHours(startDate, i, date);
  let sunpos = ComputeSunPos(date);
  const dir = new Cartesian3();
  Cartesian3.subtract(sunpos, suninitpos, dir);
  Cartesian3.normalize(dir, dir);
  const dist = Plane.getPointDistance(tgplane, sunpos);
  if (dist > 0) {
    console.log(JulianDate.toDate(date));
    sunposs.push(dir);
  }
}
console.log(sunposs);

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


const box_geom = BoxGeometry.fromDimensions({
  vertexFormat: VertexFormat.POSITION_AND_NORMAL,
  dimensions: new Cartesian3(80, 30, 100)
});
const box_axis_x = new Cartesian3(40, 0, 0);
const box_axis_y = new Cartesian3(0, 15, 0);
const box_axis_z = new Cartesian3(0, 0, 50);

scene.primitives.add(createBox(16,sunposs));

scene.preRender.addEventListener(function (s, t) {
  let sunpos = new Cartesian3();
  Simon1994PlanetaryPositions.computeSunPositionInEarthInertialFrame(viewer.clockViewModel.currentTime, sunpos);
  console.log(viewer.clockViewModel.currentTime);
  let dir=new Cartesian3();
  Cartesian3.subtract(sunpos,blueBox.position._value,dir);
  Cartesian3.normalize(dir,dir);

  const r=new Ray(blueBox.position._value,dir);

  sunBox.position.setValue(Ray.getPoint(r,200));

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
  const inses = [];
  const boxinfos = [];
  const grid_res = Math.ceil(Math.sqrt(box_num));
  for (let x = 0; x < grid_res; x++) {
    for (let y = 0; y < grid_res; y++) {
      const cur_pos = Cartesian3.fromDegrees(
        LNG + y * INTERVAL, LAT + x * INTERVAL
        // LNG,LAT
      );
      const localmatrix=Transforms.eastNorthUpToFixedFrame(cur_pos);
      const modelmatrix = Matrix4.multiplyByTranslation(
        localmatrix, new Cartesian3(0, 0, 50), new Matrix4());
      const ins = new GeometryInstance({
        geometry: box_geom,
        modelMatrix: modelmatrix,
        attributes: {
          color: ColorGeometryInstanceAttribute.fromColor(Color.WHITE)
        }
      });
      inses.push(ins);

      // store box info
      const box_x=new Cartesian3();
      Matrix4.multiplyByPoint(localmatrix,box_axis_x,box_x);
      const box_y=new Cartesian3();
      Matrix4.multiplyByPoint(localmatrix,box_axis_y,box_y);
      const box_z=new Cartesian3();
      Matrix4.multiplyByPoint(localmatrix,box_axis_z,box_z);
      boxinfos.push(
        cur_pos,
        box_x,
        box_y,
        box_z
      );
    }
  }

  const material = new Material({
    translucent: false,
    fabric: {

      uniforms: {
        lxs: { type: `vec3[${sunposs.length}]`, value: sunposs },
        boxs:{type:`vec3[${boxinfos.length}]`,value:boxinfos}
      }
    }
  });
  const primitive = new Primitive({
    geometryInstances: inses,
    appearance: new MaterialAppearance({
      translucent: false,
      fragmentShaderSource: `
      in vec3 v_positionMC;
in vec3 v_positionEC;
in vec2 v_st;

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
  float dfar=-dot(normal,point_far);
  float dnear=-dot(normal,point_near);
  lxs_planeset lxs=lxs_plane(normal,dfar,dnear);
  return lxs;
}

bool boxIntersect(vec3 center,vec3 axisx,vec3 axisy,vec3 axisz,vec3 pos)
{
  vec3 x_nor=normalize(axisx);
  vec3 y_nor=normalize(axisy);
  vec3 z_nor=normalize(axisz);

  lxs_plane x_plantset= createPlane(center,axisx,x_nor);
  lxs_plane y_plantset=createPlane(center,axisy,y_nor);
  lxs_plane z_plantset=createPlane(center,axisz,z_nor);
  int suncount=lxs_0.length();

  float x_no=dot(x_nor,pos);
  float y_no=dot(y_nor,pos);
  float z_no=dot(z_nor,pos);

  for(int i=0;i<suncount;i++){
    float x_nr=dot(x_nor,lxs_0[i]);
    float y_nr=dot(y_nor,lxs_0[i]);
    float z_nr=dot(z_nor,lxs_0[i]);

    float x_tnear=(x_plantset.dnear-x_no)/x_nr;
    float x_tfar=(x_plantset.dfar-x_no)/x_nr;
    float y_tnear=(y_plantset.dnear-y_no)/y_nr;
    float y_tfar=(x_plantset.dfar-y_no)/y_nr;
    float z_tnear=(z_plantset.dnear-z_no)/z_nr;
    float z_tfar=(z_plantset.dfar-z_no)/z_nr;
  }
  return false;
}

void main()
{
    czm_materialInput materialInput;

    vec3 normalEC = normalize(czm_normal3D * czm_geodeticSurfaceNormal(v_positionMC, vec3(0.0), vec3(1.0)));
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

#ifdef FLAT
    out_FragColor = vec4(material.diffuse + material.emission, material.alpha);
#else
    // out_FragColor = czm_phong(normalize(positionToEyeEC), material, czm_lightDirectionEC);
    out_FragColor=vec4(lxs_0[0],1.);
#endif
}
`,
      vertexShaderSource: `in vec3 position3DHigh;
in vec3 position3DLow;
in vec2 st;
in float batchId;

out vec3 v_positionMC;
out vec3 v_positionEC;
out vec2 v_st;

void main()
{
    vec4 p = czm_computePosition();

    v_positionMC = position3DHigh + position3DLow;           // position in model coordinates
    v_positionEC = (czm_modelViewRelativeToEye * p).xyz;     // position in eye coordinates
    v_st = st;

    gl_Position = czm_modelViewProjectionRelativeToEye * p;
}
`
    }),
    shadows: ShadowMode.ENABLED
  });
  primitive.appearance.material = material;
  return primitive;
}

