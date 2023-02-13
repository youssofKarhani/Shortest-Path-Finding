var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

//Rectangle drawing function - will be used to draw the grid
function drawRectBorder(ctx, x, y, width, height) {
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#FFFFFF";
  ctx.stroke();
}

//Grid info variables
var gridWidth = 30;
var gridHeight = 30;
var counterGridWidth = 1200 / gridWidth;
var counterGridHeight = 900 / gridHeight;
const d = 10; //horizontal distance
const d2 = 14; //diagonal distance

//drawing the map
for (var i = 0; i < counterGridWidth; i++) {
  for (var j = 0; j < counterGridHeight; j++) {
    drawRectBorder(ctx, i * gridWidth, j * gridHeight, gridWidth, gridHeight);
  }
}
var x; //holds the mouse x position
var y; //holds the mouse y position

var finalTotal; //holds the total when findinf the goal

//Random number generator
function getRandomNumb(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

//=======================- Node Class -=================================
class Node {
  constructor(posX, posY, height, width) {
    this.xIndex = posX;
    this.yIndex = posY;
    this.posX = posX * width;
    this.posY = posY * height;
    this.width = width;
    this.height = height;
    this.isWall = 0;
    this.costSoFar = 0;
    this.heuristic = 0;
    this.total = 0;
    this.parent = null;
  }
  //setters
  setCostSoFar(costSoFar) {
    this.costSoFar = costSoFar;
  }
  setHeuristct(heuristic) {
    this.heuristic = heuristic;
  }
  setTotal(total) {
    this.total = total;
  }
  setIsWall(num) {
    if (num >= 1) this.isWall = 1;
    else this.isWall = 0;
  }
  setParent(parent) {
    this.parent = parent;
  }

  //getters
  getXindex() {
    return this.xIndex;
  }
  getYindex() {
    return this.yIndex;
  }
  getX() {
    return this.posX;
  }
  getY() {
    return this.posY;
  }
  getCostSoFar() {
    return this.costSoFar;
  }
  getHeuristic() {
    return this.heuristic;
  }
  getTotal() {
    return this.total;
  }
  getIsWall() {
    return this.isWall;
  }
  getParent() {
    return this.parent;
  }
}
//=====================================================================

//Initializing array of nodes
arrayOfNodes = [[]];
for (var i = 0; i < counterGridWidth; i++) {
  arrayOfNodes[i] = [];
  for (var j = 0; j < counterGridHeight; j++) {
    arrayOfNodes[i][j] = new Node(i, j, gridHeight, gridWidth);
  }
}
//Generating random walls
for (let count = 0; count < getRandomNumb(300, 500); count++) {
  i = getRandomNumb(0, 40);
  j = getRandomNumb(0, 30);
  arrayOfNodes[i][j].setIsWall(1);
  drawBlack(i, j);
}

//============- Initializing start and end Nodes -=====================

// create sart and finish
clickedOnce = false;
clickedTwice = false;
//var will help with the logic
var nodeRow;
var nodeCol;
// starting node coord
var startNodeRow;
var startNodeCol;
// end node coord
var endnodeRow;
var endNodeCol;
//bool to run the program when end point is defined.
var start = false;
canvas.addEventListener("mousedown", (e) => {
  // grab html page coord
  console.log("x " + x);
  console.log("y " + y);

  if (!clickedOnce) getStartingPos(canvas, e);
  else getEndPos(canvas, e);
});

function getStartingPos(canvas, e) {
  if (e.pageX != undefined && e.pageY != undefined) {
    x = e.pageX;
    y = e.pageY;
  } else {
    x =
      e.clientX +
      document.body.scrollLeft +
      document.documentElement.scrollLeft;
    y =
      e.clientY + document.body.scrollTop + 
      document.documentElement.scrollTop;
  }

  // make the postion relative to the canvas only
  x -= canvas.offsetLeft;
  y -= canvas.offsetTop;

  nodeRow = Math.floor(y / gridHeight);
  nodeCol = Math.floor(x / gridWidth);

  if (arrayOfNodes[nodeCol][nodeRow].isWall == 0) {
    drawGreen(nodeCol, nodeRow);
    //save coordinates
    startNodeRow = nodeRow;
    startNodeCol = nodeCol;
    clickedOnce = true;
  } else {
    console.log("Wall!!!\nPlace it somewhere else.");
  }
}

function getEndPos(canvas, e) {
  if (clickedTwice && arrayOfNodes[nodeCol][nodeRow].isWall == 0) {
    drawClear(nodeCol, nodeRow);
  }
  if (e.pageX != undefined && e.pageY != undefined) {
    x = e.pageX;
    y = e.pageY;
  } else {
    x =
      e.clientX +
      document.body.scrollLeft +
      document.documentElement.scrollLeft;
    y =
      e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
  }

  // make the postion relative to the canvas only
  x -= canvas.offsetLeft;
  y -= canvas.offsetTop;

  nodeRow = Math.floor(y / gridHeight);
  nodeCol = Math.floor(x / gridWidth);

  // if not wall or start node enter
  if (
    arrayOfNodes[nodeCol][nodeRow].isWall == 0 &&
    (nodeCol != startNodeCol || nodeRow != startNodeRow)
  ) {
    drawRed(nodeCol, nodeRow);
    clickedTwice = true;
    //save coordinates
    endNodeRow = nodeRow;
    endNodeCol = nodeCol;
    setTimeout(findAStar(), 2000);
    //if wall
  } else if (arrayOfNodes[nodeCol][nodeRow].isWall == 1) {
    console.log("Wall!!!\nPlace it somewhere else.");
    //if start node
  } else {
    console.log("Can't place over starting node!!!");
    clickedTwice = false;
  }
}
//=====================================================================

//===============- Shortest Path Algorithm functions -=================

//stores all available nodes
var openList = [];
//store all viseted nodes
var closedList = [];

var startPushed = false;

var newParentNode;
var newParentNodeX;
var newParentNodeY;

var parentOfParent;

//Function to calculate the Heuristic
function calculateH(currentNode, endNode) {
  var cx = currentNode.getX();
  var cy = currentNode.getY();

  var ex = endNode.getX();
  var ey = endNode.getY();
  console.log(cx);
  var dx = Math.abs(cx - ex);

  var dy = Math.abs(cy - ey);

  var h = (d * (dx + dy) + (d2 - 2 * d) * Math.min(dx, dy)) / 30;
  return h;
}

function findAStar() {
  do {
    //if start node is sent push directly.
    if (!startPushed) {
      openList.push(arrayOfNodes[startNodeCol][startNodeRow]);
      startPushed = true;
    }
    //get Min Cell From OpenList
    newParentNode = getMinimumCellFromOpenList();
    newParentNodeX = newParentNode.getXindex();
    newParentNodeY = newParentNode.getYindex();

    //get Neighbors
    var isGoal = getNeighbors(newParentNodeX, newParentNodeY);

    console.log("not found");
  } while (!isGoal);
  console.log("goal found!!!");
  drawYellow(newParentNodeX, newParentNodeY);
  parentOfParent = newParentNode.getParent();

  do {
    if (
      !(
        parentOfParent.getXindex() == startNodeCol &&
        parentOfParent.getYindex() == startNodeRow
      )
    )
      drawYellow(parentOfParent.getXindex(), parentOfParent.getYindex());

    parentOfParent = parentOfParent.getParent();
  } while (
    !(
      parentOfParent.getXindex() == startNodeCol &&
      parentOfParent.getYindex() == startNodeRow
    )
  );
}

function getMinimumCellFromOpenList() {
  var index = 0; //to keep track of the tempMinNode index.
  var tempMinNode = openList[0];
  console.log("totalTemp: " + tempMinNode.getTotal());
  for (let i = 1; i < openList.length; i++) {
    if (tempMinNode.total > openList[i].total) {
      tempMinNode = openList[i];
      index = i;
    }
  }
  openList.splice(index, 1);
  closedList.push(tempMinNode);
  if (tempMinNode.xIndex != startNodeCol || tempMinNode.yIndex != startNodeRow)
    drawDarkBlue(tempMinNode.getXindex(), tempMinNode.getYindex());

  return tempMinNode;
}

/*
* function that get the neighboring nodes and
  initializes their corresponding variables
*/
function getNeighbors(parentNodeCol, parentNodeRow) {
  var endNode = arrayOfNodes[endNodeCol][endnodeRow];
  var foundClosed = false; //bool variable will help with the logic
  var foundOpen = false; //bool variable will help with the logic
  //parent node
  parentNode = arrayOfNodes[parentNodeCol][parentNodeRow];
  //end node
  endNode = arrayOfNodes[endNodeCol][endNodeRow];
  //==================================================================================
  var leftCol = parentNodeCol - 1;
  var leftRow = parentNodeRow; //left

  var upLeftCol = parentNodeCol - 1;
  var upLeftRow = parentNodeRow - 1; //up left

  var upCol = parentNodeCol;
  var upRow = parentNodeRow - 1; //up

  var upRightCol = parentNodeCol + 1;
  var upRightRow = parentNodeRow - 1; //up right

  var rightCol = parentNodeCol + 1;
  var rightRow = parentNodeRow; //right

  var downRightCol = parentNodeCol + 1;
  var downRightRow = parentNodeRow + 1; //down right

  var downCol = parentNodeCol;
  var downRow = parentNodeRow + 1; //down

  var downLeftCol = parentNodeCol - 1;
  var downLeftRow = parentNodeRow + 1; //down left
  //==================================================================================

  //left
  //if parent is not on left edge
  if (parentNodeCol != 0) {
    var leftNode = arrayOfNodes[leftCol][leftRow];
    if (
      leftNode.getXindex() == endNode.getXindex() &&
      leftNode.getYindex() == endNode.getYindex()
    )
      return true;

    for (let i = 0; i < closedList.length; i++) {
      if (closedList[i] == leftNode) foundClosed = true;
    }
    for (let i = 0; i < openList.length; i++) {
      if (openList[i] == leftNode) {
        foundOpen = true;
      }
    }
    //Is not in closed list and is not a wall
    console.log("Wall: " + leftNode.getIsWall());
    console.log(arrayOfNodes[leftCol][leftRow].getIsWall());
    if (foundClosed != true && leftNode.getIsWall() != 1) {
      //if found in open list update if smaller total
      if (foundOpen == true) {
        var newCostSoFar = parentNode.getCostSoFar() + d;
        leftNode.setCostSoFar(newCostSoFar);

        leftNode.setTotal(leftNode.getCostSoFar() + leftNode.getHeuristic());
      } else {
        //setting parent
        leftNode.setParent(parentNode);

        //setting cost so far
        leftNode.setCostSoFar(parentNode.getCostSoFar() + d);
        console.log("costsf: " + leftNode.getCostSoFar());

        //setting heuristic
        leftNode.setHeuristct(calculateH(leftNode, endNode));
        console.log("h: " + leftNode.getHeuristic());

        //setting total
        leftNode.setTotal(leftNode.getCostSoFar() + leftNode.getHeuristic());
        console.log("total: " + leftNode.getTotal());

        //pushing node in open list
        openList.push(leftNode);
        drawBrightBlue(leftCol, leftRow);
      }
    }
  }

  foundClosed = false;
  foundOpen = false;

  //up left
  //if parent on left or up edges don't enter.
  if (parentNodeCol != 0 && parentNodeRow != 0) {
    var upLeftNode = arrayOfNodes[upLeftCol][upLeftRow];
    if (
      upLeftNode.getXindex() == endNode.getXindex() &&
      upLeftNode.getYindex() == endNode.getYindex()
    )
      return true;

    for (let i = 0; i < closedList.length; i++) {
      if (closedList[i] == upLeftNode) foundClosed = true;
    }
    for (let i = 0; i < openList.length; i++) {
      if (openList[i] == upLeftNode) {
        foundOpen = true;
      }
    }
    //Is not in closed list and is not a wall
    if (foundClosed != true && upLeftNode.getIsWall() != 1) {
      //if found in open list update if smaller total
      if (foundOpen == true) {
        var newCostSoFar = parentNode.getCostSoFar() + d;
        upLeftNode.setCostSoFar(newCostSoFar);

        upLeftNode.setTotal(
          upLeftNode.getCostSoFar() + upLeftNode.getHeuristic()
        );
      } else {
        //setting parent
        upLeftNode.setParent(parentNode);

        //setting cost so far
        upLeftNode.setCostSoFar(parentNode.getCostSoFar() + d);
        console.log("costsf: " + upLeftNode.getCostSoFar());

        //setting heuristic
        upLeftNode.setHeuristct(calculateH(upLeftNode, endNode));
        console.log("h: " + upLeftNode.getHeuristic());

        //setting total
        upLeftNode.setTotal(
          upLeftNode.getCostSoFar() + upLeftNode.getHeuristic()
        );
        console.log("total: " + upLeftNode.getTotal());

        //pushing node in open list
        openList.push(upLeftNode);
        drawBrightBlue(upLeftCol, upLeftRow);
      }
    }
  }
  foundClosed = false;
  foundOpen = false;

  //up
  //if parent on upper edge don't enter.
  if (parentNodeRow != 0) {
    var upNode = arrayOfNodes[upCol][upRow];
    if (
      upNode.getXindex() == endNode.getXindex() &&
      upNode.getYindex() == endNode.getYindex()
    )
      return true;

    for (let i = 0; i < closedList.length; i++) {
      if (closedList[i] == upNode) foundClosed = true;
    }
    for (let i = 0; i < openList.length; i++) {
      if (openList[i] == upNode) {
        foundOpen = true;
      }
    }
    //Is not in closed list and is not a wall
    if (foundClosed != true && upNode.getIsWall() != 1) {
      //if found in open list update if smaller total
      if (foundOpen == true) {
        var newCostSoFar = parentNode.getCostSoFar() + d;
        upNode.setCostSoFar(newCostSoFar);

        upNode.setTotal(upNode.getCostSoFar() + upNode.getHeuristic());
      } else {
        //setting parent
        upNode.setParent(parentNode);

        //setting cost so far
        upNode.setCostSoFar(parentNode.getCostSoFar() + d);
        console.log("costsf: " + upNode.getCostSoFar());

        //setting heuristic
        upNode.setHeuristct(calculateH(upNode, endNode));
        console.log("h: " + upNode.getHeuristic());

        //setting total
        upNode.setTotal(upNode.getCostSoFar() + upNode.getHeuristic());
        console.log("total: " + upNode.getTotal());

        //pushing node in open list
        openList.push(upNode);
        drawBrightBlue(upCol, upRow);
      }
    }
  }
  foundClosed = false;
  foundOpen = false;

  //up right
  //if parent on upper neither on right edge don't enter.
  if (parentNodeRow != 0 && parentNodeCol != counterGridWidth - 1) {
    var upRightNode = arrayOfNodes[upRightCol][upRightRow];
    if (
      upRightNode.getXindex() == endNode.getXindex() &&
      upRightNode.getYindex() == endNode.getYindex()
    )
      return true;

    for (let i = 0; i < closedList.length; i++) {
      if (closedList[i] == upRightNode) foundClosed = true;
    }
    for (let i = 0; i < openList.length; i++) {
      if (openList[i] == upRightNode) {
        foundOpen = true;
      }
    }
    //Is not in closed list and is not a wall
    if (foundClosed != true && upRightNode.getIsWall() != 1) {
      //if found in open list update if smaller total
      if (foundOpen == true) {
        var newCostSoFar = parentNode.getCostSoFar() + d2;
        upRightNode.setCostSoFar(newCostSoFar);

        upRightNode.setTotal(
          upRightNode.getCostSoFar() + upRightNode.getHeuristic()
        );
      } else {
        //setting parent
        upRightNode.setParent(parentNode);

        //setting cost so far
        upRightNode.setCostSoFar(parentNode.getCostSoFar() + d2);
        console.log("costsf: " + upRightNode.getCostSoFar());

        //setting heuristic
        upRightNode.setHeuristct(calculateH(upRightNode, endNode));
        console.log("h: " + upRightNode.getHeuristic());

        //setting total
        upRightNode.setTotal(
          upRightNode.getCostSoFar() + upRightNode.getHeuristic()
        );
        console.log("total: " + upRightNode.getTotal());

        //pushing node in open list
        openList.push(upRightNode);
        drawBrightBlue(upRightCol, upRightRow);
      }
    }
  }
  foundClosed = false;
  foundOpen = false;

  //right
  //if parent on right edge don't enter.
  if (parentNodeCol != counterGridWidth - 1) {
    var rightNode = arrayOfNodes[rightCol][rightRow];
    if (
      rightNode.getXindex() == endNode.getXindex() &&
      rightNode.getYindex() == endNode.getYindex()
    )
      return true;

    for (let i = 0; i < closedList.length; i++) {
      if (closedList[i] == rightNode) foundClosed = true;
    }
    for (let i = 0; i < openList.length; i++) {
      if (openList[i] == rightNode) {
        foundOpen = true;
      }
    }
    //Is not in closed list and is not a wall
    if (foundClosed != true && rightNode.getIsWall() != 1) {
      //if found in open list update if smaller total
      if (foundOpen == true) {
        var newCostSoFar = parentNode.getCostSoFar() + d;
        rightNode.setCostSoFar(newCostSoFar);

        rightNode.setTotal(rightNode.getCostSoFar() + rightNode.getHeuristic());
      } else {
        //setting parent
        rightNode.setParent(parentNode);

        //setting cost so far
        rightNode.setCostSoFar(parentNode.getCostSoFar() + d);
        console.log("costsf: " + rightNode.getCostSoFar());

        //setting heuristic
        rightNode.setHeuristct(calculateH(rightNode, endNode));
        console.log("h: " + rightNode.getHeuristic());

        //setting total
        rightNode.setTotal(rightNode.getCostSoFar() + rightNode.getHeuristic());
        console.log("total: " + rightNode.getTotal());

        //pushing node in open list
        openList.push(rightNode);
        drawBrightBlue(rightCol, rightRow);
      }
    }
  }
  foundClosed = false;
  foundOpen = false;

  //down right
  //if parent
  if (
    parentNodeCol != counterGridWidth - 1 &&
    parentNodeRow != counterGridHeight - 1
  ) {
    var downRighNode = arrayOfNodes[downRightCol][downRightRow];
    if (
      downRighNode.getXindex() == endNode.getXindex() &&
      downRighNode.getYindex() == endNode.getYindex()
    )
      return true;

    for (let i = 0; i < closedList.length; i++) {
      if (closedList[i] == downRighNode) foundClosed = true;
    }
    for (let i = 0; i < openList.length; i++) {
      if (openList[i] == downRighNode) {
        foundOpen = true;
      }
    }
    //Is not in closed list and is not a wall
    if (foundClosed != true && downRighNode.getIsWall() != 1) {
      //if found in open list update if smaller total
      if (foundOpen == true) {
        var newCostSoFar = parentNode.getCostSoFar() + d;
        downRighNode.setCostSoFar(newCostSoFar);

        downRighNode.setTotal(
          downRighNode.getCostSoFar() + downRighNode.getHeuristic()
        );
      } else {
        //setting parent
        downRighNode.setParent(parentNode);

        //setting cost so far
        downRighNode.setCostSoFar(parentNode.getCostSoFar() + d);
        console.log("costsf: " + downRighNode.getCostSoFar());

        //setting heuristic
        downRighNode.setHeuristct(calculateH(downRighNode, endNode));
        console.log("h: " + downRighNode.getHeuristic());

        //setting total
        downRighNode.setTotal(
          downRighNode.getCostSoFar() + downRighNode.getHeuristic()
        );
        console.log("total: " + downRighNode.getTotal());

        //pushing node in open list
        openList.push(downRighNode);
        drawBrightBlue(downRightCol, downRightRow);
      }
    }
  }
  foundClosed = false;
  foundOpen = false;

  //down
  //if parent on lower edge don't enter
  if (parentNodeRow != counterGridHeight - 1) {
    var downNode = arrayOfNodes[downCol][downRow];
    if (
      downNode.getXindex() == endNode.getXindex() &&
      downNode.getYindex() == endNode.getYindex()
    )
      return true;

    for (let i = 0; i < closedList.length; i++) {
      if (closedList[i] == downNode) foundClosed = true;
    }
    for (let i = 0; i < openList.length; i++) {
      if (openList[i] == downNode) {
        foundOpen = true;
      }
    }
    //Is not in closed list and is not a wall
    if (foundClosed != true && downNode.getIsWall() != 1) {
      //if found in open list update if smaller total
      if (foundOpen == true) {
        var newCostSoFar = parentNode.getCostSoFar() + d;
        downNode.setCostSoFar(newCostSoFar);

        downNode.setTotal(downNode.getCostSoFar() + downNode.getHeuristic());
      } else {
        //setting parent
        downNode.setParent(parentNode);

        //setting cost so far
        downNode.setCostSoFar(parentNode.getCostSoFar() + d);
        console.log("costsf: " + downNode.getCostSoFar());

        //setting heuristic
        downNode.setHeuristct(calculateH(downNode, endNode));
        console.log("h: " + downNode.getHeuristic());

        //setting total
        downNode.setTotal(downNode.getCostSoFar() + downNode.getHeuristic());
        console.log("total: " + downNode.getTotal());

        //pushing node in open list
        openList.push(downNode);
        drawBrightBlue(downCol, downRow);
      }
    }
  }
  foundClosed = false;
  foundOpen = false;

  //down left
  //if parent on left or lower edge.
  if (parentNodeRow != counterGridHeight - 1 && parentNodeCol != 0) {
    var downLeftNode = arrayOfNodes[downLeftCol][downLeftRow];
    if (
      downLeftNode.getXindex() == endNode.getXindex() &&
      downLeftNode.getYindex() == endNode.getYindex()
    )
      return true;

    for (let i = 0; i < closedList.length; i++) {
      if (closedList[i] == downLeftNode) foundClosed = true;
    }
    for (let i = 0; i < openList.length; i++) {
      if (openList[i] == downLeftNode) {
        foundOpen = true;
      }
    }
    //Is not in closed list and is not a wall
    if (foundClosed != true && downLeftNode.getIsWall() != 1) {
      //if found in open list update if smaller total
      if (foundOpen == true) {
        var newCostSoFar = parentNode.getCostSoFar() + d;
        downLeftNode.setCostSoFar(newCostSoFar);

        downLeftNode.setTotal(
          downLeftNode.getCostSoFar() + downLeftNode.getHeuristic()
        );
      } else {
        //setting parent
        downLeftNode.setParent(parentNode);

        //setting cost so far
        downLeftNode.setCostSoFar(parentNode.getCostSoFar() + d);
        console.log("costsf: " + downLeftNode.getCostSoFar());

        //setting heuristic
        downLeftNode.setHeuristct(calculateH(downLeftNode, endNode));
        console.log("h: " + downLeftNode.getHeuristic());

        //setting total
        downLeftNode.setTotal(
          downLeftNode.getCostSoFar() + downLeftNode.getHeuristic()
        );
        console.log("total: " + downLeftNode.getTotal());

        //pushing node in open list
        openList.push(downLeftNode);
        drawBrightBlue(downLeftCol, downLeftRow);
      }
    }
  }

  //if the goalNode is not any of the neighbors then return false.
  return false;
}

//===============================================================

//====================- Drawing functions -======================

function drawBrightBlue(i, j) {
  arrayOfNodes[i][j].fill = "#0096FF";
  ctx.beginPath();
  ctx.rect(
    arrayOfNodes[i][j].posX,
    arrayOfNodes[i][j].posY,
    arrayOfNodes[i][j].width,
    arrayOfNodes[i][j].height
  );
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#FFFFFF";
  ctx.fillStyle = "#0096FF";
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "undefined";
}

function drawDarkBlue(i, j) {
  ctx.beginPath();
  ctx.rect(
    arrayOfNodes[i][j].posX,
    arrayOfNodes[i][j].posY,
    arrayOfNodes[i][j].width,
    arrayOfNodes[i][j].height
  );
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#FFFFFF";
  ctx.fillStyle = "#00008b";
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "undefined";
}

function drawYellow(i, j) {
  arrayOfNodes[i][j].fill = "yellow";
  ctx.beginPath();
  ctx.rect(
    arrayOfNodes[i][j].posX,
    arrayOfNodes[i][j].posY,
    arrayOfNodes[i][j].width,
    arrayOfNodes[i][j].height
  );
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#FFFFFF";
  ctx.fillStyle = "yellow";
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "undefined";
}

function drawGreen(i, j) {
  arrayOfNodes[i][j].fill = "green";
  ctx.beginPath();
  ctx.rect(
    arrayOfNodes[i][j].posX,
    arrayOfNodes[i][j].posY,
    arrayOfNodes[i][j].width,
    arrayOfNodes[i][j].height
  );
  ctx.lineWidth = 6;
  ctx.strokeStyle = "#FFFFFF";
  ctx.fillStyle = "#00AF00";
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "undefined";
}

function drawRed(i, j) {
  arrayOfNodes[i][j].fill = "black";
  ctx.beginPath();
  ctx.rect(
    arrayOfNodes[i][j].posX,
    arrayOfNodes[i][j].posY,
    arrayOfNodes[i][j].width,
    arrayOfNodes[i][j].height
  );
  ctx.lineWidth = 6;
  ctx.strokeStyle = "#FFFFFF";
  ctx.fillStyle = "#FF0000";
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "undefined";
}

function drawBlack(i, j) {
  arrayOfNodes[i][j].fill = "black";
  ctx.beginPath();
  ctx.rect(
    arrayOfNodes[i][j].posX,
    arrayOfNodes[i][j].posY,
    arrayOfNodes[i][j].width,
    arrayOfNodes[i][j].height
  );
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#FFFFFF";
  ctx.fillStyle = "black";
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "undefined";
}

function drawClear(i, j) {
  arrayOfNodes[i][j].fill = "#646170";
  ctx.beginPath();
  ctx.rect(
    arrayOfNodes[i][j].posX,
    arrayOfNodes[i][j].posY,
    arrayOfNodes[i][j].width,
    arrayOfNodes[i][j].height
  );
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#FFFFFF";
  ctx.fillStyle = "#646170";
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "undefined";
}
//===============================================================
