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
import { ClassNames } from "@emotion/react";

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

export default function PersistentDrawerLeft(props: any) {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  // Gives custom warning about invalid word
  let input = document.getElementById("input_word") as HTMLInputElement | null;
  if (input) {
    input!.oninput = (e) => {
      input!.setCustomValidity("");
      input!.oninvalid = (event) => {
        input!.setCustomValidity("Word can only contain alphabets.");
      };
    };
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
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            id="menu"
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
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
          <h2 className="sidebarHeading">make your wordle</h2>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === "ltr" ? (
              <ChevronLeftIcon />
            ) : (
              <ChevronRightIcon />
            )}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <form className="make_wordle" action="" method="get">
          <label>Enter your word: </label>
          <input
            id="input_word"
            type="text"
            placeholder="your word"
            size={15}
            pattern="[a-zA-Z]+"
          ></input>
          <br></br>
          <label>Enter number of tries: </label>
          <input
            id="input_tries"
            type="number"
            min={1}
            max={10}
            required
          ></input>
          <br></br>
          <input
            type="submit"
            onClick={() => {
              generateWordle();
            }}
            value="Generate"
          ></input>
        </form>
      </Drawer>
      <Main open={open}>
        <DrawerHeader />
      </Main>
    </Box>
  );

  function generateWordle() {
    const word: string = (
      document.getElementById("input_word") as HTMLInputElement
    ).value;
    const tries: number = parseInt(
      (document.getElementById("input_tries") as HTMLInputElement).value
    );

    props.setWord(word);
    props.setTries(tries);
  }
}
