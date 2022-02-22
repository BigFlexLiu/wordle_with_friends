import React, { useEffect, useState, useCallback, useRef } from "react";
import ReactDOM from "react-dom";
import "./index.css";

function Box(props: any) {
  const className = "box";

  return (
    <button className={className} disabled>
      {props.value}
    </button>
  );
}

function Row(props: any) {
  function renderBox(value: string) {
    return <Box value={value} />;
  }

  let className = "row";
  let row = [];
  for (var value in props.values) {
    row.push(renderBox(props.values[value]));
  }
  return <div className={className}>{row}</div>;
}

function Board(props: any) {
  function renderRow(values: string[]) {
    return <Row values={values} />;
  }

  function updateGrids(event: KeyboardEvent) {
    // update grids
    let newGrids = grids.slice();
    newGrids[idx[0]][idx[1]] = event.key;
    setGrids(newGrids);
    // update index
    let newIdx = idx.slice();
    newIdx[1] += 1;
    if (newIdx[1] === props.length) {
      newIdx[0] += 1;
      newIdx[1] = 0;
    }
    setIdx(newIdx);
    console.log(newGrids);
    console.log(newIdx);
  }

  const className = "board";
  // Populates grids with distinct arrays
  const [grids, setGrids] = useState(
    Array(props.tries)
      .fill(null)
      .map((n) => Array(props.length).fill(null))
  );
  const [idx, setIdx] = useState([0, 0]);

  useEffect(() => {
    document.addEventListener("keydown", updateGrids
    );
    return () => document.removeEventListener("keydown", updateGrids);
  });

  let board = [];
  for (var i in grids) {
    board.push(renderRow(grids[i]));
  }
  return <div className={className}>{board}</div>;
}

function Game() {
  let length = 5;
  let height = 5;
  // Fetch words of length long
  let dict: string[] = [];
  fetch("usa.txt")
    .then((response) => response.text())
    .then((text) => {
      text.split("\n").forEach((value) => {
        if (value.length === length) {
          dict.push(value);
        }
      });
    });

  return <Board dict={dict} length={length} tries={height} />;
}

ReactDOM.render(<Game />, document.getElementById("root"));
