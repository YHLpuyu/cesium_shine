import { CallbackProperty, Cartesian3, Color } from "cesium";

const FLT_MAX = Number.POSITIVE_INFINITY;
const FLT_MIN = Number.NEGATIVE_INFINITY;

// struct lxs_planeset
// {
//   vec3 normal;
//   float dfar;
//   float dnear;
// };

function dot(v1, v2) {
  return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
}

function add(v1, v2) {
  return {
    x: v1.x + v2.x,
    y: v1.y + v2.y,
    z: v1.z + v2.z
  }
}

function sub(v1, v2) {
  return {
    x: v1.x - v2.x,
    y: v1.y - v2.y,
    z: v1.z - v2.z
  }
}

function normalize(v) {
  const dim = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
  return {
    x: v.x / dim,
    y: v.y / dim,
    z: v.z / dim
  }
}

function createPlaneSet(center, axis, normal) {
  const point_far = add(center, axis);
  const point_near = sub(center, axis);
  const dfar = dot(normal, point_far);
  const dnear = dot(normal, point_near);
  return {
    normal: normal,
    dfar: dfar,
    dnear: dnear
  }
}

function intersect_PlaneSet(plantset, orgin, dir) {
  const no = dot(plantset.normal, orgin);
  const nr = dot(plantset.normal, dir);
  let t_near = (plantset.dnear - no) / nr;
  let t_far = (plantset.dfar - no) / nr;
  if (nr < 0) {
    let temp = t_near;
    t_near = t_far;
    t_far = temp;
  }
  return {
    near: t_near,
    far: t_far
  }
}

function boxIntersect_lxs(pos, dir, center, axisx, axisy, axisz) {
  let intersectcount = 0;
  let temp_lxs = 0.;
  const x_nor = normalize(axisx);
  const y_nor = normalize(axisy);
  const z_nor = normalize(axisz);

  const x_plantset = createPlaneSet(center, axisx, x_nor);
  const y_plantset = createPlaneSet(center, axisy, y_nor);
  const z_plantset = createPlaneSet(center, axisz, z_nor);

  let near = FLT_MIN;
  let far = FLT_MAX;

  const xlxs = intersect_PlaneSet(x_plantset, pos, dir);
  const ylxs = intersect_PlaneSet(y_plantset, pos, dir);
  const zlxs = intersect_PlaneSet(z_plantset, pos, dir);

  const ffar = Math.min(xlxs.far, ylxs.far, zlxs.far);
  const fnear = Math.max(xlxs.near, ylxs.near, zlxs.near);

  // const x_nr=dot(x_nor,dir);
  // const y_nr=dot(y_nor,dir);
  // const z_nr=dot(z_nor,dir);

  // if(x_nr!=0.){
  //   let x_tnear=(x_plantset.dnear-x_no)/x_nr;
  //   let x_tfar=(x_plantset.dfar-x_no)/x_nr;
  //   if(x_nr<0.) {temp_lxs=x_tnear;x_tnear=x_tfar;x_tfar=temp_lxs;}
  //   near=Math.max(near,x_tnear);
  //   far=Math.min(far,x_tfar);
  // }

  // if(y_nr!=0.){
  //   let y_tnear=(y_plantset.dnear-y_no)/y_nr;
  //   let y_tfar=(y_plantset.dfar-y_no)/y_nr;
  //   if(y_nr<0.) {temp_lxs=y_tnear;y_tnear=y_tfar;y_tfar=temp_lxs;}
  //   near=Math.max(near,y_tnear);
  //   far=Math.min(far,y_tfar);
  // }

  // if(z_nr!=0.){
  //   let z_tnear=(z_plantset.dnear-z_no)/z_nr;
  //   let z_tfar=(z_plantset.dfar-z_no)/z_nr;
  //   if(z_nr<0.) {temp_lxs=z_tnear;z_tnear=z_tfar;z_tfar=temp_lxs;}
  //   near=Math.max(near,z_tnear);
  //   far=Math.min(far,z_tfar);
  // }

  intersectcount += ffar > fnear && ffar>0 ? 1 : 0;
  console.log(ffar,fnear);
  return intersectcount;
}

