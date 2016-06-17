Name: Omar Ozgur
UID: 704465898
Class: CS174A

Project 2 README

Summary:
This project shows an animation of a man sitting next to his tent in the woods. As the camera moves
towards him, he lies down, and stares at the clouds. The camera then rotates to look at the clouds
as well.

The clouds are made of small "particles" that align to the vertices of the pre-defined object. These
particles are animated to move around and change in size, emulating pseudo-random movements. By pressing
the numbers 1-9, animations are performed to transform the cloud into other pre-defined shapes, which
were loaded from "obj" files.

Pressing 'e' after looking at the clouds will start the end sequence, which shows the man turn into a
cloud and float up into the sky.

Pressing 'b' causes a change between day and night time. Changing to night time causes the background to
switch, and changes the clouds into groups of stars.


Hierarchical objects:
There are two main hierarchical objects in my scene. The first is the man, which consists of a body, a
head, hair, two arms, two hands, two legs, two shoes, and two eyes. As shown in the beginning of the
animation, groups of body parts can be rotated together. For example, the body could be rotated so that
the head and arms rotated with it.

The other main hierarchical objects were the trees that are scattered in the scene. These are simpler than
the man, as they simply consist of a trunk and leaves.


Custom polygonal objects:
There are two custom polygonal objects in this project. The first was the custom tent that is shown next to
the main character. This consists of 2 triangles to make up the "door", rectangles (made up of two triangles
each) to make the sides and the floor, and a triangle to make the back of the tent. Normal vectors were set
appropriately for each side. Triangles all had separate vertices, and each triangle had vertices with the
same normals in order to achieve a flat-shading effect.

The other custom polygonal object was the custom ground object. In order to create small hills and valleys,
I generated an array of vertex positions, which each had random 'y' components. I then used these positions
to create many triangles that linked to make the ground. The ground was also created to have a flat-shading
effect. The normals for each vertex were calculated through the use of cross-product equations.

Pressing ALT+n will allow for the normal vectors to be seen visually.


Texture mapping:
For this project, I texture-mapped my custom tent object. To do this, I created an image called "tent_texture.jpg"
which could support having separate textures for each of the triangles that made up the tent. Afterwards, I pushed
texture coordinates for each of the vertices in the tent object. This can be seen near the bottom of the "shapes.js"
file. By assigning the proper texture coordinates to each vertex, interpolation caused each triangle to be textured properly. By ordering the texture coordinates properly, the textures for adjacent triangles on each rectangular face 
were made to share textures seamlessly.