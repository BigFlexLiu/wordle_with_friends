import React, { ReactElement, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { decode } from "./hash";
import { PersistentDrawerLeft } from "./sidebar";
import { wordsList } from "./words";
import { FaBackspace } from "react-icons/fa";
import { BsArrowReturnLeft } from "react-icons/bs";

enum LetterState {
  unvalidated = "unvalidated",
  unmatched = "unmatched",
  wrong_ordered = "wrong_ordered",
  correct = "correct",
}

// Corresponds to each letter input
class Letter {
  letter: string = "";
  icon: ReactElement | null = null;
  state: LetterState = LetterState.unvalidated;
}

function Box({ letter, isKey }: { letter: Letter; isKey: boolean }) {
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
  // Refresh hook
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  function handleResize(e: UIEvent) {
    setScreenWidth(window.innerWidth);
  } 

  useEffect(() => {
    document.addEventListener('resize', handleResize);
    return () => document.removeEventListener('resize', handleResize);
  });

  const size: string = '2.5vw';
  const defaultFontSize: string = '1.4vw';
  const minSize: number = isKey ? 30 : 25;
  const useMinSize = screenWidth * 0.025 <= minSize;

  const sizeStyles: React.CSSProperties = {
    fontSize: useMinSize ? screenWidth * 0.08 - 10 + 'px' : defaultFontSize,
    width: useMinSize ? screenWidth * 0.09 + 'px' : size,
    height: useMinSize ? screenWidth * 0.1 * (isKey ? 1.25 : 1) + 'px' : size,
  };

  return (
    <button
      key={letter.letter}
      className={classNames.join(" ")}
      style={{
        ...sizeStyles,
        color: "#FFF",
        textTransform: "capitalize",
        verticalAlign: "top",
        backgroundColor,
        border: "2px solid #c4c4c4",
        marginRight: "0.5vw",
        marginBottom: "0.5vw",
        padding: 0,
      }}
      onClick={() => {
        if (isKey) {
          document.dispatchEvent(
            new KeyboardEvent("keydown", { key: letter.letter })
          );
        }
      }}
    >
      {letter.icon || letter.letter}
    </button>
  );
}

function Row({ letters, center }: { letters: Letter[]; center: boolean }) {
  let classNames = ["row"];
  let row: Array<JSX.Element> = letters.map((e, i) => (
    <Box key={i} letter={e} isKey={center} />
  ));
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
    ["Backspace"].concat("zxcvbnm".split("")).concat("Enter"),
  ].map((lst) =>
    lst.map((s) => {
      let l: Letter = new Letter();
      l.letter = s;
      // Add icon to backspace
      if (s === "Backspace") {
        l.icon = <FaBackspace />;
      } else if (s === "Enter") {
        l.icon = <BsArrowReturnLeft fill="white" color="green" />;
      }
      return l;
    })
  );
  const keyList: Letter[] = keys.flat();
  const flatGrids: Letter[] = grids.flat();
  // Add icon for backspace
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
        position: "fixed",
        bottom: 0,
        transform: "translate(-25%, 0%)",
        width: "200%",
      }}
    >
      {keys.map((k, i) => (
        <Row key={i} letters={k} center={true} />
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
        let letters = props.word.split("");
        // Check correct
        for (let i = 0; i < props.length; ++i) {
          if (word[i] === letters[i]) {
            newGrids[newIdx[0]][i].state = LetterState.correct;
            letters[i] = "";
          }
        }
        // Check wrong_ordered
        for (let i = 0; i < props.length; ++i) {
          if (newGrids[newIdx[0]][i].state === LetterState.unvalidated) {
            if (letters.includes(word[i])) {
              newGrids[newIdx[0]][i].state = LetterState.wrong_ordered;
              letters.splice(i, 1);
            } else {
              newGrids[newIdx[0]][i].state = LetterState.unmatched;
            }
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
      .map(() =>
        Array(props.length)
          .fill(null)
          .map(() => new Letter())
      )
  );
  const [isGameWon, setIsGameWon] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  let board = [];
  for (var i in grids) {
    board.push(<Row key={i} letters={grids[i]} center={false} />);
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
        flexGrow: 1,
        position: "fixed",
        height: "85%",
        width: "100vw",
        left: "50%",
        textAlign: "center",
        transform: "translate(-50%, 0%)",
        marginTop: 30,
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
  const [tries, setTries] = useState<number>(6);
  const [dict, setDict] = useState<string[]>([]);
  const [word, setWord] = useState<string>("");

  // Set word and tries depending on the link
  const [assignedWord, assignedTries] = decode(window.location.search) ?? [
    null,
    null,
  ];

  // Set page background color
  useEffect(() => {
    document.documentElement.style.setProperty("background-color", "#222222");
  }, []);

  useEffect(() => {
    if (assignedWord && assignedTries) {
      setWord(assignedWord);
      setTries(assignedTries);
    }
  }, []);

  // Fetch words of length long
  useEffect(() => {
    const wordLength = assignedWord ? assignedWord.length : 5;
    const plDict: string[] = [];
    wordsList.forEach((value) => {
      if (value.length === wordLength) {
        plDict.push(value); // Intentional
      }
    });
    setDict(plDict);
    if (!assignedWord) {
      setWord(plDict[Math.floor(Math.random() * plDict.length)]);
    }
    console.log(
      "There are " + plDict.length + " " + wordLength + "-letter words."
    );
  }, []);

  if (word !== "") {
    console.log("The answer is " + word + ".");
  }

  document.title = title;

  if (word !== "") {
    return (
      <div style={{ backgroundColor: "#222222" }}>
        <PersistentDrawerLeft dict={wordsList} />
        <Gameboard dict={dict} word={word} length={word.length} tries={tries} />
      </div>
    );
  }
  return null;
}

ReactDOM.render(<Game />, document.getElementById("root"));
