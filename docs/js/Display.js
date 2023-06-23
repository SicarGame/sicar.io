import {
     EffectComposer,
     BloomEffect,
     RenderPass,
     EffectPass,
     BlendFunction,
     KernelSize
} from "postprocessing"

import {
     WebGLRenderer,
     PerspectiveCamera,
     Scene,
     HalfFloatType,
     Object3D,
     Vector2
} from "three";

import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export class Display {

     canvas = document.createElement("canvas");

     renderer = new WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true });

     composer = new EffectComposer(this.renderer, {
          alpha: true,
          multisampling: 8,
          frameBufferType: HalfFloatType
     });

     camera = new PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);

     scene = new Scene();

     /**
      * @type {Object3D}
      */
     logo;

     loaders = {

          gltf: new GLTFLoader(),
     }

     effects = {

          bloom: new BloomEffect({
               blendFunction: BlendFunction.SCREEN,
               kernelSize: KernelSize.LARGE,
               luminanceThreshold: 0.9,
               luminanceSmoothing: 0.025,
               intensity: 2,
               height: 720,
               width: 1280,
               mipmapBlur: true,
          }),
     };

     passes = {

          render: new RenderPass(this.scene, this.camera),

          bloom: new EffectPass(this.camera, this.effects.bloom),
     };

     mouse = new Vector2();

     constructor(viewport) {

          this.composer.addPass(this.passes.render);

          this.composer.addPass(this.passes.bloom);

          this.scene.add(this.camera)

          viewport.appendChild(this.canvas);

          this.renderer.useLegacyLights = false;

          this.size();

          addEventListener("resize", this.size.bind(this));

          addEventListener("mousemove", this.mouseMove.bind(this));

     }

     mouseMove(event) {

          this.mouse.x = event.clientX / window.innerWidth * 2 - 1;
          this.mouse.y = event.clientY / window.innerHeight * 2 - 1;


     }

     async load() {

          const { scene: logo } = await this.loaders.gltf.loadAsync("./assets/sicaro.glb");

          this.camera.position.y = 3;

          this.camera.lookAt(0, 0, 0)

          this.scene.add(logo);

          // logo.position.x = -1;

          this.logo = logo;
     }

     size() {

          let width = window.innerWidth;
          let height = window.innerHeight;

          if (this.canvas.parentElement) {

               width = this.canvas.parentElement.clientWidth;
               height = this.canvas.parentElement.clientHeight;
          };

          this.renderer.setSize(width, height, true);
          this.composer.setSize(width, height, true);

          this.camera.aspect = width / height;

          this.camera.updateProjectionMatrix();
     }

     frame = null;

     update() {

          this.frame = requestAnimationFrame(this.update.bind(this));

          if (this.logo) {

               this.logo.position.x = this.mouse.x * 0.2;
               this.logo.position.z = this.mouse.y * 0.2;

               this.logo.position.x -= 1;
          }

          this.logo.position.z += Math.sin(Date.now() * 0.001) * 0.1;

          this.logo.rotation.y = Math.sin(Date.now() * 0.0005) * 0.2;;

          this.composer.render();
     }
}