'use strict';

const saveButton = document.getElementById('save-button');
const gridTemplate = document.getElementById('grid-template');
const search = document.getElementById('search-input');
const saveSuccess = document.getElementById('save-success');
const dataName = document.getElementsByName('name');
const dataQuantity = document.getElementsByName('quantity');
const dataDate = document.getElementsByName('expirydate');
let search_term = '';
let output = '';

// When the user scrolls the page, execute myFunction
window.onscroll = function () {
  let header = document.getElementById('header');
  // let footer = document.getElementsById('footer');
  let sticky = header.offsetTop;
  if (window.pageYOffset >= sticky) {
    header.classList.add('sticky');
    // footer.classList.add('sticky');
  }
};

function inputPicture() {
  const reader = new FileReader();
  reader.addEventListener('load', () => {
    output = '';
    output = reader.result;
    this.style.backgroundImage = `url(${output})`;
  });
  reader.readAsDataURL(this.files[0]);
}

function newRow() {
  const rowWrapper = document.createElement('form');
  rowWrapper.id = 'row-wrapper';
  const newInput2 = document.createElement('input');
  newInput2.id = 'file-selector';
  newInput2.name = 'image';
  newInput2.type = 'file';
  newInput2.placeholder = 'Picture';
  newInput2.accept = '.jpg, .jpeg, .png';
  newInput2.addEventListener('change', function () {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      output = '';
      output = reader.result;
      this.style.backgroundImage = `url(${output})`;
    });
    reader.readAsDataURL(this.files[0]);
  });
  const newInput3 = document.createElement('input');
  newInput3.id = 'product-name';
  newInput3.name = 'name';
  newInput3.type = 'text';
  newInput3.placeholder = 'Name';
  const newInput4 = document.createElement('input');
  newInput4.id = 'product-quantity';
  newInput4.name = 'quantity';
  newInput4.type = 'text';
  newInput4.placeholder = 'Quantity';
  const newInput5 = document.createElement('input');
  newInput5.id = 'product-expirydate';
  newInput5.name = 'expirydate';
  newInput5.type = 'date';
  newInput5.placeholder = 'Expiry-Date';
  const newButton = document.createElement('button');
  newButton.id = 'delete-self-row';
  newButton.setAttribute('onclick', 'deleteSelfRow(this)');
  newButton.type = 'button';
  const buttonMinus = document.createElement('i');
  buttonMinus.className = 'fa-solid fa-minus';
  gridTemplate.appendChild(rowWrapper);
  rowWrapper.appendChild(newInput2);
  rowWrapper.appendChild(newInput3);
  rowWrapper.appendChild(newInput4);
  rowWrapper.appendChild(newInput5);
  rowWrapper.appendChild(newButton);
  newButton.appendChild(buttonMinus);
}

function deleteRow() {
  gridTemplate.removeChild(gridTemplate.lastChild);
}

function deleteSelfRow(e) {
  e.parentElement.remove();
}

function showSort() {
  document.getElementById('sort-dropdown-content').classList.toggle('show');
}

// Close the dropdown if the user clicks outside of it
window.onclick = function (event) {
  if (!event.target.matches('#sort-button')) {
    let myDropdown = document.getElementById('sort-dropdown-content');
    if (myDropdown.classList.contains('show')) {
      myDropdown.classList.remove('show');
    }
  }
};

saveButton.addEventListener('click', e => {
  let pImageList = document.getElementsByName('image');
  let pNameList = document.getElementsByName('name');
  let pQuantityList = document.getElementsByName('quantity');
  let pExpirydateList = document.getElementsByName('expirydate');

  e.preventDefault();
  deleteProducts();

  for (let i = 0; i < gridTemplate.childElementCount; i++) {
    let dbElement = {
      image: pImageList[i].value,
      name: pNameList[i].value,
      quantity: pQuantityList[i].value,
      expirydate: pExpirydateList[i].value,
    };

    if (dbElement.name === '' || dbElement.quantity === '' || dbElement.expirydate === '') {
      saveSuccess.innerHTML = "Name, Quantity or Expiry-Date can't be empty.";
      saveSuccess.style.visibility = 'visible';
      saveSuccess.style.color = 'red';
    } else {
      saveSuccess.innerHTML = 'Save successful!';
      saveSuccess.style.visibility = 'visible';
      saveSuccess.style.color = 'green';
      insertTable(dbElement);
    }
  }
});

const deleteProducts = function () {
  let xhr = new XMLHttpRequest();
  xhr.open('POST', '/deleteproducts');
  xhr.onload = function () {
    console.log(xhr.responseText);
  };
  xhr.send();
};

const insertTable = function (dbElement) {
  let xhr = new XMLHttpRequest();
  xhr.open('POST', '/insert');
  xhr.setRequestHeader('content-type', 'application/json');
  xhr.onload = function () {
    console.log(xhr.responseText);
  };
  xhr.send(JSON.stringify(dbElement));
};

const filterList = function () {
  const searchInput = document.getElementById('search-input');
  const filter = searchInput.value.toLowerCase();
  let dataValue = [];
  let child;
  for (let i = 0; i < dataName.length; i++) {
    dataValue.push(dataName[i].value.toLowerCase());
  }
  dataValue.forEach(element => {
    child = gridTemplate.getElementsByTagName('form')[dataValue.indexOf(element)];
    if (element.includes(filter)) {
      child.style.display = '';
    } else {
      child.style.display = 'none';
    }
  });
};

search.addEventListener('input', filterList);
