import { io } from 'https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.7.2/socket.io.esm.min.js'


const username = localStorage.getItem('username')
const socket = io('https://chat-app-ten-nu-92.vercel.app/chat', {
    auth: { username }
})
const form = document.querySelector('#form')
const input = document.querySelector('#input')
const messages = document.querySelector('#messages') 
const usersList = document.querySelector('.users')
const menu = document.querySelector('#menu-bars')
const logout = document.querySelector('#logout')


document.addEventListener('DOMContentLoaded', ()=>{
    if(!username){
        location.href = '../index.html'
    }
})

menu.onclick = ()=>{
    menu.classList.toggle('fa-times')
    usersList.classList.toggle('active')
}

logout.onclick = ()=>{
    const decide = window.confirm('Tem certeza que deseja sair do chat?')

    if(decide){
        localStorage.clear()
        socket.emit('logout', username)
        location.href = '../index.html'
    }
}

socket.on('users', (users)=>{
    users.map(user=>{
        const item = `<li data-user-id='${user.id}'>${user.user}</li>`
        const newItem = document.createRange()
            .createContextualFragment(item)
            .querySelector('li')
        
        newItem.addEventListener('click', ()=>{
            if(user.user === username){
                alert('Está chamando você mesmo pro privado.')
                return
            }

            socket.emit('privateRequest', user.user)
        })
        usersList.appendChild(newItem)
    })    
})

form.addEventListener('submit', (e)=>{
    e.preventDefault()
    
    if(input.value){
        socket.emit('message', input.value, username)

        input.value = ''
    }
})


const sentId = new Set()
socket.on('message', (msgs, sender, id)=>{  
    console.log(sentId.has(id))
    if(!sentId.has(id)){
        //sentId.add(id)

        if(sender === username){
            const item = `
                <li class='recipient-message'>
                    <div class='message-field'>
                        <small>${sender}</small><br>
                        ${msgs}
                    </div>
                </li>
            `
            messages.insertAdjacentHTML('beforeend', item)
            messages.scrollTop = messages.scrollHeight
            //window.scrollTo(0, document.body.scrollHeight)
        }else{
            const item = `
                <li class='sender-message'>
                    <div class='message-field'>
                        <small>${sender}</small><br>
                        ${msgs}
                    </div>
                </li>
            `
            messages.innerHTML += item
            messages.scrollTop = messages.scrollHeight
            //window.scrollTo(0, document.body.scrollHeight)
        }
    }
})

socket.on('isolated', (msg)=>{
    alert(msg)
})

socket.on('privateMessage', (sender)=>{
    const decide = window.confirm(`${sender} está te chamando para o privado.`)

    if(decide){
        socket.emit('privateMessage', sender, 'Aceitou')
        location.href = '../private/private.html'
    }else{
        socket.emit('privateMessage', sender, 'Recusou')
    }
})

socket.on('private', (msg, sender)=>{
    if(msg === 'Aceitou'){
        alert(`${sender} aceitou sua chamada para o privado.`)
        location.href = '../private/private.html'
    }else if(msg === 'Recusou'){
        alert(`${sender} recusou sua chamada para o privado`)
    }
})

