const express = require('express')
const sqlite3 = require('sqlite3').verbose()
const url = require('url')
const queryString = require('querystring')
const fs = require('fs')

async function db_init(name) {
    const exists = await new Promise(res => {
        fs.exists(name, exists => res(exists))
    })
    const db = new sqlite3.Database(name)
    if (!exists) {
        console.log("Database file doesn't exist")
        db.run('CREATE TABLE "Mark" (\n' +
            '  "id" INTEGER PRIMARY KEY AUTOINCREMENT,\n' +
            '  "name" TEXT NOT NULL,\n' +
            '  "color" TEXT NOT NULL,\n' +
            '  "user" INTEGER\n' +
            ');')
        db.run(
            'CREATE TABLE "Sticker" (\n' +
            '  "id" INTEGER PRIMARY KEY AUTOINCREMENT,\n' +
            '  "content" TEXT NOT NULL,\n' +
            '  "date" DATETIME NOT NULL,\n' +
            '  "user" INTEGER,\n' +
            '  "marks" TEXT NOT NULL,\n' +
            '  "position" TEXT DEFAULT \'37%,40%\' NOT NULL,\n' +
            '  "title" TEXT DEFAULT \'DEFAULT_TEXT\' NOT NULL\n' +
            ');')
        db.run(
            'CREATE TABLE "User" (\n' +
            '  "id" INTEGER PRIMARY KEY AUTOINCREMENT,\n' +
            '  "login" TEXT UNIQUE NOT NULL,\n' +
            '  "password" TEXT NOT NULL\n' +
            ')')
    } else {
        console.log("Database file exists")
    }
    return db
}

var db;
const app = express()
const port = process.env.PORT || 3000

function contain(list, item) {
    let res = 0
    for (let i = 0; i < list.length; i++) {
        if (item === list[i]) {
            res = 1
            break
        }
    }
    return res
}

function withOut(list, item) {
    let res = []
    for (let i = 0; i < list.length; i++) {
        if (list[i] !== item) { res.push(list[i]) }
    }
    return res
}

app.use(express.static('static'))

app.get('/login', (req, res) => {
    res.sendFile(
        './static/login.html',
        { root: __dirname },
    )
})

app.get('/checkLogin', (req, res) => {
    let parsedUrl = url.parse(req.url)
    let parsedQS = queryString.parse(parsedUrl.query)

    let login = parsedQS.login
    let password = parsedQS.password

    db.get('SELECT id From User Where login = (?) AND password = (?)', [login, password], (er, row) => {
        let resObj = {
            redirect: "",
            msg: "",
            token: "",
            id: 0,
        }

        if (er || row === undefined) {
            if (er) {
                resObj.msg = er.message
            } else {
                resObj.msg = "Success false!!!"
            }
            res.send(JSON.stringify(resObj))
        } else { // Успешно
            crypto.randomBytes(24, (err, buffer) => {
                // let token = buffer.toString('hex');
                resObj.redirect = "/"
                resObj.id = row.id
                res.send(JSON.stringify(resObj))
                //
                // db.run('insert into Token (token, user) VALUES (?, ?)', [token, resObj.id], (err, row) => {
                //
                //     resObj.token = token // TODO: записать в cookies
                //
                // })

            })
        }

    })

})

app.get('/reg', (req, res) => {
    let parsedUrl = url.parse(req.url)
    let parsedQS = queryString.parse(parsedUrl.query)

    let login = parsedQS.login
    let password = parsedQS.password

    db.run('INSERT INTO User (login, password) VALUES (?, ?)', [login, password], (er) => {

        if (er) {
            res.send(JSON.stringify({
                success: false,
                msg: "Something wrong"
            }))
        }

        res.send(JSON.stringify({
            success: true,
            msg: "All right"
        }))

    });
})

app.get('/getUserIDByLogin', (req, res) => {
    let parsedUrl = url.parse(req.url)
    let parsedQS = queryString.parse(parsedUrl.query)

    let login = parsedQS.login
    let resObj = {
        er: "",
        userID: 0
    }
    db.get('SELECT id From User Where login = (?)', [login], (er, row) => {

        if (er) {
            console.log(er)
            resObj.er = er.msg
        } else {
            resObj.userID = row.id
        }

        res.send(JSON.stringify(resObj))

    })
})

