const sendMessageElement = document.querySelector('.send-btn');

var chat_open = false,
  query = '',
  users = [],
  userData = null,
  loading = false,
  activeChat = null,
  activeChatMessages = null,
  title = 'Opensource REST API | apimocket',
  messages = [],
  unreadMessages = [],
  message_content = '',
  socket = null,
  chatArea = document.querySelector('.chat-area'),
  lastSender = null,
  chatItem = document.createElement('div'),
  listUsers = null;
onlineUsers = [];

const getMessages = () => {
  if (activeChat) {
    if (!messages[activeChat.id]) return [];
    return messages[activeChat.id];
  }
  return [];
};
getMessages();

userData = JSON.parse(localStorage.getItem('userData'));
socket = io('/chat', {
  transports: ['websocket'],
  query: {
    token: userData.accessToken,
  },
});

// addUsersToView
const addUsersToView = (user, lastMsg, senderName) => {
  listUsers = document.querySelector('.chat-list');
  let item = document.createElement('div');
  item.innerHTML =
    `
    <!-- user lists -->
    <div id="friends" class="friends" onClick="chatWith(` +
    user.id +
    `)">
      <!-- photo -->
      <div class="profile friends-photo">
        <img src="users/${user?.avatar ? user?.avatar : 'MinhHung.jpg'}" alt="${
      user.username
    }" />
      </div>

      <div class="friends-credent">
        <!-- name -->
        <span class="friends-name">${user.username}</span>
        <!-- last message -->
        <span class="friends-message"
          >${senderName}${lastMsg}</span
        >
      </div>
      <!-- notification badge -->
      <span class="badge notif-badge">7</span>
    </div>
  `;
  listUsers.appendChild(item);
};

// loadUsers
const loadUsers = () => {
  fetch('/v1/api/users', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + userData.accessToken,
    },
  })
    .then((resp) => {
      loading = false;
      resp.json().then((data) => {
        users = data;
        console.log('users--', users);
        loadMyConversations();
      });
    })
    .catch((err) => {
      console.log('err--', err);
      loading = false;
    });
};
loadUsers();

// Select user in list to chat
const chatWith = (id) => {
  chat_open = !chat_open;
  const user = getUserById(id);
  if (user) {
    activeChat = user;
    loadConversationsWith(user);
  }
};

socket.on('message', (msg) => {
  console.log('Msg', msg);
  receiveMessage(msg);
});

socket.on('users/online', (usersId) => {
  updateOnlineUsers(usersId);
});

socket.on('users/new', (user) => {
  users.push(user);
});

socket.on(`newMessage/user/${userData.data.id}`, (msg) => {
  receiveMessage(msg);
});

// filterUsers
const filterUsers = () => {
  if (!query || query.trim() === '') {
    return users;
  }
  return users.filter(
    (u) => u.username.includes(query) || u.country.includes(query),
  );
};

// Handle send message
sendMessageElement.addEventListener('click', (e) => {
  e.preventDefault();
  sendMessage();
});

// sendMessage
const sendMessage = () => {
  if (!activeChat) {
    alert('Select user first');
    return;
  }

  var msg_content = document.querySelector('.type-area');
  if (msg_content.value.trim() === '') {
    alert('Message could not be empty');
    return;
  }
  fetch('/v1/api/chat/' + activeChat.id + '/sendMessage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + userData.accessToken,
    },
    body: JSON.stringify({
      message: msg_content.value.trim(),
    }),
  })
    .then((resp) => {
      loading = false;
      console.log(resp);

      if (resp.status === 201) {
        resp.json().then((data) => {
          messages[activeChat.id].push(data);
          msg_content.value = '';
          scrollToBottom();
        });
      } else {
        alert('An error occured');
      }
    })
    .catch((err) => {
      console.log(err);
      loading = false;
    });
};

