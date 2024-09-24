import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./home";
import Stats from "./stats"
import './main.css'
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { createTheme, ThemeProvider } from "@mui/material";
import Hunt from "./hunt";

const container = document.getElementById('root')
const root = createRoot(container)

const mainTheme = createTheme({
    palette: {
        primary: {
            main: '#b1e56a'
        },
        secondary: {
            main: '#6a93f2'
        }
    }
});

export default function App () {    
    return (
        <ThemeProvider theme={mainTheme}>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home/>} />
                    <Route path="/simulate/*" element={<Hunt type="Simulation"/>} />
                    <Route path="/track/*" element={<Hunt type="Tracked" />} />
                    <Route path="stats/*" element={<Stats/>} />
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    );
}

root.render(<App />)