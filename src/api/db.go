package main

import (
	"database/sql"
	"log"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

const DBFILE string = "../../data/hunts.db"

type Hunt struct {
	Name       string `json:"name"`
	Mon        string `json:"mon"`
	Encounters int    `json:"encounters"`
	Status     bool   `json:"status"`
	Start      string `json:"start"`
	End        string `json:"end"`
}

func GetTable() *sql.DB {
	db, err := sql.Open("sqlite3", DBFILE)
	if err != nil {
		log.Fatal(err)
	}

	const create string = `
	CREATE TABLE IF NOT EXISTS hunt (
		name TEXT NOT NULL PRIMARY KEY,
		mon TEXT NOT NULL,
		encounters INTEGER,
		status BOOL,
		start STRING,
		end STRING
	);`

	if _, err := db.Exec(create); err != nil {
		log.Fatal(err)
	}

	return db
}

func InsertHunt(db *sql.DB, name string, mon string, encounters int, status bool, start time.Time) (int, error) {
	res, err := db.Exec("INSERT INTO hunt VALUES (?, ?, ?, ?, ?, 'none')", name, mon, encounters, status, time.Now().Format(time.DateTime))
	if err != nil {
		return 0, err
	}

	id, err := res.LastInsertId()
	if err != nil {
		return 0, err
	}

	return int(id), nil
}

func ReadHunt(db *sql.DB, name string) (Hunt, error) {
	row := db.QueryRow(`
	SELECT * 
	FROM hunt
	WHERE name=?`, name)

	hunt := Hunt{}
	err := row.Scan(&hunt.Name, &hunt.Mon, &hunt.Encounters, &hunt.Status, &hunt.Start, &hunt.End)
	if err == sql.ErrNoRows {
		return Hunt{}, sql.ErrNoRows
	}
	return hunt, err
}

func ReadAllHunts(db *sql.DB) ([]Hunt, error) {
	rows, err := db.Query(`
	SELECT * 
	FROM hunt`)
	if err != nil {
		return nil, err
	}

	var hunts []Hunt
	for rows.Next() {
		var hunt Hunt
		rows.Scan(&hunt.Name, &hunt.Mon, &hunt.Encounters, &hunt.Status, &hunt.Start, &hunt.End)
		hunts = append(hunts, hunt)
	}
	return hunts, nil
}

func UpdateHunt(db *sql.DB, hunt Hunt, name string) error {
	const update string = `
	UPDATE hunt
	SET name = ?, mon = ?, encounters = ?, status = ?, start = ?, end = ?
	WHERE name=?;`

	_, err := db.Exec(update, hunt.Name, hunt.Mon, hunt.Encounters, hunt.Status, hunt.Start, hunt.End, name)

	return err
}

func DeleteHunt(db *sql.DB, name string) error {
	const delete string = `
	DELETE FROM hunt
	WHERE name = ?;`

	_, err := db.Exec(delete, name)

	return err
}
