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

function intersect_PlaneSet(plantset,origin,dir){
  const no=dot(plantset.normal,origin);
  const nr=dot(plantset.normal,dir);
  let t_near=(plantset.dnear-no)/nr;
  let t_far=(plantset.dfar-no)/nr;
  if(nr<0){
    let temp=t_near;
    t_near=t_far;
    t_far=temp;
  }
  return {
    near:t_near,
    far:t_far
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

  let near=FLT_MIN;
  let far=FLT_MAX;

  const xlxs=intersect_PlaneSet(x_plantset,pos,dir);
  const ylxs=intersect_PlaneSet(y_plantset,pos,dir);
  const zlxs=intersect_PlaneSet(z_plantset,pos,dir);

  const x_nr=dot(x_nor,dir);
  const y_nr=dot(y_nor,dir);
  const z_nr=dot(z_nor,dir);

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

  intersectcount+=far>near?1:0;

  return intersectcount;
}

function boxintersect()
{
    // const orgin={x:-2764202.5119327577, y: 4787659.193077054, z: 3170436.725764694}
    // const dest={x: -2763806.7618669868, y: 4787893.766259042, z: 3170632.5759822945}
    
    const orgin={x: -2764159.2106625685, y: 4787584.193077054, z: 3170386.725764694}
    const dest={x: -2763763.4605967975, y: 4787818.766259042, z: 3170582.5759822945}
    
    const length=sub(dest,orgin)
    const dir=normalize(length);
    console.log(length);

    const center={x:-2763933.4869667836,y: 4787659.169418869,z:3170469.7359385183};
    const axisx= {x: -34.64171426197369, y: -19.998790788239386, z: 0};
    const axisy= {x: -6.495517776628589, y: 12.990250155094142, z: -6.494732378465549};
    const axisz= {x: 25.00075574592734, y: 0, z: 0};

    console.log("should intersect")
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