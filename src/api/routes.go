package main

import (
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"strconv"
	"strings"
)

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
	w.Write([]byte(fmt.Sprintf("%t", result)))
}

func dbCreate(w http.ResponseWriter, r *http.Request) {

}

func dbRead(w http.ResponseWriter, r *http.Request) {

}

func dbUpdate(w http.ResponseWriter, r *http.Request) {

}

func dbDelete(w http.ResponseWriter, r *http.Request) {

}

func fetchNames(w http.ResponseWriter, r *http.Request) {

}

func main() {
	// Define Routes
	http.HandleFunc("GET /roll", roll)

	// Start Server
	log.Fatal(http.ListenAndServe(":8080", nil))
}
