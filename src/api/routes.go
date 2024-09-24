package main

import (
	"bufio"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"math/rand"
	"net/http"
	"os"
	"slices"
	"strconv"
	"strings"
	"time"

	"github.com/gorilla/mux"
	"golang.org/x/text/cases"
	"golang.org/x/text/language"
)

var db *sql.DB

const port string = "8080"

const refreshDate int = 30

var validQueries = []string{"name", "mon", "odds", "encounters", "type", "status", "start", "end"}

var monList MonList

type ErrorResponse struct {
	Message string `json:"error"`
}

type MonList struct {
	Count    int    `json:"count"`
	Next     string `json:"next"`
	Previous string `json:"previous"`
	Results  []struct {
		Name string `json:"name"`
		Url  string `json:"url"`
	} `json:"results"`
}

func roll(w http.ResponseWriter, r *http.Request) {
	// TODO: Add a bad response if odds is missing
	odds := r.URL.Query().Get("odds")
	rawParams := strings.Split(odds, "/")
	var params []int
	for _, p := range rawParams {
		n, _ := strconv.Atoi(p)
		params = append(params, n)
	}

	if params[0] > 1 {
		params[1] = params[1] / params[0]
		params[0] = 1
	}

	roll := rand.Intn(params[1])
	result := roll == 0
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(fmt.Sprintf("%t", result)))
	fmt.Printf("Rolled with odds %d/%d, result: %t, rolled: %d\n", params[0], params[1], result, roll)
}

func dbCreate(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)

	mon := r.URL.Query().Get("mon")
	if mon == "" {
		mon = "Missingno"
	}

	huntType := r.URL.Query().Get("type")
	if huntType == "" {
		huntType = "Simulation"
	}

	odds := r.URL.Query().Get("odds")
	if odds == "" {
		odds = "0/0"
	}

	_, err := InsertHunt(db, vars["name"], mon, odds, 0, huntType, false, time.Now())
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Printf("Failed to create %s (%s)\n", vars["name"], err.Error())
	} else {
		w.WriteHeader(http.StatusCreated)
		fmt.Printf("Successfully created %s\n", vars["name"])
	}
}

func dbRead(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)

	w.Header().Set("Content-Type", "application/json")
	hunt, err := ReadHunt(db, vars["name"])
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		res := ErrorResponse{}
		res.Message = err.Error()
		json.NewEncoder(w).Encode(res)
		fmt.Printf("Attempted return %s failed (%s)\n", vars["name"], err.Error())
	} else {
		json.NewEncoder(w).Encode(hunt)
		fmt.Printf("Returned item %s\n", vars["name"])
	}
}

func dbReadAll(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	hunts, err := ReadAllHunts(db)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
	} else {
		json.NewEncoder(w).Encode(hunts)
		fmt.Printf("Returned all hunt items\n")
	}
}

func dbUpdate(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)

	updates, err := ReadHunt(db, vars["name"])
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		fmt.Printf("Failed to patch %s (%s)\n", vars["name"], err.Error())
		return
	}

	for _, s := range strings.Split(r.URL.RawQuery, "&") {
		q := strings.Split(s, "=")
		if slices.Contains(validQueries, q[0]) {
			switch q[0] {
			case "name":
				updates.Name = q[1]
			case "mon":
				updates.Mon = q[1]
			case "odds":
				updates.Odds = strings.Replace(q[1], "%2F", "/", 1)
			case "encounters":
				updates.Encounters, _ = strconv.Atoi(q[1])
			case "type":
				updates.Type = q[1]
			case "status":
				updates.Status, _ = strconv.ParseBool(q[1])
			case "start":
				updates.Start = q[1]
			case "end":
				updates.End = q[1]
			}
		}
	}

	fmt.Println(updates)
	err = UpdateHunt(db, updates, vars["name"])
	if err != nil {
		fmt.Printf("Failed to patch %s (%s)\n", vars["name"], err.Error())
		w.WriteHeader(http.StatusInternalServerError)
	} else {
		fmt.Printf("Successfully patched %s\n", vars["name"])
	}
}

func dbDelete(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)

	err := DeleteHunt(db, vars["name"])
	if err != nil {
		fmt.Printf("Failed to delete %s (%s)\n", vars["name"], err.Error())
		w.WriteHeader(http.StatusInternalServerError)
	} else {
		fmt.Printf("Successfully deleted %s\n", vars["name"])
	}
}

func fetchNames(w http.ResponseWriter, r *http.Request) {
	json.NewEncoder(w).Encode(monList)
}

func compileNames() {
	res, err := http.Get("https://pokeapi.co/api/v2/pokemon?limit=1000000&offset=0")
	if err != nil {
		log.Fatal(err)
	}
	defer res.Body.Close()
	body, err := io.ReadAll(res.Body)
	if err != nil {
		log.Fatal(err)
	}

	var parsed MonList
	if err := json.Unmarshal(body, &parsed); err != nil {
		log.Fatal(err)
	}

	file, _ := os.Create("../../data/mon_list.txt")
	defer file.Close()

	file.WriteString(fmt.Sprintf("%s\n", time.Now().Format(time.DateTime)))
	for _, mon := range parsed.Results {
		c := cases.Title(language.Und)
		file.WriteString(fmt.Sprintf("%s\n", c.String(mon.Name)))
	}
}

func main() {
	// Open DB
	db = GetTable()

	// Check if list of mons needs to be updated and then parse it
	file, err := os.Open("../../data/mon_list.txt")
	if err != nil {
		fmt.Println("Mon list does not exist, compiling list")
		compileNames()
	}
	scanner := bufio.NewScanner(file)
	scanner.Split(bufio.ScanLines)
	scanner.Scan()
	date, err := time.Parse(time.DateTime, scanner.Text())
	if err == nil {
		date = date.AddDate(0, 0, refreshDate)
		if time.Now().Day() > date.Day() || time.Now().Month() > date.Month() ||
			time.Now().Year() > date.Year() {
			compileNames()
		}
	} else {
		compileNames()
	}

	for scanner.Scan() {
		monList.Results = append(monList.Results, struct {
			Name string "json:\"name\""
			Url  string "json:\"url\""
		}{
			Name: scanner.Text(),
			Url:  "",
		})
		monList.Count++
	}
	file.Close()

	// Define Routes
	router := mux.NewRouter()
	router.HandleFunc("/roll", roll).Methods("GET")
	router.HandleFunc("/hunt", dbReadAll).Methods("GET")
	router.HandleFunc("/hunt/{name}", dbCreate).Methods("POST")
	router.HandleFunc("/hunt/{name}", dbRead).Methods("GET")
	router.HandleFunc("/hunt/{name}", dbUpdate).Methods("PATCH")
	router.HandleFunc("/hunt/{name}", dbDelete).Methods("DELETE")
	router.HandleFunc("/mon-list", fetchNames).Methods("GET")

	// Start Server
	fmt.Printf("Server started on port %s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, router))
}
