#define FLT_MAX 3.402823466e+38
#define FLT_MIN 1.175494351e-38

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
  lxs_planeset lxs=lxs_planeset(normal,dfar,dnear);
  return lxs;
}


int boxIntersect_lxs(vec3 pos,vec3 dir,vec3 center,vec3 axisx,vec3 axisy,vec3 axisz)
{
  int intersectcount=0;
  float temp_lxs=0.;
  vec3 x_nor=normalize(axisx);
  vec3 y_nor=normalize(axisy);
  vec3 z_nor=normalize(axisz);

  lxs_planeset x_plantset=createPlaneSet(center,axisx,x_nor);
  lxs_planeset y_plantset=createPlaneSet(center,axisy,y_nor);
  lxs_planeset z_plantset=createPlaneSet(center,axisz,z_nor);

  float x_no=dot(x_nor,pos);
  float y_no=dot(y_nor,pos);
  float z_no=dot(z_nor,pos);

  float near=FLT_MIN;
  float far=FLT_MAX;

  float x_nr=dot(x_nor,dir);
  float y_nr=dot(y_nor,dir);
  float z_nr=dot(z_nor,dir);

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
    far=min(far,z_tnear);
  }

  intersectcount+=far>near?1:0;

  return intersectcount;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec3 orgin=vec3(-2764159.2106625685, 4787584.193077054, 3170386.725764694);
    vec3 dest=vec3(-2763763.4605967975, 4787818.766259042, 3170582.5759822945);
    vec3 dir=dest-orgin;

    vec3 center=vec3(-2763933.4869667836, 4787659.169418869,3170469.7359385183);
    vec3 axisx=vec3(-17.34846646284802, 30.050345633867277, 19.89993564493492);
    vec3 axisy=vec3(-6.505584604118928, 11.26891147316329,  7.462506493709712);
    vec3 axisz=vec3(-21.68531100317445, 37.563088459116656,  24.8749205447611);
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord/iResolution.xy;

    // Time varying pixel color
    int lxs=boxIntersect_lxs(orgin,dir,center,axisx,axisy,axisz);
    vec3 col = vec3(lxs);

    // Output to screen
    fragColor = vec4(col,1.0);
}