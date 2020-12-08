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

function createTools(stickerID) {
    let tools = document.createElement('div')
    tools.className = "tools float-right d-flex justify-content-between align-items-center"
    let penButton = document.createElement('button')
    let imgSize = 11
    let pen = document.createElement('img')
    pen.src = "./assets/pen.png"
    pen.alt = "pen"
    pen.width = imgSize
    penButton.append(pen)
    tools.append(penButton)
    let closeButton = document.createElement('button')
    closeButton.onclick = () => delSticker(stickerID)
    let close = document.createElement('img')
    close.src = "./assets/close.png"
    close.alt = "close"
    close.width = imgSize
    closeButton.append(close)
    tools.append(closeButton)

    return tools
}

function createMarkListTag(stickerObj) {
    let markListTag = document.createElement("div")
    markListTag.className = "mark-list d-flex justify-content-between align-items-center"
    let markList = stickerObj.marks.split(', ')
    markList.forEach(markText => {
        let markTag = document.createElement('div')
        markTag.className = "mark"
        markTag.innerText = markText

        markListTag.append(markTag)
    })

    return markListTag
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

function updateStickers(flag) {
    fetch(`/getUserByLogin?login=${userLogin.innerText}`, {method: 'GET', credentials: 'include'})
        .then(response => response.json())
        .then(json => {
            showStickers(json.res_rows)
        })
}

function updateStickerPosition(sticker) {
    fetch(`/updateStickerPos?id=${sticker.id}&pos=${sticker.style.top + ',' + sticker.style.left}`,
        {method: 'GET', credentials: 'include'})
}

function showStickers(stickers) {
    let main = document.getElementsByTagName("main")[0]
    main.innerHTML = `
        <button class=\"add-sticker\" onclick=\"createNewSticker()\"><img src=\"./assets/plus.png\" alt=\"plus\"></button>
    `
    stickers.forEach(stickerObj => {

        let sticker = document.createElement("div")
        let position = stickerObj.position.split(",")

        sticker.style.top = position[0]
        sticker.style.left = position[1]
        sticker.draggable = true
        sticker.id = `${stickerObj.id}`
        sticker.className = "sticker"
        sticker.addEventListener('dragstart', function (ev) {
            startDragX = ev.offsetX
            startDragY = ev.offsetY
        })
        sticker.addEventListener('dragend', function (ev) {
            sticker.style.top = (ev.pageY - startDragY) + 'px'
            sticker.style.left = (ev.pageX - startDragX) + 'px'
            updateStickerPosition(sticker)
        })

        let tools = createTools(sticker.id)

        let space = document.createElement('div')
        space.className = "space"

        let top = document.createElement("div")
        top.className = "top d-flex justify-content-between align-items-center"

        let markListTag = createMarkListTag(stickerObj)

        let dateTime = document.createElement("div")
        dateTime.className = "date-time"
        let stickerDate = new Date(stickerObj.date)
        dateTime.innerText = stickerDate.getUTCDate() + "." + (stickerDate.getUTCMonth() + 1) + "." + stickerDate.getUTCFullYear()

        let content = document.createElement("div")
        content.className = "content"
        content.innerText = stickerObj.content

        top.append(markListTag)
        top.append(dateTime)

        sticker.append(tools)
        sticker.append(space)
        sticker.append(top)
        sticker.append(document.createElement("hr"))
        sticker.append(content)


        main.append(sticker)
    })
}

function createNewSticker() {
    fetch(`/getUserByLogin?login=${userLogin.innerText}`, {method: 'GET', credentials: 'include'})
        .then(response => response.json())
        .then(json => {
            fetch(`/createNewSticker?id=${json.user_id}`, {method: 'GET', credentials: 'include'})
                .then(response => response.json())
                .then(json2 => {
                    updateStickers()
                })
        })
}

function delSticker(stickerID) {
    fetch(`/delSticker?id=${stickerID}`, {method: 'GET', credentials: 'include'})
        .then(response => response.json())
        .then(json => {
            updateStickers()
        })
}

window.addEventListener('load', () => {
    if (signInBtn) {
        document.getElementById('login-btn').addEventListener('click', logIn)
        document.getElementById('signup-btn').addEventListener('click', signUp)
        document.cookie = ""
    }
    if (userLogin) {
        userLogin.innerText = parseCookies().userLogin
        updateStickers(true)
    }
})
