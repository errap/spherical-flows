# three.js template repository

Template repository to test things with [three.js](https://threejs.org/)

## Development

- Run `npm i` to install all dependencies
- Tweak [`src/index.ts`](src/index.ts) to get your desired render
- Run `npm run start` to run the app

## Linting

This project uses ESLint and Prettier

## Writeup

So the idea behind this project is to draw a spherical representation of flow fields using three.js. There are some issues I have to solve first before even think about coding anything, namely:

1. How do I geometrically represent the sphere? There are 3 options here, each with its implications: 
   - Sphere: Texture representation is an equirectangular texture which has different resolution on the poles. Quadrilateral topology.
   - Icosahedron: Sphere-like geometry built with triangles only. All triangles have the same size. Resolution is consistent but transforming between UV coordinates and geometry coordinates can be challenging.
   - Subdivided box: 8 poles, less distortion. Still rather complex UV-coords. Not all triangles have the same size.
2. How do we paint particles in the sphere?
   - Use a texture that is updated on each frame: there is a 1-to-1 conversion between canvas and three.js textures.
   - Use a fragment shader. I can see the general idea rather easy to implement. Still not sure how do I go from a fragment (~pixel) to a particle or a color. I think I might have to add a resolution field to the simulation to make sure we can find the position of particles in the rendered scene.
3. How do I represent the simulation? I can represent the simulation in a space built on triangles that are connected. Some problems:
    - I need to find a way to continue the simulation of a particle once it goes out of its triangle. Which triangle does it go to?
    - When a particles goes from one triangle to another, do we change (rotate) its coordinates origin?

After asking Jetbrains AI for some guidance, I realized it might be easier to just simulate the flow fields in a sphere using polar coordinates and then transform that to equirectangular coordinates. Let's try that.

