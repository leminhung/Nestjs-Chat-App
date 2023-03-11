// getUserById
const getUserById = (id) => users.find((u) => u.id === id);

// logout
const logout = () => {
  localStorage.removeItem('userData');
  location.href = '/signin';
};

// isOnline
const isOnline = (id) => {
  if (typeof id == 'string') id = parseInt(id);
  return onlineUsers.indexOf(id) != -1;
};

// updateOnlineUsers
const updateOnlineUsers = (usersId) => {
  onlineUsers = usersId;

  setTimeout(() => {
    const statusUserEls = document.querySelectorAll('.indicator');
    statusUserEls.forEach((item) => {
      let clsNames = item.className.split(/[ ]/);
      if (!isOnline(clsNames[0]))
        item.className = `${clsNames[0]} indicator offline`;
      else item.className = `${clsNames[0]} indicator online`;
    });
  }, 300);
};

// getLet
const getLet = (id) => {
  if (!messages[id]) return 0;
  return messages[id].length;
};

// getUnreadCount
const getUnreadCount = (id) => {
  if (!unreadMessages[id]) {
    unreadMessages[id] = [];
    return 0;
  }

  setTimeout(() => {
    const notifEls = document.querySelectorAll('.notif-badge');
    notifEls.forEach((item) => {
      let clsNames = item.className.split(/[ ]/);
      if (clsNames[0] == id) {
        item.innerHTML = unreadMessages[id].length;
      }
    });
  }, 300);
};

// scrollToBottom
const scrollToBottom = () => {
  setTimeout(() => {
    document.getElementsByClassName('chat-area')[0].scrollTop =
      document.getElementsByClassName('chat-area')[0].scrollHeight;
  }, 10);
};

// convertDateTime
const convertDateTime = (time) => {
  let dateTimeParts = time.substring(0, 21).split(/[ ]/);
  return {
    d: dateTimeParts[0],
    m: dateTimeParts[1],
    t: dateTimeParts[4],
    day: dateTimeParts[2],
  };
};

const renderSenderTemplate = (msg, dateData) => {
  let date = convertDateTime(dateData);
  if (userData.data.id === msg?.receiverId) {
    const user = getUserById(msg.senderId);
    return `
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
  } else if (userData.data.id === msg?.senderId)
    return `
            <div id="your-chat" class="your-chat">
              <p class="your-chat-balloon">${msg.content}</p>
              <p class="chat-datetime">
                <span class="glyphicon glyphicon-ok"></span> ${date.d}, ${date.m} ${date.day} | ${date.t}
                            </p>
             </div>`;
  else if (typeof msg == 'string')
    return `
            <div id="your-chat" class="your-chat">
              <p class="your-chat-balloon">${msg}</p>
              <p class="chat-datetime">
                <span class="glyphicon glyphicon-ok"></span> ${date.d}, ${date.m} ${date.day} | ${date.t}
                            </p>
             </div>`;
};

$('.friend-drawer--onhover').on('click', function () {
  $('.chat-bubble').hide('slow').show('slow');
});
