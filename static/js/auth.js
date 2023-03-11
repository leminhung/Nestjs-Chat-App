const registerBtn = document.querySelector('.register');
const loginBtn = document.querySelector('.login');

const showToast = (message) => {
  var bgColors = [
      'linear-gradient(to right, #00b09b, #96c93d)',
      'linear-gradient(to right, #ff5f6d, #ffc371)',
    ],
    i = 0;
  Toastify({
    text: message,
    duration: 2000,
    close: true,
    style: {
      background: bgColors[i % 2],
    },
  }).showToast();
  i++;
};

var message;
if (registerBtn != null)
  registerBtn.addEventListener('click', (e) => {
    e.preventDefault();

    const nameElement = document.querySelector('.name');
    const emailElement = document.querySelector('.email');
    const passwordElement = document.querySelector('.password');
    const countryElement = document.querySelector('.country');

    fetch('/v1/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: nameElement.value.trim(),
        email: emailElement.value.trim(),
        password: passwordElement.value.trim(),
        country: countryElement.value.trim(),
      }),
    })
      .then((resp) => {
        if (resp.status === 201) {
          emailElement.value = '';
          passwordElement.value = '';
          countryElement.value = '';
          message = 'Account successfully created';
          showToast(message);

          setTimeout(() => {
            location.href = '/signin';
          }, 1000);
        } else {
          resp.json().then((data) => {
            showToast(data?.message);
          });
        }
      })
      .catch((err) => {
        showToast(err.message);
      });
  });

if (loginBtn != null)
  loginBtn.addEventListener('click', (e) => {
    console.log(registerBtn);
    e.preventDefault();

    const nameElement = document.querySelector('.name');
    const passwordElement = document.querySelector('.password');

    fetch('/v1/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: nameElement.value.trim(),
        password: passwordElement.value.trim(),
      }),
    })
      .then((resp) => {
        resp.json().then((data) => {
          if (resp.status === 201) {
            message = 'Sign in successfully';
            localStorage.setItem('userData', JSON.stringify(data));
            setTimeout(() => {
              location.href = '/chat';
            }, 1000);
          } else if (resp.status === 401) {
            message = data?.message;
          } else {
            message = 'An error occured';
          }
          showToast(message);
        });
      })
      .catch((err) => {
        showToast(err.message);
      });
  });
