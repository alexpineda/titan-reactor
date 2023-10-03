import {
    Scene,
    PerspectiveCamera,
    AmbientLight,
    DirectionalLight,
    MOUSE,
    Vector3,
    Mesh,
    PlaneGeometry,
    AxesHelper,
    Group,
    MeshStandardMaterial,
    Vector4,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import "../../../../bundled/assets/open-props.1.4.min.css";
import "../../../../bundled/assets/normalize.min.css";
import "../pre-home-scene/styles.css";

import App from "./components/app";
import { Surface } from "@image/canvas/surface";
import "common/utils/electron-file-loader";
import { updateDirection32 } from "./camera";
import { Janitor } from "three-janitor";
import { RenderPass } from "postprocessing";
import { renderComposer } from "@render/render-composer";
import { root } from "@render/root";
import { settingsStore } from "@stores/settings-store";
import { initializeAssets, loadImageAtlasDirect } from "@image/assets";
import gameStore from "@stores/game-store";
import { IScriptRunner } from "./iscript-runner";
import {
    incGameTick,
    setBlockFrameCount,
    useIScriptahStore,
    useIscriptStore,
} from "./stores";
import { isGltfAtlas } from "@utils/image-utils";
import { Image3D } from "@core/image-3d";
import { ImageHD } from "@core/image-hd";
import { IScriptState } from "./iscript-state";
import { IScriptImage } from "./iscript-sprite";
import { getDirection32 } from "@utils/camera-utils";

const bootup = async () => {
    const settings = await settingsStore().load();

    await initializeAssets( settings.data.directories );

    const janitor = new Janitor( "iscriptah-scene-loader" );

    const surface = new Surface();
    surface.setDimensions( 300, 300, window.devicePixelRatio );

    renderComposer.targetSurface = surface;

    const scene = new Scene();
    janitor.mop( scene, "scene" );

    const cameras = new Array( 4 ).fill( 0 ).map( () => {
        const camera = new PerspectiveCamera( 22, surface.aspect, 1, 256 );
        camera.userData.direction = 0;
        return camera;
    } );

    const viewports = new Array( 4 ).fill( 0 ).map( () => new Vector4() );

    cameras[0].position.set( 0, 10, 10 );
    cameras[1].position.set( 10, 0, 0 );
    cameras[2].position.set( 0, 0, -10 );
    cameras[3].position.set( 0, 0, 10 );

    cameras[1].userData.direction = 25;
    cameras[2].userData.direction = 0;
    cameras[3].userData.direction = 16;

    for ( const camera of cameras ) {
        camera.lookAt( new Vector3() );
    }

    const controls = janitor.mop(
        new OrbitControls( cameras[0], surface.canvas ),
        "controls"
    );

    const syncCameraDistances = () => {
        const l = cameras[0].position.length();
        cameras[1].position.setX( l );
        cameras[2].position.setZ( -l );
        cameras[3].position.setZ( l );
    };

    syncCameraDistances();

    controls.addEventListener( "change", () => {
        syncCameraDistances();
    } );
    controls.enablePan = false;

    controls.mouseButtons = {
        LEFT: MOUSE.PAN,
        MIDDLE: MOUSE.DOLLY,
        RIGHT: MOUSE.ROTATE,
    };

    const ambLight = new AmbientLight( 0xffffff, 1 );
    scene.add( ambLight );

    const dirLight = new DirectionalLight( 0xffffff, 3 );
    dirLight.position.set( -32, 13, -26 );
    dirLight.castShadow = true;
    dirLight.shadow.camera.near = 1;
    dirLight.shadow.camera.far = 200;
    dirLight.shadow.bias = 0.0001;
    scene.add( dirLight );

    const plane = new Mesh(
        new PlaneGeometry( 3, 3 ),
        new MeshStandardMaterial( { color: 0x339933 } )
    );
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = 0;
    plane.visible = false;
    scene.add( plane );

    const axes = new AxesHelper();
    axes.visible = false;
    scene.add( axes );

    const parent = new Group();
    scene.add( parent );

    const runner = new IScriptRunner( gameStore().assets!.bwDat, 0 );

    const resizeHandler = () => {
        surface.setDimensions(
            ( window.innerWidth * 8 ) / 20,
            ( window.innerHeight * 3 ) / 4,
            window.devicePixelRatio
        );
        for ( const camera of cameras ) {
            camera.aspect = surface.aspect;
            camera.updateProjectionMatrix();
        }

        const w2 = surface.bufferWidth / 2;
        const h2 = surface.bufferHeight / 2;

        viewports[0].set( 0, h2, w2, h2 );
        viewports[1].set( 0, 0, w2, h2 );
        viewports[2].set( w2, h2, w2, h2 );
        viewports[3].set( w2, 0, w2, h2 );

        renderComposer.setSize( surface.bufferWidth, surface.bufferHeight );
    };
    janitor.addEventListener( window, "resize", "resize", resizeHandler );
    resizeHandler();

    const renderPass = new RenderPass( scene, cameras[0] );

    const postProcessingBundle = {
        passes: [renderPass],
    };

    renderComposer.setBundlePasses( postProcessingBundle );
    janitor.mop(
        () => renderComposer.getWebGLRenderer().setAnimationLoop( null ),
        "renderLoop"
    );

    let _image: IScriptImage | null = null;
    let _imageLoading = false;

    useIscriptStore.subscribe( ( { block } ) => {
        if ( !block || _imageLoading ) return;

        if ( _image && block.image.index === _image.image.dat.index ) {
            runner.run( block.header, _image.state );
            return;
        }

        for ( const child of parent.children ) {
            janitor.dispose( child );
        }
        parent.clear();
        _image = null;
        _imageLoading = true;

        const preload = async () => {
            const { header } = block;

            const atlas = await loadImageAtlasDirect( block.image.index, true );

            const image = isGltfAtlas( atlas )
                ? new Image3D( atlas )
                : new ImageHD().updateImageType( atlas, true );

            image.matrixAutoUpdate = true;
            image.matrixWorldNeedsUpdate = true;

            const iscriptImage: IScriptImage = {
                image: image,
                state: new IScriptState(
                    gameStore().assets!.bwDat.iscript.iscripts[block.image.iscript],
                    block.image
                ),
                sprite: null,
            };

            runner.run( header, iscriptImage.state );

            setBlockFrameCount( atlas.frames.length );

            parent.add( iscriptImage.image );

            _image = iscriptImage;
            _imageLoading = false;
        };
        preload();
    } );

    let lastTime = 0;
    let gametick = 0;
    let delta = 0;
    const ISCRIPTAH_LOOP = ( elapsed: number ) => {
        delta = elapsed - lastTime;
        gametick += delta;
        lastTime = elapsed;

        const { autoUpdate, gamespeed } = useIScriptahStore.getState();

        if ( gametick > gamespeed && autoUpdate ) {
            gametick = 0;

            if ( !_image ) return;

            runner.update( _image.state );

            incGameTick();
        }

        const camera = cameras[0];

        const dir = getDirection32( controls.target, camera.position );

        if ( dir != camera.userData.direction ) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            camera.userData.prevDirection = camera.userData.direction;
            camera.userData.direction = dir;
        }

        for ( let i = 0; i < cameras.length; i++ ) {
            if ( _image ) {
                const { frame, flipFrame } = useIscriptStore.getState();

                if ( typeof frame === "number" ) {
                    _image.image.setFrame( frame, flipFrame );
                } else {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                    runner.setDirection( cameras[i].userData.direction, _image.state );
                    _image.image.setFrame( _image.state.frame, _image.state.flip );
                }
            }

            //@ts-expect-error
            renderPass.camera = cameras[i];
            renderComposer.render( delta, viewports[i] );
            renderComposer.drawBuffer();
        }
        controls.update();
    };

    renderComposer.getWebGLRenderer().setAnimationLoop( ISCRIPTAH_LOOP );

    root.render( <App surface={surface} /> );
};

bootup();
