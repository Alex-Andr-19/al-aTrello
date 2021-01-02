let signInBtn = document.getElementById('login-btn')

let search = document.getElementById('search')
let searchText = ""

let startDragX = 0
let startDragY = 0

let vw = (window.innerWidth / 100)
let vh = (window.innerHeight / 100)

let userLogin = document.getElementById('user-login')

let openedSticker = 0

function parseCookies() {
    let list = {},
        rc = document.cookie;

    rc && rc.split(';').forEach(function (cookie) {
        let parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
    });

    return list;
}

function scope(a, min, max) {
    if (a >= min && a <= max) {
        return a
    } else if (a < min){
        return min
    } else if (a > max) {
        return max
    }
}

function createTools(sticker, userID) {
    let tools = document.createElement('div')
    tools.className = "tools float-right d-flex justify-content-between align-items-center"
    let imgSize = 11
    let dflex_alcenter = "d-flex item-align-center"

    let lockButton = document.createElement('div')
    lockButton.className = "lock-button unlock " + dflex_alcenter
    lockButton.onclick = () => {
        if (lockButton.className.includes("unlock")) {
            lockButton.classList.toggle("unlock")
            lockButton.classList.toggle("lock")
            lockButton.style.border = "2px solid indianred"
            lockSticker(sticker.id)
        } else {
            lockButton.classList.toggle("unlock")
            lockButton.classList.toggle("lock")
            lockButton.style.border = "2px solid rgba(0, 0, 0, 0)"
            unlockSticker(sticker.id)
        }
    }

    let tack = document.createElement('img')
    tack.src = "./assets/tack.png"
    tack.alt = "lock"
    tack.width = imgSize
    lockButton.append(tack)
    tools.append(lockButton)

    let penButton = document.createElement('div')
    penButton.className = dflex_alcenter
    penButton.onclick = () => openEditWindow(sticker, userID)

    let pen = document.createElement('img')
    pen.src = "./assets/pen.png"
    pen.alt = "pen"
    pen.width = imgSize
    penButton.append(pen)

    let closeButton = document.createElement('div')
    closeButton.className = dflex_alcenter
    closeButton.onclick = () => delSticker(sticker.id)

    let close = document.createElement('img')
    close.src = "./assets/close.png"
    close.alt = "close"
    close.width = imgSize
    closeButton.append(close)

    tools.append(lockButton)
    tools.append(penButton)
    tools.append(closeButton)

    return tools
}

function createMarkListTag(sticker, userID) {
    let markListTag = document.createElement("div")
    markListTag.className = "mark-list d-flex justify-content-between align-items-center"
    let markList = sticker.marks.split(',')
    markList.forEach(markName => {
        if (markName) {
            let markTag = document.createElement('div')
            markTag.className = "mark"

            markTag.innerText = markName
            getMarkColor(markName, userID).then(color => markTag.style.background = color)

            markListTag.append(markTag)
        }
    })

    return markListTag
}

function getCheckImg() {
    let imgContainer = document.createElement('div')
    imgContainer.style.height = "inherit"
    imgContainer.style.marginTop = "-0.1em"
    imgContainer.style.float = "right"
    imgContainer.style.display = "flex"
    imgContainer.style.alignItems = "center"

    let checkImg = document.createElement('img')
    checkImg.src = './assets/check.png'
    checkImg.width = 14

    imgContainer.append(checkImg)

    return imgContainer
}