function boxintersect(viewer,gui) {
  // const orgin={x:-2764202.5119327577, y: 4787659.193077054, z: 3170436.725764694}
  // const dest={x: -2763806.7618669868, y: 4787893.766259042, z: 3170632.5759822945}

  const points = [
    -2764168.6305355495,
    4787710.508775658,
    3170389.094367486,
    -2764194.611297663,
    4787695.508775658,
    3170389.094367486,
    -2764174.611297663,
    4787660.867759506,
    3170458.3763997885,
    -2764148.6305355495,
    4787675.867759506,
    3170458.3763997885,
    -2764125.3292653603,
    4787635.508775658,
    3170339.094367486,
    -2764151.3100274736,
    4787620.508775658,
    3170339.094367486,
    -2764131.3100274736,
    4787585.867759506,
    3170408.3763997885,
    -2764105.3292653603,
    4787600.867759506,
    3170408.3763997885,
    -2764151.3100274736,
    4787620.508775658,
    3170339.094367486,
    -2764131.3100274736,
    4787585.867759506,
    3170408.3763997885,
    -2764174.611297663,
    4787660.867759506,
    3170458.3763997885,
    -2764194.611297663,
    4787695.508775658,
    3170389.094367486,
    -2764125.3292653603,
    4787635.508775658,
    3170339.094367486,
    -2764105.3292653603,
    4787600.867759506,
    3170408.3763997885,
    -2764148.6305355495,
    4787675.867759506,
    3170458.3763997885,
    -2764168.6305355495,
    4787710.508775658,
    3170389.094367486,
    -2764105.3292653603,
    4787600.867759506,
    3170408.3763997885,
    -2764131.3100274736,
    4787585.867759506,
    3170408.3763997885,
    -2764174.611297663,
    4787660.867759506,
    3170458.3763997885,
    -2764148.6305355495,
    4787675.867759506,
    3170458.3763997885,
    -2764125.3292653603,
    4787635.508775658,
    3170339.094367486,
    -2764151.3100274736,
    4787620.508775658,
    3170339.094367486,
    -2764194.611297663,
    4787695.508775658,
    3170389.094367486,
    -2764168.6305355495,
    4787710.508775658,
    3170389.094367486
  ]

  const dir = { x: 0.7915001315420431, y: 0.46914636397626086, z: 0.3917004352011649 };

  const center = {x: -2764149.9702815115, y: 4787648.188267582, z: 3170398.7353836372 };
  const axisx = { x: -12.99038105676658, y: -7.499999999999998, z: 0};
  const axisy = { x: 9.999999999999996, y: -17.32050807568877, z: 34.64101615137755};
  const axisz = { x: -21.650635094610966, y: 37.50000000000001, z: 24.999999999999996};

  console.log("should intersect")
  // const orgin={x:-1,y:-1,z:-1};
  // const dest={x:2,y:2,z:2};
  // const dir=normalize(sub(dest,orgin));
  // const center={x:0,y:0,z:0};
  // const axisx={x:1,y:0,z:0};
  // const axisy={x:0,y:1,z:0};
  // const axisz={x:0,y:0,z:1};

  const idx=[];
  for(let i=0;i<24;i++) idx.push(i);
  const guiprop={
    idx:0
  }
  const o=new Cartesian3(points[0],points[1],points[2]);
  const d=new Cartesian3(points[0],points[1],points[2]);
  const rayline=viewer.entities.add({
    polyline:{
      positions:new CallbackProperty(()=>{
        return [o,d];
      },false),
      material:Color.YELLOW,
      width:2
    }
  });
  gui.add(guiprop,"idx",idx).onChange(v=>{
    const orgin = { x: points[v*3], y: points[v*3 + 1], z: points[v*3 + 2] };
    const lxs = boxIntersect_lxs(orgin, dir, center, axisx, axisy, axisz);

    o.x=orgin.x;o.y=orgin.y;o.z=orgin.z;
    d.x=orgin.x+dir.x*100;d.y=orgin.y+dir.y*100;d.z=orgin.z+dir.z*100;
    console.log(orgin);
    console.log(lxs > 0 ? "lxs intersect" : "lxs");
  });
  
  for (let i = 0; i < points.length; i += 3) {
    
  }
}

export { boxintersect }