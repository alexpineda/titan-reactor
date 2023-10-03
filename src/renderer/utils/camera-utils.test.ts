import { describe, it, jest } from "@jest/globals";
import { getDirection32 } from "./camera-utils";
import { Vector3 } from "three";

jest.mock( "@stores/replay-and-map-store" );

describe( "Camera Utils", () => {

    describe("getDirection32", () => {

        it('calculates correct direction', () => {
        expect(getDirection32(new Vector3(0, 0, 1), new Vector3(0, 0, 0))).toBe(16); // Angle = 0
        expect(getDirection32(new Vector3(1, 0, 0), new Vector3(0, 0, 0))).toBe(24); // Angle = 0.5π
        expect(getDirection32(new Vector3(0, 0, -1), new Vector3(0, 0, 0))).toBe(0); // Angle = π
        expect(getDirection32(new Vector3(-1, 0, 0), new Vector3(0, 0, 0))).toBe(8); // Angle = -0.5π
        });
        
        it('handles boundary cases', () => {
        expect(getDirection32(new Vector3(0, 0, 0), new Vector3(0, 0, 0))).toBe(16); // Both points are same
        });
        
        it('handles negative values', () => {
        expect(getDirection32(new Vector3(-1, 0, 0), new Vector3(0, 0, 0))).toBe(8); // Angle = -0.5π
        expect(getDirection32(new Vector3(0, 0, -1), new Vector3(0, 0, 0))).toBe(0); // Angle = π
        });

    }); 
} );
