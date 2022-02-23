import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import "./index.css";

class LetterState {
  // Create new instances of the same class as static attributes
  static unvalidated = new LetterState("unvalidated");
  static unmatched = new LetterState("unmatched");
  static wrong_ordered = new LetterState("wrong_ordered");
  static correct = new LetterState("correct");

  name: string = "";

  constructor(name: string) {
    this.name = name;
  }
}

// Corresponds to each letter input
class Letter {
  letter: string = "";
  //  0: unvalidated
  //  1: no match
  //  2: wrong order
  //  3: correct
  state: LetterState = LetterState.unvalidated;
}

function Box(props: any) {
  const className = "box";

  return (
    <button className={className + " " + props.value.state.name} disabled>
      {props.value.letter}
    </button>
  );
}

function Row(props: any) {
  function renderBox(value: Letter) {
    return <Box value={value} />;
  }

  let className: string = "row";
  let row: Array<JSX.Element> = [];
  for (var i in props.values) {
    row.push(renderBox(props.values[i]));
  }
  if (props.center) {
    className += ' center';
  }
  return <div className={className}>{row}</div>;
}

function Keyboard(props: any) {
  function renderRow(values: Letter[]) {
    return <Row values={values} center />;
  }

  const classname = "keyboard";
  // letters in the order placed on the keyboard
  const keys: Letter[][] = [
    "qwertyuiop".split(""),
    "asdfghjkl".split(""),
    "zxcvbnm".split(""),
  ].map((lst) =>
    lst.map((s) => {
      let l: Letter = new Letter();
      l.letter = s;
      return l;
    })
  );
  const keyList: Letter[] = keys.flat();
  const grids: Letter[] = props.grids.flat();
  // Colorcode used letters
  grids.forEach((element: Letter) => {
    keyList.forEach((e) => {
      if (e.letter === element.letter) {
        e.state = LetterState.unmatched;
      }
    });
  });

  let keyboard = [];
  for (let i = 0; i < keys.length; ++i) {
    keyboard.push(renderRow(keys[i]));
  }
  return <footer className={classname}>{keyboard}</footer>;
}

function Gameboard(props: any) {
  function renderRow(values: Letter[]) {
    return <Row values={values} />;
  }

  function handleKey(event: KeyboardEvent) {
    let newGrids: Letter[][] = grids.slice();
    let newIdx: Array<number> = idx.slice();
    // Adds input if is letter and row is not filled
    if (event.key.match(/^[a-z]$/) && idx[1] < props.length) {
      newGrids[idx[0]][idx[1]].letter = event.key;
      newIdx[1] += 1;
    }
    // Complete row if it is completely filled
    // TODO: Color backgrounds depending on match with word
    if (event.key === "Enter" && newIdx[1] === props.length) {
      let word: string = newGrids[newIdx[0]].reduce((prevValue, currValue) => {
        return prevValue + currValue.letter;
      }, "");
      // check word is a word
      if (props.dict.includes(word)) {
        // TODO: Check for match
        // TODO: Check game over
        // set state of each letter in the row matching against the word
        for (let i = 0; i < props.length; ++i) {
          // check for match
          if (word[i] === props.word[0][i]) {
            newGrids[newIdx[0]][i].state = LetterState.correct;
          } else if (props.word[0].includes(word[i])) {
            newGrids[newIdx[0]][i].state = LetterState.wrong_ordered;
          } else {
            newGrids[newIdx[0]][i].state = LetterState.unmatched;
          }
        }
        // move to the next row
        newIdx[0] += 1;
        newIdx[1] = 0;
      }
    }
    // Remove last input on the row
    if (event.key === "Backspace" && newIdx[1] > 0) {
      newIdx[1] -= 1;
      newGrids[newIdx[0]][newIdx[1]].letter = "";
    }
    setGrids(newGrids);
    setIdx(newIdx);
  }

  const className: string = "gameboard";
  // Populates grids with distinct arrays
  const [grids, setGrids] = useState(
    Array(props.tries)
      .fill(null)
      .map((n) =>
        Array(props.length)
          .fill(null)
          .map((n) => new Letter())
      )
  );
  let board = [];
  for (var i in grids) {
    board.push(renderRow(grids[i]));
  }
  const [idx, setIdx] = useState([0, 0]);

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  });
  return (
    <div className={className}>
      {board}
    <Keyboard grids={grids}></Keyboard>
    </div>
  );
}

function Game() {
  let length: number = 5;
  let height: number = 6;
  let dict: string[] = [];
  // TODO: Don't use a list
  let word: String[] = [];
  // Fetch words of length long
  useEffect(() => {
    fetch("usa.txt")
      .then((response) => response.text())
      .then((text) => {
        text.split("\n").forEach((value) => {
          if (value.length === length) {
            dict.push(value);
          }
        });
        word.push(dict[Math.floor(Math.random() * dict.length)]);
        console.log('There are ' + dict.length + ' ' + length + '-letter words.');
        console.log('The answer is ' + word[0] + '.');
      });
  });

  return (
    <div>
      <Gameboard dict={dict} word={word} length={length} tries={height} />
    </div>
  );
}

ReactDOM.render(<Game />, document.getElementById("root"));
