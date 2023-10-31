import {build} from "./build-plugins";
import {getLocalRepositoryManifests} from "./local-repository";

build(getLocalRepositoryManifests);