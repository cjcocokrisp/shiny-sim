import React from "react";
import { createRoot } from "react-dom/client";
import Home from "./app";
import './main.css'

const container = document.getElementById('root')
const root = createRoot(container)
root.render(<Home></Home>)