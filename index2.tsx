import React, { useState } from "react";
import ReactDOM from "react-dom";
import "./index.css";

function Box(props: any) {
  let className = 'box'
  return <button className={className} disabled>{props.value}</button>;
}

function Row(value:string[], numBoxes = 5) {
  const [box, setB] = useState(Array(numBoxes));

  function renderBox(i: string | null) {
    return <Box value={i} />;
  }
  var boxes = [];
  for (var i = 0; i < numBoxes; ++i) {
    boxes.push(renderBox(null));
  }
  return <div className="row">{boxes}</div>;
}

function Grids(grids : Array<string>, numRows = 5, numCols = 5) {
  function renderRow(value: string[]) {
    return Row(value);
  }

  var rows = [];
  for (var i = 0; i < numRows; ++i) {
    rows.push(renderRow(grids.slice(i * numCols, (i + 1) * numCols + 1)));
  }
  return <div className="grids">{rows}</div>;
}

function key() {
  // implement
}

function keyboard() {
  // implement
}

function Game() {
  const maxX = 5;
  const maxY = 5;
  // coord contains the location coordinate of the first empty box on the grid
  const [coord, setCoord] = useState(0);
  const [grids, setBox] = useState(Array(maxX * maxY));
  document.addEventListener("keydown", (event) => {
    if (isAlpha(event.key) && coord < maxX * maxY && (coord % maxY) + 1 < maxX) {
      var newGrid = grids.slice();
      newGrid[coord] = event.key;
      setBox(newGrid);
      setCoord(coord + 1);
    }
    if (event.key === 'backspace') {
      newGrid = grids.slice();
      newGrid[coord] = null;
      setBox(newGrid);
      setCoord(coord - 1);
    }
  }
  );
  return Grids(grids);

  function isAlpha(char: string) {
    return ('A' <= char && char <= 'z')
  }
}

ReactDOM.render(<Game />, document.getElementById("root"));
