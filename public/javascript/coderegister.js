'use strict';
const registerbutton = document.getElementById('register-button');
const loginRegister = document.getElementById('login-register');
const username = document.getElementById('username-reg');
const email = document.getElementById('email-reg');
const password = document.getElementById('password-reg');
const confirm = document.getElementById('confirm-password');

let check = function () {
  if (document.getElementById('password-reg').value == document.getElementById('confirm-password').value) {
    confirm.style.borderColor = 'green';
    confirm.style.borderWidth = '2px';
    password.style.borderColor = 'green';
    password.style.borderWidth = '2px';
    document.getElementById('message').style.color = 'green';
    document.getElementById('message').innerHTML = 'matching';
    registerbutton.disabled = false;
  } else {
    confirm.style.borderWidth = '2px';
    confirm.style.borderColor = 'red';
    password.style.borderColor = 'red';
    password.style.borderWidth = '2px';
    document.getElementById('message').style.color = 'red';
    document.getElementById('message').innerHTML = 'not matching';
    registerbutton.disabled = true;
  }
};

// loginRegister.addEventListener('submit', e => {
//   e.preventDefault();

//   if (document.getElementById('password-reg').value == document.getElementById('confirm-password').value) {
//     let registerForm = {
//       username: username.value,
//       email: email.value,
//       password: password.value,
//     };
//     console.log(registerForm);
//     insertTableMember(registerForm);
//     username.value = '';
//     email.value = '';
//     password.value = '';
//     confirm.value = '';
//   } else {
//     console.log('Register not successful');
//   }
// });

// const insertTableMember = function (registerForm) {
//   let xhr = new XMLHttpRequest();
//   xhr.open('POST', '/insertMember');
//   xhr.setRequestHeader('content-type', 'application/json');
//   xhr.onload = function () {
//     console.log(xhr.responseText);
//   };
//   xhr.send(JSON.stringify(registerForm));
// };
