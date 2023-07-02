const FLT_MAX = Number.POSITIVE_INFINITY;
const FLT_MIN = Number.NEGATIVE_INFINITY;

// struct lxs_planeset
// {
//   vec3 normal;
//   float dfar;
//   float dnear;
// };

function dot(v1,v2){
    return v1.x*v2.x+v1.y*v2.y+v1.z*v2.z;
}

function add(v1,v2){
    return {
        x:v1.x+v2.x,
        y:v1.y+v2.y,
        z:v1.z+v2.z
    }
}

function sub(v1,v2){
    return {
        x:v1.x-v2.x,
        y:v1.y-v2.y,
        z:v1.z-v2.z
    }
}

function normalize(v){
    const dim=Math.sqrt(v.x*v.x+v.y*v.y+v.z*v.z);
    return {
        x:v.x/dim,
        y:v.y/dim,
        z:v.z/dim
    }
}

function createPlaneSet(center,axis,normal)
{
  const point_far=add(center,axis);
  const point_near=sub(center,axis);
  const dfar=dot(normal,point_far);
  const dnear=dot(normal,point_near);
  return {
    normal:normal,
    dfar:dfar,
    dnear:dnear
  }
}


function boxIntersect_lxs(pos,dir,center,axisx,axisy,axisz)
{
  let intersectcount=0;
  let temp_lxs=0.;
  const x_nor=normalize(axisx);
  const y_nor=normalize(axisy);
  const z_nor=normalize(axisz);

  const x_plantset=createPlaneSet(center,axisx,x_nor);
  const y_plantset=createPlaneSet(center,axisy,y_nor);
  const z_plantset=createPlaneSet(center,axisz,z_nor);

  const x_no=dot(x_nor,pos);
  const y_no=dot(y_nor,pos);
  const z_no=dot(z_nor,pos);

  let near=FLT_MIN;
  let far=FLT_MAX;

  const x_nr=dot(x_nor,dir);
  const y_nr=dot(y_nor,dir);
  const z_nr=dot(z_nor,dir);

  if(x_nr!=0.){
    const x_tnear=(x_plantset.dnear-x_no)/x_nr;
    const x_tfar=(x_plantset.dfar-x_no)/x_nr;
    if(x_nr<0.) {temp_lxs=x_tnear;x_tnear=x_tfar;x_tfar=temp_lxs;}
    near=Math.max(near,x_tnear);
    far=Math.min(far,x_tfar);
  }

  if(y_nr!=0.){
    const y_tnear=(y_plantset.dnear-y_no)/y_nr;
    const y_tfar=(x_plantset.dfar-y_no)/y_nr;
    if(y_nr<0.) {temp_lxs=y_tnear;y_tnear=y_tfar;y_tfar=temp_lxs;}
    near=Math.max(near,y_tnear);
    far=Math.min(far,y_tfar);
  }

  if(z_nr!=0.){
    const z_tnear=(z_plantset.dnear-z_no)/z_nr;
    const z_tfar=(z_plantset.dfar-z_no)/z_nr;
    if(z_nr<0.) {temp_lxs=z_tnear;z_tnear=z_tfar;z_tfar=temp_lxs;}
    near=Math.max(near,z_tnear);
    far=Math.min(far,z_tfar);
  }

  intersectcount+=far>near?1:0;

  return intersectcount;
}

function boxintersect()
{
    const orgin={x:-2764202.5119327577, y: 4787659.193077054, z: 3270436.725764694}
    const dest={x: -2763806.7618669868, y: 4787893.766259042, z: 3370632.5759822945}
    const dir=normalize(sub(dest,orgin));

    const center={x:-2763933.4869667836,y: 4787659.169418869,z:3170469.7359385183};
    const axisx= {x:-17.34846646284802,y: 30.050345633867277,z: 19.89993564493492};
    const axisy= {x:-6.505584604118928,y: 11.26891147316329, z: 7.462506493709712};
    const axisz= {x:-21.68531100317445,y: 37.563088459116656,z:  24.8749205447611};

    // const orgin={x:-1,y:-1,z:-1};
    // const dest={x:2,y:2,z:2};
    // const dir=normalize(sub(dest,orgin));
    // const center={x:0,y:0,z:0};
    // const axisx={x:1,y:0,z:0};
    // const axisy={x:0,y:1,z:0};
    // const axisz={x:0,y:0,z:1};


    const lxs=boxIntersect_lxs(orgin,dir,center,axisx,axisy,axisz);
    console.log(lxs>0?"lxs intersect":"lxs");
    return lxs;
}

export {boxintersect}