app.get('/getStickersByUser', (req, res) => {
    let parsedUrl = url.parse(req.url)
    let parsedQS = queryString.parse(parsedUrl.query)

    let userID = parsedQS.userID

    let sql = 'SELECT id, content, date, marks, position, title From Sticker Where user = (?)'
    let resObj = {
        er: "",
        stickers: []
    }

    db.all(sql, [userID], (er, rows) => {

        if (er) {
            console.log(er)
            resObj.er = er.msg
        } else {
            resObj.stickers = rows
        }

        res.send(JSON.stringify(resObj))
    })
})

app.get('/getStickersByContent', (req, res) => {
    let parsedUrl = url.parse(req.url)
    let parsedQS = queryString.parse(parsedUrl.query)

    let content = parsedQS.content

    let sql = 'SELECT id FROM Sticker WHERE instr(content, (?))'
    let resObj = {
        er: "",
        ids: []
    }

    db.all(sql, [content], (er, rows) => {

        if (er) {
            console.log(er)
            resObj.er = er.msg
        } else {
            resObj.ids = rows
        }

        res.send(JSON.stringify(resObj))
    })

})

app.get('/getStickersByTitle', (req, res) => {
    let parsedUrl = url.parse(req.url)
    let parsedQS = queryString.parse(parsedUrl.query)

    let title = parsedQS.title

    let sql = 'SELECT id FROM Sticker WHERE instr(title, (?))'
    let resObj = {
        er: "",
        ids: []
    }

    db.all(sql, [title], (er, rows) => {

        if (er) {
            console.log(er)
            resObj.er = er.msg
        } else {
            resObj.ids = rows
        }

        res.send(JSON.stringify(resObj))
    })

})

app.get('/getStickersByMark', (req, res) => {
    let parsedUrl = url.parse(req.url)
    let parsedQS = queryString.parse(parsedUrl.query)

    let mark = parsedQS.mark

    let sql = 'SELECT id FROM Sticker WHERE instr(marks, (?))'
    let resObj = {
        er: "",
        ids: []
    }

    db.all(sql, [mark], (er, rows) => {

        if (er) {
            console.log(er)
            resObj.er = er.msg
        } else {
            resObj.ids = rows
        }

        res.send(JSON.stringify(resObj))
    })

})

app.get('/getStickerMarks', (req, res) => {
    let parsedUrl = url.parse(req.url)
    let parsedQS = queryString.parse(parsedUrl.query)

    let stickerID = parsedQS.stickerID

    let sql = 'SELECT marks FROM Sticker WHERE id = (?)'
    let resObj = {
        er: "",
        marks: []
    }

    db.get(sql, [stickerID], (er, row) => {

        if (er) {
            console.log(er)
            resObj.er = er.msg
        } else {
            resObj.marks = row.marks.split(',')
        }

        res.send(JSON.stringify(resObj))

    })
})

app.get('/createNewSticker', (req, res) => {
    let parsedUrl = url.parse(req.url)
    let parsedQS = queryString.parse(parsedUrl.query)

    let id = parsedQS.id

    let sql = 'INSERT INTO Sticker ("user", "content", "date", "marks") VALUES (?, ?, ?, ?)'
    db.run(sql, [id, "", new Date() + (3 * 60 * 60 * 1000), ""], (er) => {
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
            res.send(JSON.stringify({
                success: true
            }))
        }
    })
})

app.get('/updateMarks', (req, res) => {
    let parsedUrl = url.parse(req.url)
    let parsedQS = queryString.parse(parsedUrl.query)

    let userID = parsedQS.userID
    let sql = 'SELECT id, name, color FROM Mark WHERE user = (?)'

    let resObj = {
        erMsg: "",
        rows: []
    }

    db.all(sql, [userID], (er, rows) => {
        if (er) {
            resObj.erMsg = er.msg
        } else {
            resObj.rows = rows
        }
        res.send(JSON.stringify(resObj))
    })
})

app.get('/validMarkForSticker', (req, res) => {
    let parsedUrl = url.parse(req.url)
    let parsedQS = queryString.parse(parsedUrl.query)

    let stickerID = parsedQS.stickerID
    let markName = parsedQS.markName

    let sql = 'SELECT marks FROM Sticker WHERE id = (?)'
    let resObj = {
        er: "",
        valid: false
    }

    db.get(sql, [stickerID], (er, row) => {
        if (er) {
            resObj.er = er.msg
        } else {
            let markList = row.marks.split(',')
            for (let name of markList) {
                if (name === markName) {
                    resObj.valid = true
                    break
                }
            }
        }

        res.send(JSON.stringify(resObj))
    })
})

