<div align="center">

![Shiny Sim](/public/logo-white.png)

A full stack web application that simulates and tracks hunting for shiny Pokémon!
</div>


## Features

Shiny Sim offers simulation and tracking for shiny hunts. Pokémon data is pulled from [PokéAPI](https://pokeapi.co). That means that the list of Pokémon that you can simulate hunts for is up to date with whatever they have. This allows for hunts that can't be done naturally to occur as well like megas. Below is a list of features for each of the modes.

### Simulation
- Simulate shiny hunts with odds that you input.  
- Add a delay to when you can input the button next to simulate real world time between encounters.

### Tracking
- Increment and decrement the encounters of your hunt and submit it when found.

### Other
- Stats screen where you can view the encounters, status, start time, end time of a hunt.
- A secret shiny hunt of the glitch Missingno from the Gen 1 Pokémon games. 

## Technology Used

- Front End
    - ![React JS](https://img.shields.io/badge/React_JS-20232A?style=for-the-badge&logo=react&logoColor=white)
    - ![MUI](https://img.shields.io/badge/MUI-007FFF?style=for-the-badge&logo=mui&logoColor=white)
- Back End
    - ![Go](https://img.shields.io/badge/Go-29beb0?style=for-the-badge&logo=go&logoColor=white)
    - ![Go](https://img.shields.io/badge/Sqlite-9b870c?style=for-the-badge&logo=sqlite&logoColor=white)
- Other
    - ![git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)
    - ![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

## Installation 

There is two ways to install the project. The first is using it as a container and the other is installing the libraries manually. The second option is needed if you would like to work on your own features and playing around with the code.

Both methods first require you to clone the repository by using this command.

```
git clone https://github.com/cjcocokrisp/shiny-sim.git
```

### Docker

Installing through the Docker container is easy. You just need to have Docker installed on your computer and then to run it just run the following command.

```
docker-compose up
```

This will launch the application on `http://localhost:3000`. 

**IMPORTANT NOTE:** For some reason when running the app through the container the list of Pokémon will not be read by the server. This will cause an error on loading the React app. To fix this all you need to do is stop running the container and then run the command above again. 

To stop the app from running and delete the container just simply call this command.

```
docker-compose down
```

You also can build the image and then run it as well. Just make sure you add a volume to it to save the database and the Pokémon list. The issue with the containers that require you to rerun it also will occur. 

### Manual Install

To manually install the project you must run the following two commands in the root of the project.

```
go mod download
npm install
```

These two commands will install the dependencies for the project and then to run it just run `npm run dev`. 

## Planned Features

- Account system where each account holds different hunts associated with them.
- Official hunts that can be ran on the server with a collection feature to show how many of these you have completed.
- Social features, see recent hunts by others.
- Racing mode for both simulation and tracking where you race against other players to complete the hunt.
- More custom hunts.

## Bugs/Issues

If you encounter any bugs or issues please report them using one of the following.

- [Github Issues](https://github.com/cjcocokrisp/GupRankings/issues) (Preferred)
- Discord DM (karmareplicant)

When submitting a bug report, please include as much information about how to recreate the issue as possible.

## Acknowledgements

- [React Golang Full Stack](https://github.com/orstendium/react-golang-full-stack/tree/master) - Helped with setting up the projects structure for the React part of the app.
- [PokéAPI](https://pokeapi.co) - Provided Pokémon list and the images of each Pokémon.
- Creators of all other resources used in the project.

This project is not endorsed by Nintendo or the Pokémon Company and is also not indended for profit. 