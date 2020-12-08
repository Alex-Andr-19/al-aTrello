const express = require('express')
const sqlite3 = require('sqlite3').verbose()
const url = require('url')
const queryString = require('querystring')
const db = new sqlite3.Database('./db.sqlite')
const crypto = require('crypto')

const app = express()
const port = 3000

app.use(express.static('static'))

app.get('/login', (req, res) => {
    res.sendFile(
        './static/login.html',
        {root: __dirname},
    )
})

app.get('/checkLogin', (req, res) => {
    let parsedUrl = url.parse(req.url)
    let parsedQS = queryString.parse(parsedUrl.query)

    let login = parsedQS.login
    let password = parsedQS.password

    db.get('SELECT id From User Where login = (?) AND password = (?)', [login, password], (er, row) => {
        let res_obj = {
            redirect: "",
            msg: "",
            token: "",
            id: 0,
        }

        if (er || row === undefined) {
            if (er) {
                res_obj.msg = er.message
            } else {
                res_obj.msg = "Success false!!!"
            }
            res.send(JSON.stringify(res_obj))
        } else { // Успешно
            crypto.randomBytes(24, (err, buffer) => {
                let token = buffer.toString('hex');
                res_obj.redirect = "/"
                res_obj.id = row.id

                db.run('insert into Token (token, user) VALUES (?, ?)', [token, res_obj.id], (err, row) => {

                    res_obj.token = token // TODO: записать в cookies

                    res.send(JSON.stringify(res_obj))
                })

            })
        }


    })

})

app.get('/reg', (req, res) => {
    let parsedUrl = url.parse(req.url)
    let parsedQS = queryString.parse(parsedUrl.query)

    let login = parsedQS.login
    let password = parsedQS.password

    db.run('INSERT INTO User (login, password) VALUES (?, ?)', [login, password], (er, row) => {

        if (er) {
            res.send(JSON.stringify({
                success: false,
                msg: "Something wrong"
            }))
            console.log(er.message)

            return
        }

        res.send(JSON.stringify({
            success: true,
            msg: "All right"
        }))

    });
})

app.get('/getUserByLogin', (req, res) => {
    let parsedUrl = url.parse(req.url)
    let parsedQS = queryString.parse(parsedUrl.query)

    let login = parsedQS.login

    db.get('SELECT id From User Where login = (?)', [login], (er, row) => {

        if (er) {
            console.log(er)
            res.send(JSON.stringify({
                er: er.msg,
                res_row: {}
            }))
        } else {
            db.all('SELECT id, content, date, marks, position From Sticker Where user = (?)', [row.id], (er, rows) => {

                if (er) {
                    console.log(er)
                } else {
                    res.send(JSON.stringify({
                        res_rows: rows,
                        user_id: row.id
                    }))
                }

            })
        }

    })

})

app.get('/createNewSticker', (req, res) => {
    let parsedUrl = url.parse(req.url)
    let parsedQS = queryString.parse(parsedUrl.query)

    let id = parsedQS.id

    let sql = 'INSERT INTO Sticker ("user", "content", "date", "marks") VALUES (?, ?, ?, ?)'
    db.run(sql, [id, "", new Date(), ""], (er) => {
        if (er) {
            console.log(er)
            res.send(JSON.stringify({
                success: false
            }))
        } else {
            res.send(JSON.stringify({
                success: true
            }))
        }
    })
})

app.get('/updateStickerPos', (req, res) => {
    let parsedUrl = url.parse(req.url)
    let parsedQS = queryString.parse(parsedUrl.query)

    let id = parsedQS.id
    let pos = parsedQS.pos

    let sql = 'UPDATE Sticker SET position = (?) WHERE id = (?)'
    db.run(sql, [pos, id], (er) => {
        if (er) {
            console.log(er)
        } else {
            res.send(JSON.stringify({
                success: true,
                newPos: pos
            }))
        }
    })

})

app.get('/delSticker', (req, res) => {
    let parsedUrl = url.parse(req.url)
    let parsedQS = queryString.parse(parsedUrl.query)

    let id = parsedQS.id

    let sql = 'DELETE FROM Sticker WHERE id = (?)'
    db.run(sql, [id], (er) => {
        if (er) {
            console.log(er)
        } else {
            console.log("All right!!!")
            res.send(JSON.stringify({
                success: true
            }))
        }
    })
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
