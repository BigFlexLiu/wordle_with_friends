import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { JsxAttributes, transform } from "typescript";
import { decode } from "./hash";
import PersistentDrawerLeft from "./sidebar";

enum LetterState {
  unvalidated = "unvalidated",
  unmatched = "unmatched",
  wrong_ordered = "wrong_ordered",
  correct = "correct",
}

// Corresponds to each letter input
class Letter {
  letter: string = "";
  state: LetterState = LetterState.unvalidated;
}

function Box({ letter }: { letter: Letter }) {
  const classNames = ["box", letter.state];
  let backgroundColor = "#222222";
  switch (letter.state) {
    case LetterState.unmatched:
      backgroundColor = "#888888";
      break;
    case LetterState.wrong_ordered:
      backgroundColor = "#cc3";
      break;
    case LetterState.correct:
      backgroundColor = "#3c3";
      break;
  }

  return (
    <button
      className={classNames.join(" ")}
      style={{
        color: "#FFF",
        fontSize: "35px",
        textTransform: "capitalize",
        verticalAlign: "top",
        backgroundColor: backgroundColor,
        border: "1px solid #c4c4c4",
        width: "50px",
        height: "50px",
        marginRight: "5px",
        marginBottom: "5px",
      }}
      disabled
    >
      {letter.letter}
    </button>
  );
}

function Row({ letters, center }: { letters: Letter[]; center: boolean }) {
  let classNames = ["row"];
  let row: Array<JSX.Element> = [];
  for (var i in letters) {
    row.push(<Box letter={letters[i]} />);
  }
  const style: React.CSSProperties = {};
  if (center) {
    style.textAlign = "center";
    style.left = "50%";
  }
  return (
    <div className={classNames.join(" ")} style={style}>
      {row}
    </div>
  );
}

function Keyboard({ grids }: { grids: Letter[][] }) {
  const classnames = ["keyboard"];
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
  const flatGrids: Letter[] = grids.flat();
  // Colorcode used letters
  flatGrids.forEach((element: Letter) => {
    keyList.forEach((e) => {
      if (e.letter === element.letter) {
        e.state = LetterState.unmatched;
      }
    });
  });

  return (
    <footer
      className={classnames.join(" ")}
      style={{
        position: "absolute",
        top: "100vh",
        transform: "translate(-25%, -150%)",
        width: "200%",
      }}
    >
      {keys.map((k) => (
        <Row letters={k} center={true} />
      ))}
    </footer>
  );
}

function Gameboard(props: {
  dict: string[];
  word: string;
  length: number;
  tries: number;
}) {
  function handleKey(event: KeyboardEvent) {
    // If a text field is focused, then do nothing
    const element: Element | null = document.activeElement;
    const sidebar: Element = document.getElementById("box")!;
    if (element && sidebar.contains(element)) {
      return;
    }

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

  const classNames = ["gameboard"];
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
    board.push(<Row letters={grids[i]} center={false} />);
  }
  const [idx, setIdx] = useState([0, 0]);

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  });

  // Update the rest and show end game alert
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
    <div
      style={{
        position: "fixed",
        width: "100vw",
        left: "50%",
        textAlign: "center",
        transform: "translate(-50%, 0)",
      }}
      className={classNames.join(" ")}
    >
      {board}
      <Keyboard grids={grids}></Keyboard>
    </div>
  );
}

function Game() {
  const title: string = "wordle with friends";
  const textfile = "wiki-100k.txt";
  const [tries, setTries] = useState<number>(6);
  const [dict, setDict] = useState<string[]>([]);
  const [word, setWord] = useState<string>("");
  const [fullDict, setFullDict] = useState<string[]>([]);

  // Set word and tries depending on the link
  const [assignedWord, assignedTries] = decode(window.location.search) ?? [null, null];

  // Set page background color
  useEffect(() => {
    document.documentElement.style.setProperty('background-color', '#222222');
  }, []);

  useEffect(() => {
    if (assignedWord && assignedTries) {
      setWord(assignedWord);
      setTries(assignedTries);
    }
  }, []);

  // Fetch words of length long
  useEffect(() => {
    fetch(textfile)
      .then((response) => response.text())
      .then((text) => {
        setFullDict(text.split("\n"));
        const wordLength = assignedWord ? assignedWord.length : 5;
        const plDict: string[] = [];
        text.split("\n").forEach((value) => {
          if (value.length === wordLength) {
            plDict.push(value);
          }
        });
        setDict(plDict);
        if (!assignedWord) {
          setWord(plDict[Math.floor(Math.random() * plDict.length)]);
        }
        console.log(
          "There are " + plDict.length + " " + wordLength + "-letter words."
        );
      });
  }, []);

  if (word !== "") {
    console.log("The answer is " + word + ".");
  }

  document.title = title;

  if (word !== "") {
    return (
      <div style={{ backgroundColor: "#222222" }}>
        <PersistentDrawerLeft dict={fullDict} />
        <Gameboard dict={dict} word={word} length={word.length} tries={tries} />
      </div>
    );
  }
  return null;
}

ReactDOM.render(<Game/>, document.getElementById("root"));
