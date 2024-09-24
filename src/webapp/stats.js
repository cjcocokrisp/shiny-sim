import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom';
import Fab from "@mui/material/Fab"
import ArrowBackIcon  from "@mui/icons-material/ArrowBack";
import SettingsIcon from "@mui/icons-material/Settings"
import { useNavigate } from "react-router-dom";

export default function Stats() {
    const [name, setName] = useState("");
    const [mon, setMon] = useState("");
    const [encounters, setEncounters] = useState(0);
    const [odds, setOdds] = useState("");
    const [status, setStatus] = useState(false);
    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");
    const [loading, setLoading] = useState(true);
    const [imgUrl, setImgUrl] = useState("");


    const navigate = useNavigate();

    let trim = 7;
    let path = useLocation().pathname.substring(trim)
    if (name === "") {
        setName(decodeURI(path));
    }

    useEffect(() => {
        fetch(`/api/hunt/${name}`).then(res => {
            res.json().then(data => {
                setMon(data["mon"]);
                setEncounters(data["encounters"]);
                setOdds(data["odds"]);
                setStatus(data["status"]);
                setStart(data["start"])
                setEnd(data["end"]);
            
                setLoading(false);
                determineImgUrl();
            })
        })        
    }, [mon, encounters, status, start, end, loading]);

    const determineImgUrl = () => {
        let type = status ? 'shiny' : 'default';
        if (mon === "Missingno") {    
            setImgUrl(`../../missingno_${type}.png`);
        } else if (mon !== "") {
            fetch(`https://pokeapi.co/api/v2/pokemon/${mon.toLowerCase()}/`).then(res => {
                res.json().then(data => {
                    setImgUrl(data["sprites"][`front_${type}`]);
                });
            })
        }
    }

    if (loading) return (
        <div className="h-screen flex justify-center items-center">
            <h1 className="text-5xl">Loading...</h1>
        </div>
    )

    return (
        <div className="flex flex-col justify-between items-center mt-[5vh] min-h-[50vh]">
            <div className="flex gap-[10vw] w-[40vw]">
                <Fab color="primary" aria-label="return" className='self-end' onClick={() => { navigate('/') }}>
                    <ArrowBackIcon />
                </Fab>
                <h1 className="text-5xl">{name}</h1>
            </div>
            <div className="flex gap-[8vw]">
                <div className="self-center ">
                    <h1 className="text-3xl text-center">Mon: {mon}</h1>
                    <h1 className="text-3xl text-center">Encounters: {encounters}</h1>
                    <h1 className="text-3xl text-center">Odds: {odds}</h1>
                    <h1 className="text-3xl text-center">Status: {status ? "Found" : "Not Found"}</h1>
                    <h1 className="text-3xl text-center">Start: {start}</h1>
                    <h1 className="text-3xl text-center">End: {end}</h1>
                </div>
                <div className="flex max-w-[300px] max-h-[300px]">
                    <img src={imgUrl} className="w-[300px] h-[300px]"/>
                </div>
            </div>
        </div>
    )
}