app.get('/addNewMark', (req, res) => {
    let parsedUrl = url.parse(req.url)
    let parsedQS = queryString.parse(parsedUrl.query)

    let userID = parsedQS.userID
    let name = parsedQS.name
    let color = "#" + parsedQS.color

    let sql = 'INSERT INTO Mark ("name", "color", "user") VALUES (?, ?, ?)'
    let resObj = {
        er: "",
        success: false
    }
    db.run(sql, [name, color, userID], (er) => {
        if (er) {
            console.log(er)
            resObj.er = er.msg
        } else {
            resObj.success = true
        }

        res.send(JSON.stringify(resObj))
    })
})

app.get('/markDel', (req, res) => {
    let parsedUrl = url.parse(req.url)
    let parsedQS = queryString.parse(parsedUrl.query)

    let markID = parsedQS.markID

    let sql = 'DELETE FROM Mark WHERE id = (?)'
    let resObj = {
        er: '',
        success: false
    }

    db.run(sql, [markID], (er) => {

        if (er) {
            resObj.er = er.msg
            console.log(er)
        } else {
            resObj.success = true
        }

        res.send(JSON.stringify(resObj))

    })
})

app.get('/toggleMarkBySticker', (req, res) => {
    let parsedUrl = url.parse(req.url)
    let parsedQS = queryString.parse(parsedUrl.query)

    let name = parsedQS.name
    let stickerID = parsedQS.stickerID

    let sql = 'SELECT marks FROM Sticker WHERE id = (?)'

    let resObj = {
        er: "",
        success: false
    }

    db.get(sql, [stickerID], (er, row) => {

        if (er) {
            console.log(er)
            resObj.er = er.msg
            res.send(JSON.stringify(resObj))
        } else {
            sql = 'UPDATE Sticker SET marks = (?) WHERE id = (?)'
            let marks = row.marks.split(',')

            if (contain(marks, name)) {
                marks = withOut(marks, name)
            } else {
                marks.push(name)
            }

            db.run(sql, [marks, stickerID], (er) => {
                if (er) {
                    console.log(er)
                    resObj.er = er.msg
                } else {
                    resObj.success = true
                }
                res.send(JSON.stringify(resObj))
            })

        }


    })

})

app.get('/getMarkColor', (req, res) => {
    let parsedUrl = url.parse(req.url)
    let parsedQS = queryString.parse(parsedUrl.query)

    let markID = parsedQS.markID

    let sql = 'SELECT color FROM Mark WHERE id = (?)'
    let resObj = {
        er: "",
        color: ""
    }

    db.get(sql, [markID], (er, row) => {

        if (er) {
            console.log(er)
            resObj.er = er.msg
        } else {
            resObj.color = row.color
        }

        res.send(JSON.stringify(resObj))

    })
})

app.get('/getMarkIDByName', (req, res) => {
    let parsedUrl = url.parse(req.url)
    let parsedQS = queryString.parse(parsedUrl.query)

    let userID = parsedQS.userID
    let name = parsedQS.name

    let sql = 'SELECT id FROM Mark WHERE user = (?) AND name = (?)'
    let resObj = {
        er: "",
        markID: 0
    }

    db.get(sql, [userID, name], (er, row) => {

        if (er) {
            console.log(er)
            resObj.er = er.msg
        } else {
            resObj.markID = row.id
        }

        res.send(JSON.stringify(resObj))

    })
})

app.get('/saveChanges', (req, res) => {
    let parsedUrl = url.parse(req.url)
    let parsedQS = queryString.parse(parsedUrl.query)

    let stickerID = parsedQS.stickerID
    let newTitle = parsedQS.title
    let newContent = parsedQS.content

    let sql = 'UPDATE Sticker SET title = (?), content = (?) WHERE id = (?)'
    let resObj = {
        er: "",
        success: false
    }

    db.run(sql, [newTitle, newContent, stickerID], (er) => {

        if (er) {
            console.log(er)
            resObj.er = er.msg
        } else {
            resObj.success = true
        }

        res.send(JSON.stringify(resObj))

    })
})

db_init('./db.sqlite')
    .then(async (_db) => {
        db = new sqlite3.Database('./db.sqlite')
        app.listen(port, () => {
            console.log(`Example app listening at http://localhost:${port}`)
        })
    })
