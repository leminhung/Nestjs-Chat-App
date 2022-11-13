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
  chatArea,
  lastSender = null,
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
        <img src="images/MinhHung.jpg" alt="" />
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
    .then(resp => {
      loading = false;
      resp.json().then(data => {
        users = data;
        loadMyConversations();
      });
    })
    .catch(err => {
      console.log(err);
      loading = false;
    });
};
loadUsers();

// Select user in list to chat
const chatWith = id => {
  chat_open = !chat_open;
  // if (activeChat === u) return;
  // unreadMessages[u.id] = [];
  const user = users.find(u => u.id === id);
  if (user) {
    activeChat = user;
    loadConversationsWith(user);
  }
};

socket.on('message', msg => {
  console.log('Msg', msg);
  receiveMessage(msg);
});

socket.on('users/online', usersId => {
  updateOnlineUsers(usersId);
});

socket.on('users/new', user => {
  users.push(user);
});

socket.on('newMessage/user/' + userData.data.userId, msg => {
  console.log('newMsg', msg);
  receiveMessage(msg);
});

// filterUsers
const filterUsers = () => {
  if (!query || query.trim() === '') {
    return users;
  }
  return users.filter(
    u => u.username.includes(query) || u.country.includes(query),
  );
};

// isOnline
const isOnline = id => {
  return onlineUsers.indexOf(id) !== -1;
};

// updateOnlineUsers
const updateOnlineUsers = usersId => {
  console.log(usersId);
  onlineUsers = usersId;
};

// logout
const logout = () => {
  localStorage.removeItem('userData');
  location.href = './signin.html';
};

// getLet
const getLet = id => {
  if (!messages[id]) return 0;

  return messages[id].length;
};

// getUnreadCount
const getUnreadCount = id => {
  if (!unreadMessages[id]) {
    unreadMessages[id] = [];
    return 0;
  }
  return unreadMessages[id].length;
};

// Handle send message
sendMessageElement.addEventListener('click', e => {
  e.preventDefault();
  sendMessage();
});

// sendMessage
const sendMessage = () => {
  let chatItem = document.createElement('div');
  if (!activeChat) {
    alert('Select user first');
    return;
  }

  var msg_content = document.querySelector('.type-area');
  if (msg_content.value.trim() === '') {
    alert('Message could not be empty');
    return;
  }
  console.log('active_chat--', activeChat);
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
    .then(resp => {
      loading = false;
      console.log(resp);

      if (resp.status === 201) {
        resp.json().then(data => {
          messages[activeChat.id].push(data);
          chatItem.innerHTML = `<!-- YOUR CHAT TEMPLATE -->
          <div id="your-chat" class="your-chat">
            <p class="your-chat-balloon">${msg_content.value.trim()}</p>
            <p class="chat-datetime">
              <span class="glyphicon glyphicon-ok"></span> Sun, Aug 30 | 15:45
            </p>
          </div>`;
          chatArea.appendChild(chatItem.cloneNode(true));
          msg_content.value = '';
          scrollToBottom();
        });
      } else {
        alert('An error occured');
      }
    })
    .catch(err => {
      console.log(err);
      loading = false;
    });
};

// scrollToBottom
const scrollToBottom = () => {
  setTimeout(() => {
    document.getElementsByClassName(
      'chat-area',
    )[0].scrollTop = document.getElementsByClassName(
      'chat-area',
    )[0].scrollHeight;
  }, 10);
};

// receiveMessage
const receiveMessage = msg => {
  if (!messages[msg.senderId]) messages[msg.senderId] = [];
  messages[msg.senderId].push(msg);
  if (!activeChat || (activeChat && msg.senderId !== activeChat.id)) {
    unreadMessages[msg.senderId]
      ? unreadMessages[msg.senderId]++
      : (unreadMessages[msg.senderId] = 1);
  }

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
    .then(resp => {
      console.log(resp.status);
      loading = false;
      if (resp.status === 200 || resp.status === 304) {
        resp.json().then(data => {
          users.forEach(u => {
            let local = [];
            data.forEach(m => {
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
    .catch(err => {
      console.log(err);
      loading = false;
    });
};

// addMessageToView
const addMessageToView = (user, conversations) => {
  console.log('with: ', user.id);
  console.log('conversations: ', conversations);
  chatArea = document.querySelector('.chat-area');
  let chatItem = document.createElement('div');
  chatArea.innerHTML = '';
  conversations.forEach(item => {
    if (item.senderId == user.id)
      chatItem.innerHTML = `<!-- FRIENDS CHAT TEMPLATE -->
          <div id="friends-chat" class="friends-chat">
            <div class="profile friends-chat-photo">
              <img src="images/MinhHung.jpg" alt="" />
            </div>
            <div class="friends-chat-content">
              <p class="friends-chat-name">${user.username}</p>
              <p class="friends-chat-balloon">${item.content}</p>
              <h5 class="chat-datetime">Sun, Aug 30 | 15:41</h5>
            </div>
          </div>`;
    else
      chatItem.innerHTML = `<!-- YOUR CHAT TEMPLATE -->
          <div id="your-chat" class="your-chat">
            <p class="your-chat-balloon">${item.content}</p>
            <p class="chat-datetime">
              <span class="glyphicon glyphicon-ok"></span> Sun, Aug 30 | 15:45
            </p>
          </div>`;
    chatArea.appendChild(chatItem.cloneNode(true));
  });
  scrollToBottom();
};

// loadConversationsWith
const loadConversationsWith = user => {
  // loading = true;
  fetch('/v1/api/chat/' + user.id + '/messages', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + userData.accessToken,
    },
  })
    .then(resp => {
      if (resp.status === 401) {
        alert('Please login to reconnect');
        location.href = './signin.html';
      }

      resp.json().then(data => {
        if (!messages[user.id]) messages[user.id] = [];
        messages[user.id] = Array.from(data);
        conversations = Array.from(data);
        addMessageToView(user, conversations);
        // loading = false;
      });
    })
    .catch(err => {
      console.log(err);
      // loading = false;
    });
};

$('.friend-drawer--onhover').on('click', function() {
  $('.chat-bubble')
    .hide('slow')
    .show('slow');
});