function validMarkForSticker(stickerID, markName, markTag) {
    fetch(`/validMarkForSticker?stickerID=${stickerID}&markName=${markName}`)
        .then(response => response.json())
        .then(json => {
            if (json.valid) {
                markTag.append(getCheckImg())
                markTag.classList += " checked"
            } else {
                markTag.classList += " unchecked"
            }
        })
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

function getUserIDByLogin(login) {
    return new Promise((res, rej) => {
        fetch(`/getUserIDByLogin?login=${login}`, {method: 'GET', credentials: 'include'})
            .then(response => response.json())
            .then(json => {
                res(json.userID)
            })
    })
}

function updateStickers() {
    getUserIDByLogin(userLogin.innerText)
        .then(userID => {
            getStickers().then(stickers => {
                showStickers(stickers.stickers, userID)
            })
        })
}

function getStickers() {
    return new Promise((res, rej) => {
        getUserIDByLogin(userLogin.innerText)
            .then(userID => {
                fetch(`/getStickersByUser?userID=${userID}`, {method: 'GET', credentials: 'include'})
                    .then(response => response.json())
                    .then(json => {
                        res(json)
                    })
            })
    })
}

function getStickersByContent(content) {
    return new Promise((res, rej) => {
        fetch(`/getStickersByContent?content=${content}`)
            .then(response => response.json())
            .then(json => {
                res(json)
            })
    })
}

function getStickersByTitle(title) {
    return new Promise((res, rej) => {
        fetch(`/getStickersByTitle?title=${title}`, {method: 'GET'})
            .then(resolve => res(resolve.json()))
    })
}

function getStickersByMark(mark) {
    return new Promise((res, rej) => {
        fetch(`/getStickersByMark?mark=${mark}`, {method: 'GET'})
            .then(resolve => res(resolve.json()))
    })
}

function updateStickerPosition(stickerID, sticker) {
    fetch(`/updateStickerPos?id=${stickerID}&pos=${sticker.style.top + ',' + sticker.style.left}`,
        {method: 'GET', credentials: 'include'})
}

function lockSticker(stickerID) {
    document.getElementById("sticker_" + stickerID).draggable = false
}

function unlockSticker(stickerID) {
    document.getElementById("sticker_" + stickerID).draggable = true
}

function showStickers(stickers, userID) {
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
        sticker.id = `sticker_${stickerObj.id}`
        sticker.className = "sticker"
        sticker.addEventListener('dragstart', (ev) => {
            startDragX = ev.offsetX
            startDragY = ev.offsetY
        })
        sticker.addEventListener('dragend', (ev) => {
            console.log('1em = ' + (window.innerWidth / 100))
            vw = (window.innerWidth / 100)
            vh = (window.innerHeight / 100)
            sticker.style.top = scope((ev.pageY - startDragY) / vh, 8, 69.5) + 'vh'
            sticker.style.left = scope((ev.pageX - startDragX) / vw, .5, 79.5) + 'vw'
            updateStickerPosition(stickerObj.id, sticker)
        })

        let title = document.createElement('span')
        title.style.fontSize = "1em"
        title.style.fontWeight = "500"
        title.style.float = "left"
        title.innerText = stickerObj.title

        let tools = createTools(stickerObj, userID)

        let space = document.createElement('div')
        space.className = "space"

        let top = document.createElement("div")
        top.className = "top d-flex justify-content-between align-items-center"

        let markListTag = createMarkListTag(stickerObj, userID)

        let dateTime = document.createElement("div")
        dateTime.className = "date-time"
        let stickerDate = new Date(new Date(stickerObj.date) + (3 * 60 * 60 * 1000))
        dateTime.innerText = stickerDate.getDate() + "." +
            (stickerDate.getMonth() + 1) + "." +
            stickerDate.getFullYear()

        let content = document.createElement("div")
        content.className = "content"
        content.innerText = stickerObj.content

        top.append(markListTag)
        top.append(dateTime)

        sticker.append(title)
        sticker.append(tools)
        sticker.append(space)
        sticker.append(top)
        sticker.append(document.createElement("hr"))
        sticker.append(content)

        main.append(sticker)
    })
}