// receiveMessage
const receiveMessage = (msg) => {
  const user = getUserById(msg.senderId);
  const date = convertDateTime(msg.createdAt);

  if (userData.data.id === msg.receiverId)
    chatArea.innerHTML += `
          <div id="friends-chat" class="friends-chat">
            <div class="profile friends-chat-photo">
              <img src="users/${
                user?.avatar ? user?.avatar : 'MinhHung.jpg'
              }" alt="${user.username}" />
            </div>
            <div class="friends-chat-content">
              <p class="friends-chat-name">${user?.username}</p>
              <p class="friends-chat-balloon">${msg.content}</p>
              <h5 class="chat-datetime">${date.d}, ${date.m} ${date.day} | ${
      date.t
    }</h5>
            </div>
          </div>`;
  else if (userData.data.id === msg.senderId)
    chatArea.innerHTML += `
        <div id="your-chat" class="your-chat">
          <p class="your-chat-balloon">${msg.content}</p>
          <p class="chat-datetime">
            <span class="glyphicon glyphicon-ok"></span> ${date.d}, ${date.m} ${date.day} | ${date.t}
          </p>
        </div>`;

  // if (!activeChat || (activeChat && msg.senderId !== activeChat.id)) {
  //   unreadMessages[msg.senderId]
  //     ? unreadMessages[msg.senderId]++
  //     : (unreadMessages[msg.senderId] = 1);
  // }

  scrollToBottom();
};

// loadMyConversations
const loadMyConversations = () => {
  fetch('/v1/api/chat/messages', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + userData.accessToken,
    },
  })
    .then((resp) => {
      loading = false;
      if (resp.status === 200 || resp.status === 304) {
        resp.json().then((data) => {
          users.forEach((u) => {
            let local = [];
            data.forEach((m) => {
              if (!messages[m.senderId]) messages[m.senderId] = [];
              if (u.id === m.senderId || u.id === m.receiverId) {
                local.push(m);
              }
            });
            console.log(u.username, local);
            lastSender = local[local.length - 1];
            addUsersToView(
              u,
              lastSender?.content,
              lastSender.senderId == u.id ? '' : 'you: ',
            );
            messages[u.id] = local;
            local = [];
          });
        });
      } else {
        alert('Please login to reconnect');
        location.href = './signin.html';
      }
    })
    .catch((err) => {
      console.log(err);
      loading = false;
    });
};

// addMessageToView
const addMessageToView = (user, conversations) => {
  console.log('with: ', user.id);
  chatItem = document.createElement('div');

  chatArea.innerHTML = '';
  conversations.forEach((item) => {
    const date = convertDateTime(item.createdAt);
    if (item.senderId == user.id)
      chatArea.innerHTML += `<!-- FRIENDS CHAT TEMPLATE -->
          <div id="friends-chat" class="friends-chat">
            <div class="profile friends-chat-photo">
              <img src="users/${
                user?.avatar ? user?.avatar : 'MinhHung.jpg'
              }" alt="${user.username}" />
            </div>
            <div class="friends-chat-content">
              <p class="friends-chat-name">${user.username}</p>
              <p class="friends-chat-balloon">${item.content}</p>
              <h5 class="chat-datetime">${date.d}, ${date.m} ${date.day} | ${
        date.t
      }</h5>
            </div>
          </div>`;
    else
      chatArea.innerHTML += `<!-- YOUR CHAT TEMPLATE -->
          <div id="your-chat" class="your-chat">
            <p class="your-chat-balloon">${item.content}</p>
            <p class="chat-datetime">
              <span class="glyphicon glyphicon-ok"></span> ${date.d}, ${date.m} ${date.day} | ${date.t}
            </p>
          </div>`;
  });
  scrollToBottom();
};

// loadConversationsWith
const loadConversationsWith = (user) => {
  // loading = true;
  fetch('/v1/api/chat/' + user.id + '/messages', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + userData.accessToken,
    },
  })
    .then((resp) => {
      if (resp.status === 401) {
        alert('Please login to reconnect');
        location.href = './signin.html';
      }

      resp.json().then((data) => {
        if (!messages[user.id]) messages[user.id] = [];
        messages[user.id] = Array.from(data);
        conversations = Array.from(data);
        addMessageToView(user, conversations);
        // loading = false;
      });
    })
    .catch((err) => {
      console.log(err);
      // loading = false;
    });
};
