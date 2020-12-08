let signInBtn = document.getElementById('login-btn')
let today = new Date()

let stickers = document.getElementsByClassName('sticker')
let startDragX = 0
let startDragY = 0

let userLogin = document.getElementById('user-login')

function parseCookies() {
    var list = {},
        rc = document.cookie;

    rc && rc.split(';').forEach(function (cookie) {
        var parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
    });

    return list;
}

function logIn(ev) {
    ev.preventDefault()
    let login = document.getElementById('login').value
    let password = document.getElementById('password').value

    fetch(`/checkLogin?login=${login}&password=${password}`, {method: 'GET', credentials: 'include'})
    .then(response => response.json())
    .then(json => {
        if (json.redirect) {
            document.cookie = `userLogin=${login};`
            location.href = json.redirect
        }
        else {
            let infoBlock = document.getElementById('info-block')
            infoBlock.innerText = json.msg
            infoBlock.classList.toggle('inf-blk-warn')
            infoBlock.classList.toggle('nothing')
            // console.log(infoBlock.className)
        }
    })
}

function signUp(ev) {
    ev.preventDefault()
    let login = document.getElementById('login').value
    let password = document.getElementById('password').value

    fetch(`/reg?login=${login}&password=${password}`, {method: 'GET', credentials: 'include'})
        .then(response => response.json())
        .then(json => {
            if (json.success) {
                document.cookie = `userLogin=${login};`
                location.href = '/'
            }
            else {
                let infoBlock = document.getElementById('info-block')
                infoBlock.innerText = json.msg
                infoBlock.classList.toggle('inf-blk-warn')
                infoBlock.classList.toggle('nothing')
            }
        })
}

function updateStickers() {
    fetch(`/getUserByLogin?login=${userLogin.innerText}`, {method: 'GET', credentials: 'include'})
        .then(response => response.json())
        .then(json => {
            showStickers(json.res_rows)
        })
}

function showStickers(stickers) {
    let main = document.getElementsByTagName("main")[0]
    main.innerHTML = `
        <button class=\"add-sticker\" onclick=\"createNewSticker()\"><img src=\"./assets/plus.png\" alt=\"plus\"></button>
    `
    stickers.forEach(stickerObj => {

        let sticker = document.createElement("div")
        let top = document.createElement("div")
        let markListTag = document.createElement("div")
        let dateTime = document.createElement("div")
        let content = document.createElement("div")

        sticker.draggable = true
        sticker.id = `stk${document.getElementsByClassName("sticker").length + 1}`
        sticker.className = "sticker"

        sticker.addEventListener('dragstart', function (ev) {
            startDragX = ev.offsetX
            startDragY = ev.offsetY
        })

        sticker.addEventListener('dragend', function (ev) {
            sticker.style.top = (ev.pageY - startDragY) + 'px'
            sticker.style.left = (ev.pageX - startDragX) + 'px'
        })

        top.className = "top d-flex justify-content-between align-items-center"

        markListTag.className = "mark-list d-flex justify-content-between align-items-center"
        let markList = stickerObj.marks.split(', ')
        markList.forEach(markText => {
            let markTag = document.createElement('div')
            markTag.className = "mark"
            markTag.innerText = markText

            markListTag.append(markTag)
        })

        dateTime.className = "date-time"
        let stickerDate = new Date(stickerObj.date)
        dateTime.innerText = stickerDate.getUTCDate() + "." + (stickerDate.getUTCMonth() + 1) + "." + stickerDate.getUTCFullYear()

        content.className = "content"
        content.innerText = stickerObj.content

        top.append(markListTag)
        top.append(dateTime)

        sticker.append(top)
        sticker.append(document.createElement("hr"))
        sticker.append(content)


        main.append(sticker)
    })
}

function createNewSticker() {
    let main = document.getElementsByTagName("main")[0]
    let sticker = document.createElement("div")
    let top = document.createElement("div")
    let markList = document.createElement("div")
    let dateTime = document.createElement("div")
    let content = document.createElement("div")

    sticker.draggable = true
    sticker.id = `stk${document.getElementsByClassName("sticker").length + 1}`
    sticker.className = "sticker"

    sticker.addEventListener('dragstart', function (ev) {
        startDragX = ev.offsetX
        startDragY = ev.offsetY
    })

    sticker.addEventListener('dragend', function (ev) {
        sticker.style.top = (ev.pageY - startDragY) + 'px'
        sticker.style.left = (ev.pageX - startDragX) + 'px'
    })

    top.className = "top d-flex justify-content-between align-items-center"

    markList.className = "mark-list d-flex justify-content-between align-items-center"
    dateTime.className = "date-time"
    dateTime.innerText = today.getDate() + "." + today.getMonth() + "." + today.getFullYear()

    content.className = "content"
    content.innerText = "Your message to yourself..."

    top.append(markList)
    top.append(dateTime)

    sticker.append(top)
    sticker.append(document.createElement("hr"))
    sticker.append(content)


    main.append(sticker)
}

if (stickers) {
    for (let sticker of stickers) {
        sticker.addEventListener('dragstart', function (ev) {
            startDragX = ev.offsetX
            startDragY = ev.offsetY
        })

        sticker.addEventListener('dragend', function (ev) {
            sticker.style.top = (ev.pageY - startDragY) + 'px'
            sticker.style.left = (ev.pageX - startDragX) + 'px'
        })
    }

    // sticker.addEventListener('mouseover', function(ev) {
    //     sticker
    // })
}
window.addEventListener('load', () => {
    if (signInBtn) {
        document.getElementById('login-btn').addEventListener('click', logIn)
        document.getElementById('signup-btn').addEventListener('click', signUp)
        document.cookie = ""
    }
    if (userLogin) {
        userLogin.innerText = parseCookies().userLogin
        updateStickers()
    }
})
