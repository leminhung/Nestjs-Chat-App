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
  lastSender = null,
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
  let listUsers = document.querySelector('.chat-list');
  let item = document.createElement('div');
  item.innerHTML = `
    <!-- user lists -->
    <div id="friends" class="friends ${user.id}">
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

socket.on('message', msg => {
  receiveMessage(msg);
});

socket.on('users/online', usersId => {
  updateOnlineUsers(usersId);
});

socket.on('users/new', user => {
  users.push(user);
});

socket.on('newMessage/user/' + userData.data.userId, msg => {
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

// chatWith
const chatWith = u => {
  chat_open = !chat_open;
  if (activeChat === u) return;

  activeChat = u;
  unreadMessages[u.id] = [];
  loadConversationsWith(u);
};

// Handle send message
sendMessageElement.addEventListener('click', e => {
  e.preventDefault();
  sendMessage();
});

// sendMessage
const sendMessage = () => {
  if (!activeChat) {
    alert('Select user first');
    return;
  }

  if (message_content.trim() === '') {
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
      message: message_content,
    }),
  })
    .then(resp => {
      loading = false;
      console.log(resp);
      if (resp.status === 201) {
        resp.json().then(data => {
          messages[activeChat.id].push(data);
          message_content = '';
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
      'chat-detail',
    )[0].scrollTop = document.getElementsByClassName(
      'chat-detail',
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
              lastSender.senderId == u.id ? 'you: ' : '',
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

// loadConversationsWith
const loadConversationsWith = u => {
  loading = true;
  fetch('/v1/api/chat/' + u.id + '/messages', {
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
        if (!messages[u.id]) messages[u.id] = [];
        messages[u.id] = Array.from(data);
        conversations = Array.from(data);
        console.log('with', u.username);
        loading = false;
        scrollToBottom();
      });
    })
    .catch(err => {
      console.log(err);
      loading = false;
    });
};

const selectUserToChatElement = document.querySelector('#friends');
selectUserToChatElement.addEventListener('click', e => {
  e.preventDefault();
  console.log('Helllofdfuduf');
});

$('.friend-drawer--onhover').on('click', function() {
  $('.chat-bubble')
    .hide('slow')
    .show('slow');
});
