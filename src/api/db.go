package main

import (
	"database/sql"
	"log"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

const DBFILE string = "../../data/hunts.db"

type Hunt struct {
	name       string
	mon        string
	encounters int
	status     bool
	start      *time.Time
	end        *time.Time
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
		start DATETIME,
		end DATETIME
	);`

	if _, err := db.Exec(create); err != nil {
		log.Fatal(err)
	}

	return db
}

func InsertHunt(db *sql.DB, name string, mon string, encounters int, status bool, start time.Time) (int, error) {
	res, err := db.Exec("INSERT INTO hunt VALUES (?, ?, ?, ?, ?, NULL)", name, mon, encounters, status, start)
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
	err := row.Scan(&hunt.name, &hunt.mon, &hunt.encounters, &hunt.status, &hunt.start, &hunt.end)
	if err == sql.ErrNoRows {
		return Hunt{}, sql.ErrNoRows
	}
	return hunt, err
}

func UpdateHunt(db *sql.DB, hunt Hunt) error {
	const update string = `
	UPDATE hunt
	SET mon = ?, encounters = ?, status = ?, start = ?, end = ?
	WHERE name=?;`

	_, err := db.Exec(update, hunt.mon, hunt.encounters, hunt.status, hunt.start, hunt.end, hunt.name)

	return err
}

func DeleteHunt(db *sql.DB, name string) error {
	const delete string = `
	DELETE FROM hunt
	WHERE name = ?;`

	_, err := db.Exec(delete, name)

	return err
}
