import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import "./index.css";
import Menu from "./menu";
import PersistentDrawerLeft from "./sidebar";

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
    className += " center";
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
    if (event.key === "Enter" && newIdx[1] === props.length) {
      let word: string = newGrids[newIdx[0]].reduce((prevValue, currValue) => {
        return prevValue + currValue.letter;
      }, "");
      // check word is a word
      if (props.dict.includes(word)) {
        // set state of each letter in the row matching against the word
        for (let i = 0; i < props.length; ++i) {
          // check for match
          if (word[i] === props.word[i]) {
            newGrids[newIdx[0]][i].state = LetterState.correct;
          } else if (props.word.includes(word[i])) {
            newGrids[newIdx[0]][i].state = LetterState.wrong_ordered;
          } else {
            newGrids[newIdx[0]][i].state = LetterState.unmatched;
          }
        }
        // Game won or lost
        // TODO: Make it more happy
        if (props.word === word) {
          setIsGameWon(true);
        } else if (newIdx[0] + 1 === props.tries) {
          setIsGameOver(true);
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
  const [isGameWon, setIsGameWon] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  let board = [];
  for (var i in grids) {
    board.push(renderRow(grids[i]));
  }
  const [idx, setIdx] = useState([0, 0]);

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  });

  // Update the rest and show end game alart
  useEffect(() => {
    if (isGameWon) {
      window.setTimeout(
        () => alert("Congratulations, you found the word."),
        100
      );
    } else if (isGameOver) {
      window.setTimeout(
        () => alert("Game over. The word is " + props.word + "."),
        100
      );
    }
  }, [isGameOver, isGameWon]);

  return (
    <div className={className}>
      {board}
      <Keyboard grids={grids}></Keyboard>
    </div>
  );
}

function Game() {
  const title: string = "wordle with friends";
  const textfile = "wiki-100k.txt";
  const length = 5;
  const [tries, setTries] = useState<number>(6);
  const [dict, setDict] = useState<string[]>([]);
  const [word, setWord] = useState<string>("");

  document.title = title;
  // Fetch words of length long
  useEffect(() => {
    fetch(textfile)
      .then((response) => response.text())
      .then((text) => {
        text.split("\n").forEach((value) => {
          if (value.length === length) {
            dict.push(value); // Intentional
          }
        });
        setWord(dict[Math.floor(Math.random() * dict.length)]);
      });
  }, []);

  if (word !== "") {
    console.log("There are " + dict.length + " " + length + "-letter words.");
    console.log("The answer is " + word + ".");
  }

  return (
    <div>
      <PersistentDrawerLeft setWord={setWord} setTries={setTries}/>
      <Gameboard dict={dict} word={word} length={word.length | length} tries={tries} />
    </div>
  );
}

ReactDOM.render(<Game />, document.getElementById("root"));
