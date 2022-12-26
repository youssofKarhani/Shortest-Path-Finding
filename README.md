# Shortest-Path-Finding
This project is a program that finds the shortest path between two random points on a grid using A Star Algorithm.
The user indicates the start and the destination and the program will draw the most optimal path. Along the way it will indicate the various paths (dark blue) that the program tried to take before finding the shortest paht (yellow path). You will also find the neighbors of each node indicated in light blue.

I built this project using Javascript for my first time along side HTMl and CSS. I used CTX (canvas.context) functions to draw the grid, where each square is an object of class Node. This structure helped me throughtout the developement of the project. 

As for the algorithm (A Star), it works by using a heuristic function to estimate the distance from the current location to the destination. This heuristic function is used to guide the search and prioritize which paths should be explored first. At each step of the search, the A* algorithm selects the path that is estimated to be the shortest based on the heuristic function. It then updates the heuristic function to reflect the new location and repeats the process until it reaches the destination.

Since this was my first JavaScript program. I faced some trouble learning the language at first, but figured it out fast enough for its simularities with python. Then I tried my best not to look up any solutions for the problems that I was facing since I wanted to solve them by myslef even if it is not in the most optimal way. 
