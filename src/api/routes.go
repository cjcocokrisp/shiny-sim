package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"slices"
	"strconv"
	"strings"
	"time"

	"github.com/gorilla/mux"
)

var db *sql.DB

const port string = "8080"

var validQueries = []string{"name", "mon", "encounters", "status", "start", "end"}

type ErrorResponse struct {
	Message string `json:"error"`
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

	_, err := InsertHunt(db, vars["name"], mon, 0, false, time.Now())
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
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(hunt)
		fmt.Printf("Returned item %s\n", vars["name"])
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
			case "encounters":
				updates.Encounters, _ = strconv.Atoi(q[1])
			case "status":
				updates.Status, _ = strconv.ParseBool(q[1])
			case "start":
				updates.Start = q[1]
			case "end":
				updates.End = q[1]
			}
		}
	}

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

}

func main() {
	// Open DB
	db = GetTable()

	// Define Routes
	router := mux.NewRouter()
	router.HandleFunc("/roll", roll).Methods("GET")
	router.HandleFunc("/hunt/{name}", dbCreate).Methods("POST")
	router.HandleFunc("/hunt/{name}", dbRead).Methods("GET")
	router.HandleFunc("/hunt/{name}", dbUpdate).Methods("PATCH")
	router.HandleFunc("/hunt/{name}", dbDelete).Methods("DELETE")

	// Start Server
	fmt.Printf("Server started on port %s\n", port)
	http.Handle("/", router)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
