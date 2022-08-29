import React, {useState, useEffect} from "react";
import Node from "./Node";
import Astar from "../pathfind algorithm/astar";
import "./Pathfind.css"

const cols=25;
const rows=10;

let NODE_START_ROW = 0;
let NODE_START_COL = 0;
let NODE_END_ROW = rows-1;
let NODE_END_COL = cols-1;
const RENDER_RATE=10;

const grid = new Array(rows);
for(let i=0;i<cols;i++){
  grid[i]=new Array(cols);
}

const Pathfind=()=>{

  const [Grid, setGrid] = useState([]);
  let finalPath
  let visitedNodes

  useEffect(()=>{
    initializeGrid();
  }, []);

  const initializeGrid=()=>{ 
    createSpot(grid);
    setGrid(grid);
  };

  const createSpot=(grid)=>{ 
    for(let i=0;i<rows;i++){
      for(let j=0;j<cols;j++){
        grid[i][j]=new Spot(i,j);
      }
    }
  };

  const addNeighbours=(grid) =>{ 
    for(let i=0;i<rows;i++){
      for(let j=0;j<cols;j++){
        grid[i][j].addneighbours(grid);
      }
    }
  };

  function Spot(i,j){ 
    this.x=i;
    this.y=j;
    this.isStart= this.x===NODE_START_ROW && this.y===NODE_START_COL;
    this.isEnd= this.x===NODE_END_ROW && this.y===NODE_END_COL;
    this.g=0;
    this.f=0;
    this.h=0;
    this.neighbours=[];
    this.isWall=false;
    this.previous=undefined;
    this.addneighbours=function(grid)
    {
      let i=this.x;
      let j=this.y;
      if(i>0) this.neighbours.push(grid[i-1][j]);
      if(i<rows-1) this.neighbours.push(grid[i+1][j]);
      if(j>0) this.neighbours.push(grid[i][j-1]);
      if(j<cols-1) this.neighbours.push(grid[i][j+1]);
    };
  }

  const gridwithNode=(
    <div>
      {Grid.map((row,rowIndex)=>{
        return(
          <div key={rowIndex} className="rowWrapper">
            {row.map((col,colIndex)=>{
              const{isStart,isEnd,isWall}=col;
              return(
                <Node
                  key={colIndex}
                  isStart={isStart}
                  isEnd={isEnd}
                  row={rowIndex}
                  col={colIndex}
                  isWall={isWall}
                />
              )
            })}
          </div>
        );
      })}
    </div>
  );

  const visualizeShortest=(shortestPath)=>{
    for(let i=0;i<shortestPath.length;i++){
      setTimeout(()=>{
        const node=shortestPath[i];
        document.getElementById(`node-${node.x}-${node.y}`).className="node node-shortest-path";
      },RENDER_RATE*i);
    }
    let node = document.createElement('li');
    node.appendChild(document.createTextNode("PathNode:"+shortestPath.length));
    document.querySelector('ul').appendChild(node);
    console.log("PathNode:"+shortestPath.length);
  }

  async function visualizePath(){ 
    setStartEnd();
    setWall();
    addNeighbours(grid);
    const startNode=grid[NODE_START_ROW][NODE_START_COL];
    const endNode=grid[NODE_END_ROW][NODE_END_COL];
    startNode.isWall=false;
    endNode.isWall=false;
    document.getElementById("list").innerHTML = "";
    for(let i=0;i<3;i++){
      clearGrid()
      let path=Astar(startNode,endNode,i);
      visitedNodes=path.visitedNodes;
      finalPath=path.path
      animation(i);
      await sleep(6000);
    }
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function animation(mode){
    for(let i=0;i<=visitedNodes.length;i++){
      if(i === visitedNodes.length){
        setTimeout(()=>{
          visualizeShortest(finalPath);
        },RENDER_RATE*2*i);
      }else{    
        setTimeout(()=>{
          const node=visitedNodes[i];
          document.getElementById(`node-${node.x}-${node.y}`).className=
          "node node-visited";
        },RENDER_RATE*2*i)
      }
    }
    if(mode===0){
      let node = document.createElement('li');
      node.appendChild(document.createTextNode("NodeVisited with manhattenDistance -> "+visitedNodes.length));
      document.querySelector('ul').appendChild(node);
      console.log("NodeVisited with manhattenDistance :"+visitedNodes.length);
    }else if(mode===1){
      let node = document.createElement('li');
      node.appendChild(document.createTextNode("NodeVisited with squareDistance :"+visitedNodes.length));
      document.querySelector('ul').appendChild(node);
      console.log("NodeVisited with squareDistance :"+visitedNodes.length);
    }else if(mode===2){
      let node = document.createElement('li');
      node.appendChild(document.createTextNode("NodeVisited with Heuristic :"+visitedNodes.length));
      document.querySelector('ul').appendChild(node);
      console.log("NodeVisited with tutorialHeuristic :"+visitedNodes.length);
    }
  }

  function clearGrid(){
    for(let i=0;i<rows;i++){
      for(let j=0;j<cols;j++){
        let node=document.getElementById(`node-${i}-${j}`)
        if(i===NODE_START_ROW && j===NODE_START_COL){
          node.className="node node-start";
        }
        if(i===NODE_END_ROW && j===NODE_END_COL){
          node.className="node node-end";
        }
        if(node.className==="node node-visited" || node.className==="node node-shortest-path"){
          document.getElementById(`node-${i}-${j}`).className="node ";
        }
      }
    }
  }

  function setStartEnd(){
    for(let i=0;i<rows;i++){
      for(let j=0;j<cols;j++){
        let node=document.getElementById(`node-${i}-${j}`)
        if(node.className==="node node-start"){
          NODE_START_ROW=i;
          NODE_START_COL=j;
          grid[i][j].isStart=true;
        }
        if(node.className==="node node-end"){
          NODE_END_ROW=i;
          NODE_END_COL=j;
          grid[i][j].isEnd=true;
        }
        if(!node.isStart && !node.isEnd){
          grid[i][j].isStart=false;
          grid[i][j].isEnd=false;
        }
      }
    }
  }

  function setWall(){
    for(let i=0;i<rows;i++){
      for(let j=0;j<cols;j++){
        if(document.getElementById(`node-${i}-${j}`).isWall){
          grid[i][j].isWall=true;
        }
      }
    }
  }

  function setRandomWall(){
    setStartEnd();
    for(let i=0;i<rows;i++){
      for(let j=0;j<cols;j++){
        let node=document.getElementById(`node-${i}-${j}`)
        if(Math.floor((Math.random()*100)+1)<20 && node.className==="node "){
          grid[i][j].isWall=true;
          document.getElementById(`node-${i}-${j}`).className="node isWall";
        }
      }
    }
  }

  function clearWall(){
    setStartEnd();
    for(let i=0;i<rows;i++){
      for(let j=0;j<cols;j++){
        let node=document.getElementById(`node-${i}-${j}`)
        if(node.className==="node isWall"){
          grid[i][j].isWall=false;
          document.getElementById(`node-${i}-${j}`).className="node node";
        }
      }
    }
  }

  return(
    <div className="Wrapper">
    <button onClick={visualizePath}>Visualize Path</button>
    <button onClick={setRandomWall}>Generate Wall</button>
    <button onClick={clearWall}>Clear Wall</button>
    <button onClick={clearGrid}>Clear Animation  </button>
      <h1>Pathfind</h1>
      <ul id="list"></ul>
      {gridwithNode}
    </div>
  );
};


export default Pathfind;

