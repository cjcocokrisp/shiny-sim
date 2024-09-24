import React, { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import Fab from "@mui/material/Fab"
import ArrowBackIcon  from "@mui/icons-material/ArrowBack";
import SettingsIcon from "@mui/icons-material/Settings"
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import { Dialog, DialogTitle } from '@mui/material';
import TextField from '@mui/material/TextField';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from "@mui/icons-material/Remove";
import sound from '../../public/sparkle.mp3'

function OptionsDialog(props) {
    const { name, onClose, open, delaySeconds, setDelaySeconds, odds } = props;
    const [ oddsRolls, setOddsRolls ] = useState(odds != null ? odds.split('/')[0] : "");
    const [ oddsChance, setOddsChance ] = useState(odds != null ? odds.split('/')[1] : "");

    const handleClose = (changed, odds) => {
        onClose(changed, odds);
    }

    const onSubmit = () => {
        let params = new URLSearchParams;
        params.set("odds", oddsRolls + '/' + oddsChance);
        
        fetch(`/api/hunt/${name}?` + params.toString(), { method: "PATCH" }).then((res) => {
            console.log(res.status);
        });
        handleClose(true, oddsRolls + '/' + oddsChance);
    }

    const handleNumValidation = (stateSet) => {
        return (event) => {
            const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
            let numStr = "";
            for (let i = 0; i < event.target.value.length; i++) {
                let c = event.target.value[i];
                if (digits.includes(c)) numStr += c; 
            }
            console.log(stateSet)
            if (numStr === "") stateSet("");
            else stateSet(numStr);
        }
    } 

    return (
        <Dialog open={open} onClose={() => handleClose(false, null)} PaperProps={{sx: {bgcolor: "secondary.main"}}}>
            <DialogTitle className="self-center">Options</DialogTitle>
            <h1 className="self-center">Odds:</h1>
            <div className='flex justify-center gap-[0.5vw] mb-[2vh]'>
                    <TextField style={{maxWidth: "7vw"}} value={oddsRolls} label="Rolls" variant="outlined" onChange={handleNumValidation(setOddsRolls)}/>
                    <p className='self-center text-xl'>/</p>
                    <TextField style={{maxWidth: "7vw"}} value={oddsChance} label="Chance" variant="outlined" onChange={handleNumValidation(setOddsChance)}/>
            </div>
            <TextField className="self-center" style={{ marginBottom: "2vh" }} value={delaySeconds} label="Delay (Seconds)" variant="outlined" onChange={handleNumValidation(setDelaySeconds)}/>
            <div className="self-center">
                <Button variant="contained" style={{maxWidth: "6vw", marginBottom: "3vh"}} onClick={onSubmit}>Save</Button>
            </div>
        </Dialog>
    )
}

export default function Hunt(props) {
    const { type } = props
    const [name, setName] = useState("");
    const [mon, setMon] = useState("");
    const [encounters, setEncounters] = useState(0);
    const [odds, setOdds] = useState("");
    const [status, setStatus] = useState(false);
    const [loading, setLoading] = useState(true);
    const [imgUrl, setImgUrl] = useState("");
    const [open, setOpen] = useState(false);
    const [delaySeconds, setDelaySeconds] = useState("0");
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [opacity, setOpacity] = useState("opacity-0");
    const navigate = useNavigate();
    var timeout;
    let audio = new Audio(sound);

    let trim = type === "Simulation" ? 10 : 7;
    let path = useLocation().pathname.substring(trim);
    if (name === "")
        setName(decodeURI(path));

    useEffect(() => {
        fetch(`/api/hunt/${name}`).then(res => {
            res.json().then(data => {
                setMon(data["mon"]);
                setEncounters(data["encounters"]);
                setOdds(data["odds"]);
                setStatus(data["status"]);
            
                setLoading(false);
                determineImgUrl();
            })
        })        
    }, [mon, encounters, status, loading, imgUrl]);

    const handleOptionsDialogOpen = () => {
        setOpen(true);
    }

    const handleOptionsDialogClose = (changed, odds) => {
        if (changed) {
            setOdds(odds);
        }
        setOpen(false);
    }

    const updateHunt = (found, increment) => {
        let params = new URLSearchParams;
        if (found) {
            params.set("encounters", encounters + increment);
            params.set("status", true);
            params.set("end", "update");
            audio.play();
        }
        params.set("encounters", encounters + increment);
        fetch(`/api/hunt/${name}?` + params.toString(), { method: "PATCH" }).then((res) => {
            setEncounters(encounters + increment);
            if (found) {
                setStatus(true);
                determineImgUrl();
                setOpacity("opacity-100");
                timeout = setTimeout(() => {setOpacity("opacity-0")}, 2000);
            }
        })
    }

    const roll = () => {
        setButtonDisabled(true);
        let params = new URLSearchParams;
        params.set("odds", odds);
        
        fetch('/api/roll?' + params.toString()).then((res) => {
            res.text().then((data) => {
                let result = data === "true" ? true : false;
                updateHunt(result, 1);
            });
        });
        timeout = setTimeout(() => {setButtonDisabled(false)}, parseInt(delaySeconds) * 1000);
    }

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

    function determineButtons() {
        if (type === "Simulation") {
            return (
                <Button onClick={roll} disabled={buttonDisabled || status} variant="contained" color="secondary" style={{minWidth: "10vw", minHeight: "7vh"}}>Roll</Button>
            )
        } else if (type === "Tracked") {
            return (
                <div className="flex gap-[1vw]">
                    <Fab color="secondary" disabled={status} aria-label="remove" onClick={() => {updateHunt(false, -1)}}>
                        <RemoveIcon />
                    </Fab>
                    <Button variant="contained" disabled={status} color="secondary" style={{minWidth: "6vw", minHeight: "7vh"}} onClick={() => {updateHunt(true, 1)}}>Found</Button>
                    <Fab color="secondary" disabled={status} aria-label="add" onClick={() => {updateHunt(false, 1)}}>
                        <AddIcon />
                    </Fab>
                </div>
            )
        }
    }

    return (
        <div className="flex flex-col justify-between items-center mt-[5vh] min-h-[90vh]">
            <div className="flex justify-between w-[70vw]">
                <Fab color="primary" aria-label="return" className='self-end' onClick={() => { navigate('/') }}>
                    <ArrowBackIcon />
                </Fab>
                <h1 className="text-5xl">{name}</h1>
                <Fab color="primary" aria-label="settings" className='self-end' onClick={handleOptionsDialogOpen}>
                    <SettingsIcon />
                </Fab>
            </div>
            <div className="flex gap-[8vw]">
                <div className="self-center ">
                    <h1 className="text-3xl">Encounters: {encounters}</h1>
                    <h1 className="text-3xl text-center">Odds: {odds}</h1>
                </div>
                <div className="flex max-w-[300px] max-h-[300px]">
                    <img src={imgUrl} className="w-[300px] h-[300px]"/>
                    <img src="../../sparkle.gif" className={`-ml-[250px] w-[225px] h-[225px] z-10 self-center ${opacity}`} />
                </div>
            </div>
            { determineButtons() }
            <OptionsDialog name={name} open={open}  onClose={handleOptionsDialogClose} delaySeconds={delaySeconds} odds={odds} setDelaySeconds={setDelaySeconds} />
        </div>
    )
}