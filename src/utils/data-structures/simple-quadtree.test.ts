import { Vector2 } from 'three';
import { SimpleQuadtree } from './simple-quadtree';

describe('SimpleQuadtree', () => {

    let quadtree: SimpleQuadtree<number>;

    beforeEach(() => {
        quadtree = new SimpleQuadtree(5, new Vector2(10, 10), new Vector2(0, 0));
    });

    test('should initialize with specified size', () => {
        expect(quadtree.size).toBe(5);
    });

    test('should add item and retrieve it', () => {
        quadtree.add(1, 1, 42);
        const nearbyItems = quadtree.getNearby(1, 1);
        expect(nearbyItems).toContain(42);
    });

    test('should retrieve multiple items from the same cell', () => {
        quadtree.add(1, 1, 42);
        quadtree.add(1, 1, 43);
        const nearbyItems = quadtree.getNearby(1, 1);
        expect(nearbyItems).toContain(42);
        expect(nearbyItems).toContain(43);
    });

    test('should not retrieve items from other cells', () => {
        quadtree.add(1, 1, 42);
        const nearbyItems = quadtree.getNearby(2, 2);
        expect(nearbyItems).not.toContain(42);
    });

    test('should retrieve items within radius', () => {
        quadtree.add(1, 1, 42);
        const nearbyItems = quadtree.getNearby(2, 2, 2); // Using radius
        expect(nearbyItems).toContain(42);
    });

    test('should clear all items', () => {
        quadtree.add(1, 1, 42);
        quadtree.clear();
        const nearbyItems = quadtree.getNearby(1, 1);
        expect(nearbyItems.length).toBe(0);
    });

    // Additional tests can include:
    // - Tests for scaling and offset features.
    // - Boundary tests, i.e., adding and fetching items near the boundaries of the grid.
    // - Performance-related tests, especially if you have very large datasets or grids.

});

