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
} from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import "../src/css/main.css"
import GUI from "lil-gui";

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

const utc = JulianDate.fromDate(new Date("2023/06/23 10:30:00"));
viewer.clockViewModel.currentTime = JulianDate.addHours(utc, 8, new JulianDate());
const LAT = 30, LNG = 120, INTERVAL = 0.001;

const BOX_DIM = 100;
const blueBox = viewer.entities.add({
  name: "Blue box",
  position: Cartesian3.fromDegrees(LNG, LAT, 10),
  box: {
    dimensions: new Cartesian3(BOX_DIM, BOX_DIM, BOX_DIM),
    material: Color.BLUE,
  },
});

// let sunpos=new Cartesian3()
const sunBox = viewer.entities.add({
  name: "Blue box",
  position: Cartesian3.fromDegrees(LNG, LAT, 100),
  box: {
    dimensions: new Cartesian3(BOX_DIM, BOX_DIM, BOX_DIM),
    material: Color.RED,
  },
});


const box_geom = BoxGeometry.fromDimensions({
  vertexFormat: VertexFormat.POSITION_AND_NORMAL,
  dimensions: new Cartesian3(80, 30, 100)
});

scene.primitives.add(createBox(16));

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

function createBox(box_num) {
  const inses = [];
  const grid_res = Math.ceil(Math.sqrt(box_num));
  for (let x = 0; x < grid_res; x++) {
    for (let y = 0; y < grid_res; y++) {
      const cur_pos = Cartesian3.fromDegrees(
        LNG + y * INTERVAL, LAT + x * INTERVAL
        // LNG,LAT
      );
      const ins = new GeometryInstance({
        geometry: box_geom,
        modelMatrix: Matrix4.multiplyByTranslation(
          Transforms.eastNorthUpToFixedFrame(cur_pos), new Cartesian3(0, 0, 50), new Matrix4()),
        attributes: {
          color: ColorGeometryInstanceAttribute.fromColor(Color.WHITE)
        }
      });
      inses.push(ins);
    }
  }

  const material = new Material({
    translucent: false,
    fabric: {
      uniforms: {

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
    out_FragColor=vec4(1.,1.,0.,1.);
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