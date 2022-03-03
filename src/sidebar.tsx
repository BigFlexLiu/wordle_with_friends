import * as React from "react";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import CssBaseline from "@mui/material/CssBaseline";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import * as Hash from "./hash";

const drawerWidth = 50;

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}%)`,
    marginLeft: `${drawerWidth}%`,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  // justifyContent: "flex-end",
}));

export function PersistentDrawerLeft(props: any) {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);

  const [generated, setGenerated] = React.useState<string | null>(null);

  const [inputWord, setInputWord] = React.useState("");
  const [inputTries, setInputTries] = React.useState(6);
  const [isInputWordValid, setIsInputWordValid] = React.useState(false);
  const [isInputTriesValid, setIsInputTriesValid] = React.useState(true);
  const refInputWord = React.useRef<HTMLInputElement>(null);
  const refInputTries = React.useRef<HTMLInputElement>(null);

  function handleInputWordOnChange(event: { target: HTMLInputElement }) {
    const newWord: string = event.target.value;
    // Check new word only contains letters
    const match = newWord.match(/^[a-z]+$/);
    if (match && match[0] !== newWord) {
      event.target.setCustomValidity("word can only contain letters");
      setIsInputWordValid(false);
      return;
    }
    if (!props.dict.includes(newWord)) {
      event.target.setCustomValidity("word not in the dictionary. :(");
      setInputWord(newWord);
      setIsInputWordValid(false);
      return;
    }
    event.target.setCustomValidity("");
    setInputWord(newWord);
    setIsInputWordValid(true);
  }

  function handleInputTriesOnChange(event: { target: HTMLInputElement }) {
    const newTries = parseInt(event.target.value);
    if (
      isNaN(newTries) ||
      newTries < 1 ||
      Hash.maxTries <= newTries 
    ) {
      event.target.setCustomValidity(
        "The number of tries must be a integer between 1-10."
      );
      setIsInputTriesValid(false);
      return;
    }
    setInputTries(newTries);
    setIsInputTriesValid(true);
  }

  // Close the appbar if the user clicks outside of it
  window.onclick = function (event) {
    const appbar = document.getElementById("drawer")!;
    const menu = document.getElementById("menu")!;
    if (
      !appbar.contains(event!.target as Element) &&
      !menu.contains(event!.target as Element)
    ) {
      setOpen(false);
    }
  };

  return (
    <Box id="box" sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            id="menu"
            color="inherit"
            aria-label="open drawer"
            onClick={() => setOpen(true)}
            edge="start"
            sx={{ mr: 2, ...(open && { display: "none" }) }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" alignSelf="center">
            wordle with friends
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        id="drawer"
        sx={{
          width: `${drawerWidth}%`,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: `${drawerWidth}%`,
            boxSizing: "border-box",
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader>
          <h2 className="sidebarHeading" 
            style={{
              textAlign: "center",
              flexGrow: "1",
            }}>make your wordle</h2>
          <IconButton onClick={() => setOpen(false)}>
            {theme.direction === "ltr" ? (
              <ChevronLeftIcon />
            ) : (
              <ChevronRightIcon />
            )}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <form className="make_wordle">
          <label>Enter your word: </label>
          <input
            ref={refInputWord}
            type="text"
            value={inputWord}
            onChange={handleInputWordOnChange}
            placeholder="your word"
            size={Hash.wordMaxLength}
            maxLength={Hash.wordMaxLength}
          ></input>
          <br></br>
          <label style={formStyle}>Enter number of tries: </label>
          <input
            style={formStyle}
            id="input_tries"
            type="number"
            ref={refInputTries}
            value={inputTries}
            onChange={handleInputTriesOnChange}
            min={1}
            max={10}
            required
          ></input>
          <br></br>
          <input
            type="button"
            style={formStyle}
            onClick={(e) => {
              if (refInputWord?.current?.checkValidity() === false) {
                refInputWord?.current?.reportValidity();
              }
              if (refInputTries?.current?.checkValidity() === false) {
                refInputTries?.current?.reportValidity();
              }
              if (isInputTriesValid && isInputWordValid) {
                generateWordle();
              } else {
                setGenerated(null);
              }
            }}
            value="Generate"
          ></input>

          {generated && (
            <React.Fragment>
              <h2>Go to the following link</h2>
              <h3
                id="generated"
                style={{
                  wordWrap: "break-word",
                }}
              >
                {generated}
              </h3>
            </React.Fragment>
          )}
        </form>
      </Drawer>
      <Main open={open}>
        <DrawerHeader />
      </Main>
    </Box>
  );

  function generateWordle() {
    setGenerated(Hash.encode(inputWord, inputTries));
  }
}
