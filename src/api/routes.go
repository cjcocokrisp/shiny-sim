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
	w.Write([]byte(fmt.Sprintf("%t, %d", result, roll)))
}

func dbCreate() {

}

func dbRead() {

}

func dbUpdate() {

}

func dbDelete() {

}

func fetchNames() {

}

func main() {
	// Define Routes
	http.HandleFunc("POST /roll", roll)

	// Start Server
	log.Fatal(http.ListenAndServe(":8080", nil))
}