function createNewSticker() {
    getUserIDByLogin(userLogin.innerText)
        .then(userID => {
            fetch(`/createNewSticker?id=${userID}`, {method: 'GET', credentials: 'include'})
                .then(response => {
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

function getStickerMarks(stickerID) {
    return new Promise((res, rej) => {
        fetch(`/getStickerMarks?stickerID=${stickerID}`, {method: 'GET', credentials: 'include'})
            .then(response => response.json())
            .then(json => {
                res(json.marks)
            })
    })
}

function openEditWindow(sticker, userID) {
    openedSticker = sticker.id

    let stickerTitle = document.getElementById('title')
    stickerTitle.value = sticker.title

    let allStickerMarks = document.getElementById('marks')
    allStickerMarks.innerHTML = ""
    let markHTML = createMarkListTag(sticker, userID)
    markHTML.classList.toggle('flex-row')
    markHTML.classList.toggle('justify-content-between')

    allStickerMarks.append(markHTML)

    let stickerContent = document.getElementById('content')
    console.log(stickerContent)
    stickerContent.value = sticker.content

    let editWindow = document.getElementById('edit-window')

    let allMarks = editWindow.children[0].children[2].children[7].children[1].children
    getStickerMarks(sticker.id).then(marks => {
        for (let i = 0; i < allMarks.length; i++) {
            if (marks.indexOf(allMarks[i].innerText) >= 0) {
                allMarks[i].className = "mark checked"
                allMarks[i].append(getCheckImg())
            } else {
                allMarks[i].className = "mark unchecked"
            }
        }
    })

    editWindow.classList.toggle('d-flex')
    editWindow.classList.toggle('d-none')
}

function updateEditWindow() {
    let allStickerMarks = document.getElementById('marks')
    allStickerMarks.innerHTML = ""
    getUserIDByLogin(userLogin.innerText)
        .then(userID => {
            getStickers().then(stickers => {
                let sticker
                for (let i = 0; i < stickers.stickers.length; i++) {
                    if (stickers.stickers[i].id === openedSticker) {
                        sticker = stickers.stickers[i]
                        break
                    }
                }
                let markHTML = createMarkListTag(sticker, userID)
                markHTML.classList.toggle('justify-content-between')

                allStickerMarks.append(markHTML)
            })
        })
}

function closeEditWindow() {
    let editWindow = document.getElementById('edit-window')
    editWindow.classList.toggle('d-flex')
    editWindow.classList.toggle('d-none')

    let allMarks = document.getElementById('all-marks')
    for (let i = 0; i < allMarks.children.length; i++) {
        allMarks.children[i].innerHTML = allMarks.children[i].innerText
    }

    openedSticker = 0
}

function updateMarks() {
    getUserIDByLogin(userLogin.innerText)
        .then(userID => {
            fetch(`/updateMarks?userID=${userID}`, {method: 'GET', credentials: 'include'})
                .then(response => response.json())
                .then(json => {
                    let resRows = json.rows

                    let marksList = document.getElementById('all-marks')
                    console.log(marksList)
                    marksList.innerHTML = ""
                    resRows.forEach(mark => {
                        let markDiv = document.createElement('div')
                        markDiv.innerText = mark.name
                        markDiv.style.background = mark.color
                        markDiv.className = "mark"
                        markDiv.id = "mark_" + mark.id
                        if (openedSticker) {
                            validMarkForSticker(openedSticker, mark.name, markDiv)
                        }

                        markDiv.addEventListener('click', () => {
                            if (markDiv.classList.contains('unchecked')) {
                                markDiv.className = "mark checked"
                                markDiv.append( getCheckImg() )
                            } else {
                                markDiv.className = "mark unchecked"
                                markDiv.innerHTML = mark.name
                            }

                            toggleMark(openedSticker, mark.name)
                        })

                        markDiv.append(markDelImg(mark.id))
                        marksList.append(markDiv)
                    })
                })
        })
}

function addNewMark() {
    getUserIDByLogin(userLogin.innerText)
        .then(userID => {
            let newMarkName = document.getElementById('new-mark-name').value
            let newMarkColor = document.getElementById('new-mark-color').value.slice(1)
            fetch(`/addNewMark?userID=${userID}&name=${newMarkName}&color=${newMarkColor}`, {method: 'GET', credentials: 'include'})
                .then(response => response.json())
                .then(json => {
                    updateMarks()
                })
        })
}

function markDelImg(markID) {
    let closeBTN = document.createElement('div')
    closeBTN.style.height = "inherit"
    closeBTN.style.marginTop = "-0.1em"
    closeBTN.style.marginLeft = ".3em"
    closeBTN.style.float = "right"
    closeBTN.style.display = "flex"
    closeBTN.style.alignItems = "center"

    closeBTN.addEventListener('click', () => {
        toggleMark(openedSticker, document.getElementById('mark_' + markID).innerText, false    )
        markDelReq(markID)
        updateMarks()
    })

    let delImg = document.createElement('img')
    delImg.src = './assets/close.png'
    delImg.width = 11

    closeBTN.append(delImg)

    return closeBTN
}

function markDelReq(markID) {
    fetch(`markDel?markID=${markID}`, {method: 'GET'})
}

function toggleMark(stickerID, markName, isEditWinUpdate=true) {
    fetch(`/toggleMarkBySticker?stickerID=${stickerID}&name=${markName}`, {method: 'GET', credentials: 'include'})
        .then(response => {
            updateStickers()
            if (isEditWinUpdate) { updateEditWindow() }
        })
}

function getMarkColor(name, userID) {
    return new Promise((res, rej) => {
        getMarkIDByName(name, userID)
            .then(markID => {
                fetch(`/getMarkColor?markID=${markID}`, {method: 'GET', credentials: 'include'})
                    .then(response => response.json())
                    .then(json => {
                        res(json.color)
                    })
            })
    })
}

function getMarkIDByName(name, userID) {
    return new Promise((res, rej) => {
        fetch(`/getMarkIDByName?userID=${userID}&name=${name}`, {method: 'GET', credentials: 'include'})
            .then(response => response.json())
            .then(json => {
                res(json.markID)
            })
    })
}

function closeMarkListWindow() {
    let markListWin = document.getElementById('edit-mark-list')
    markListWin.classList.toggle('d-none')
}

function saveChanges() {
    let newTitle = document.getElementById('title').value
    let newContent = document.getElementById('content').value

    fetch(`/saveChanges?stickerID=${openedSticker}&title=${newTitle}&content=${newContent}`)
        .then(response => {
            updateStickers()
            closeEditWindow()
        })
}

function giveSearchedStickers(searchedStickers, className) {
    let stickerList = document.getElementsByClassName('sticker')
    if (searchedStickers.length) {
        for (let sticker of stickerList) {

            let stickerID = Number(sticker.id.split('_')[1])
            for (let searchedStickerID of searchedStickers) {
                if (searchedStickerID.id === stickerID) {
                    sticker.classList.add(className)
                    break
                } else {
                    sticker.classList.remove(className)
                }
            }

        }
    } else {
        for (let sticker of stickerList) { sticker.classList.remove(className) }
    }
}

window.addEventListener('load', () => {
    if (signInBtn) {
        document.getElementById('login-btn').addEventListener('click', logIn)
        document.getElementById('signup-btn').addEventListener('click', signUp)
        document.cookie = ""
    }
    if (userLogin) {
        userLogin.innerText = parseCookies().userLogin
        document.getElementById('edit-window-close').addEventListener('click', closeEditWindow)
        document.getElementById('add-mark').addEventListener('click', closeMarkListWindow)
        document.getElementById('save-changes').addEventListener('click', saveChanges)
        document.getElementById('add-new-mark').addEventListener('click', () => {
            addNewMark()
        })
        updateStickers()
        updateMarks()
    }
})

setInterval(() => {
    if (search.value !== searchText) {
        searchText = search.value
        let stickerList = document.getElementsByClassName('sticker')
        if (searchText) {
            getStickersByContent(searchText)
                .then(response => giveSearchedStickers(response.ids, 'searched-content'))

            getStickersByTitle(searchText)
                .then(response => giveSearchedStickers(response.ids, 'searched-title'))

            getStickersByMark(searchText)
                .then(response => giveSearchedStickers(response.ids, 'searched-mark'))
        } else {
            for (let sticker of stickerList) {
                sticker.classList.remove('searched-content')
                sticker.classList.remove('searched-title')
                sticker.classList.remove('searched-mark')
            }
        }
    }
}, 300)