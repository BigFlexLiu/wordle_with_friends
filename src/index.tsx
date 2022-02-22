import React, { useEffect, useState } from "react";
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

  let className: string = "row";
  let row: Array<JSX.Element> = [];
  for (var value in props.values) {
    row.push(renderBox(props.values[value]));
  }
  return <div className={className}>{row}</div>;
}

function Board(props: any) {
  function renderRow(values: string[]) {
    return <Row values={values} />;
  }

  function handleKey(event: KeyboardEvent) {
    let newGrids: Array<Array<string>> = grids.slice();
    let newIdx: Array<number> = idx.slice();
    // Adds input if is letter and row is not filled
    if (event.key.match(/^[a-z]$/) && idx[1] < props.length) {
      newGrids[idx[0]][idx[1]] = event.key;
      newIdx[1] += 1;
    }
    // Complete row if it is completely filled
    // TODO: validate row against dictionary
    if (event.key === "Enter" && newIdx[1] === props.length) {
      newIdx[0] += 1;
      newIdx[1] = 0;
    }
    // Remove last input on the row
    if (event.key === "Backspace" && newIdx[1] > 0) {
      newIdx[1] -= 1;
      newGrids[newIdx[0]][newIdx[1]] = "";
    }
    setGrids(newGrids);
    setIdx(newIdx);
  }

  const className: string = "board";
  // Populates grids with distinct arrays
  const [grids, setGrids] = useState(
    Array(props.tries)
      .fill(null)
      .map((n) => Array(props.length).fill(null))
  );
  const [idx, setIdx] = useState([0, 0]);

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  });

  let board = [];
  for (var i in grids) {
    board.push(renderRow(grids[i]));
  }
  return <div className={className}>{board}</div>;
}

function Game() {
  let length: number = 5;
  let height: number = 5;
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
