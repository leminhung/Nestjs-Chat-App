// getUserById
const getUserById = id => users.find(u => u.id === id);

// logout
const logout = () => {
  localStorage.removeItem('userData');
  location.href = './signin.html';
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

// convertDateTime
const convertDateTime = time => {
  let dateTimeParts = time.substring(0, 21).split(/[ ]/);

  return {
    d: dateTimeParts[0],
    m: dateTimeParts[1],
    t: dateTimeParts[4],
    day: dateTimeParts[2],
  };
};

$('.friend-drawer--onhover').on('click', function() {
  $('.chat-bubble')
    .hide('slow')
    .show('slow');
});
