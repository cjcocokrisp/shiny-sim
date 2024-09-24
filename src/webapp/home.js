import React from 'react'
import { useState, useEffect } from 'react'
import Logo from '../../public/logo.svg'
import { List, ListItem, ListItemButton, ListItemAvatar, ListItemText } from '@mui/material'
import Avatar from '@mui/material/Avatar'
import Paper from '@mui/material/Paper'
import Fab  from '@mui/material/Fab'
import AddIcon from '@mui/icons-material/Add'
import { FormGroup, FormControlLabel } from '@mui/material'
import Switch from '@mui/material/Switch'
import { Dialog, DialogTitle } from '@mui/material'
import TextField from '@mui/material/TextField'
import { ToggleButtonGroup, ToggleButton } from '@mui/material'
import Autocomplete from '@mui/material/Autocomplete'
import Button from '@mui/material/Button'
import { useNavigate } from 'react-router-dom'

function CreateDialog(props) {
    const { onClose, open } = props;
    const [monList, setMonList] = useState([]);
    const [name, setName] = useState("");
    const [type, setType] = useState("Simulation");
    const [mon, setMon] = useState("Missingno");
    const [oddsRolls, setOddsRolls] = useState("");
    const [oddsChance, setOddsChance] = useState("");

    useEffect(() => {
        fetch("/api/mon-list").then(res => {
            res.json().then(data => {
                let fetchedMonList = []
                data["results"].map((mon) => {
                    fetchedMonList.push(mon["name"]);
                });
                setMonList(fetchedMonList);
            });
        });
    }, [monList]);

    const handleNumValidation = (stateSet) => {
        return (event) => {
            const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
            let numStr = "";
            for (let i = 0; i < event.target.value.length; i++) {
                let c = event.target.value[i];
                if (digits.includes(c)) numStr += c; 
            }
            if (numStr === "") stateSet("");
            else stateSet(numStr);
        }
    } 

    const handleClose = () => {
        setName("");
        setType("Simulation");
        setOddsRolls(null);
        setOddsChance(null);
        onClose();
    };

    const onSubmit = () => {
        let params = new URLSearchParams
        params.set("mon", mon);
        params.set("type", type);
        params.set("odds", oddsRolls + '/' + oddsChance);
        
        fetch(`/api/hunt/${name}?` + params.toString(), { method: "POST" }).then((res) => {
            console.log(res.status);
        });
        handleClose();
    }

    return (
        <Dialog onClose={handleClose} className="flex justify-center" open={open} PaperProps={{sx: {bgcolor: "secondary.main"}}}>
            <DialogTitle className='self-center'>Create A New Hunt</DialogTitle>
            <TextField style={{marginBottom: "2vh"}} label="Hunt Name" variant="outlined" onChange={(event) => setName(event.target.value)}/>
            <ToggleButtonGroup className='flex justify-center' style={{marginBottom: "2vh"}} value={type} color='primary' exclusive
                                onChange={(event) => setType(event.target.value)}>
                <ToggleButton value="Simulation">Simulation</ToggleButton>
                <ToggleButton value="Tracked">Tracker</ToggleButton>
            </ToggleButtonGroup>
            <Autocomplete style={{marginBottom: "2vh"}} options={monList} renderInput={(params) => <TextField {...params} label="Mon" />} 
                          onChange={(event, value) => setMon(value)} />
            <h1 className="self-center">Odds:</h1>
            <div className='flex justify-center gap-[0.5vw] mb-[2vh]'>
                    <TextField style={{maxWidth: "7vw"}} value={oddsRolls} label="Rolls" variant="outlined" onChange={handleNumValidation(setOddsRolls)}/>
                    <p className='self-center text-xl'>/</p>
                    <TextField style={{maxWidth: "7vw"}} value={oddsChance} label="Chance" variant="outlined" onChange={handleNumValidation(setOddsChance)}/>
            </div>
            <div className='flex justify-center'>
                <Button variant="contained" style={{maxWidth: "6vw", marginBottom: "3vh"}} onClick={onSubmit}>Create</Button>
            </div>
        </Dialog>
    )
}

export default function Home(props) { 
    const [huntList, setHuntList] = useState([]);
    const [open, setOpen] = useState(false);
    const [statsSelected, setStatsSelected] = useState(false);
    const [deleteSelected, setDeleteSelected] = useState(false);
    const navigate = useNavigate();

    const handleDialogOpen = () => {
        setOpen(true);
    };

    const handleDialogClose = () => {
        fetchHuntList();
        setOpen(false);
    };

    function fetchHuntList() {
        fetch("/api/hunt").then(res => {
            res.json().then(data => {
                data.reverse();
                setHuntList(data);
            });
        });
    }
    
    const handleClick = (name, type) => {
        type = type === "Simulation" ? 'simulate' : 'track';
        return () => {
            if (deleteSelected) {
                fetch(`/api/hunt/${name}`, { method: "DELETE" }).then((res) => {
                    console.log(res.status);
                    fetchHuntList();
                });
            } else if (statsSelected) {
                navigate(`/stats/${name}`);
            } else {
                navigate(`/${type}/${name}`);
            }
        }
    }

    useEffect(() => {
        fetchHuntList();
    }, [setHuntList]) ;

    let listItems;
    if (huntList.length == 0) {
        listItems = (<h1>No Hunts Have Been Created</h1>);
    } else {
        listItems = huntList.map((hunt) => {
            let icon = hunt["status"] ? "./closed_pokeball.png" : "./open_pokeball.png";
            return (
                <ListItem>
                    <ListItemButton onClick={handleClick(hunt["name"], hunt["type"])}> 
                        <ListItemAvatar>
                            <Avatar src={icon} />
                        </ListItemAvatar>
                        <ListItemText primary={hunt["name"]} secondary={`${hunt["mon"]} | ${hunt["type"]} | ${hunt["encounters"]}`} />
                    </ListItemButton>
                </ListItem>
            )
        })
    }

    return (
        <div className='flex justify-between h-[92vh] mx-64'>
            <FormGroup className='self-end -m-6 w-[12vw]'>
                <FormControlLabel control={<Switch className='self-end' color='secondary' />} label='Stats Mode' 
                    labelPlacement='right' onChange={(event) => setStatsSelected(event.target.checked)}/>
                <FormControlLabel control={<Switch className='self-end' color='secondary' />} label='Delete Selection' 
                    labelPlacement='right' onChange={(event) => setDeleteSelected(event.target.checked)}/>
            </FormGroup>
            <div className='flex flex-col items-center w-full' >
                <img src={Logo} style={{width: '30%'}}/>
                <Paper style={{maxHeight: '70vh', overflow: 'auto'}}>
                    <List className="w-96" sx={{bgcolor: 'primary.main'}}>
                        {listItems}
                    </List>
                </Paper>
            </div>
            <Fab color="secondary" aria-label="add" className='self-end' onClick={handleDialogOpen}>
                <AddIcon />
            </Fab>
            <CreateDialog open={open} onClose={() => {handleDialogClose(); fetchHuntList();}} />
        </div>
    )
}