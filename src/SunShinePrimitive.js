import { defined } from "cesium";

class SunShinePrimitive{
    constructor(options){
        this.drawCommand=undefined;
        this.geometryInstances=options.instances;
    }

    createCommand(context){
        if(!defined(this.geometryInstances)) return;
        
    }
}