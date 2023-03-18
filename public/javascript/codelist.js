('use strict');

const saveButton = document.getElementById('save-button');
const gridTemplate = document.getElementById('grid-template');
const search = document.getElementById('search-input');
const saveSuccess = document.getElementById('save-success');
const dataName = document.getElementsByName('name');
const dataQuantity = document.getElementsByName('quantity');
const dataDate = document.getElementsByName('expirydate');
const ausgabeDifferenz = document.getElementById('ausgabe-differenz');
let search_term = '';
let output = '';

// When the user scrolls the page, execute myFunction
window.onscroll = function () {
  let header = document.getElementById('header');
  let sticky = header.offsetTop;
  if (window.pageYOffset >= sticky) {
    header.classList.add('sticky');
  }
};

function selectLogo(element) {
  // remove "selected" class from all logos
  var logos = document.getElementsByClassName('logo');
  for (var i = 0; i < logos.length; i++) {
    logos[i].classList.remove('selected');
  }
  // add "selected" class to clicked logo
  element.classList.add('selected');
  // set selected logo image
  var selectedLogo = document.getElementById('selectedLogo');
  selectedLogo.src = element.src;
  selectedLogo.alt = element.alt;
}

function newRow() {
  const rowWrapper = document.createElement('form');
  rowWrapper.id = 'row-wrapper';

  const newInput1 = document.createElement('i');
  newInput1.id = 'capture';
  newInput1.className = 'fa-solid fa-camera fa-2xl';
  newInput1.onclick = function () {
    openStream(this);
  };
  const newInput2 = document.createElement('canvas');
  newInput2.id = 'canvas';
  const newInput3 = document.createElement('input');
  newInput3.id = 'product-name';
  newInput3.name = 'name';
  newInput3.type = 'text';
  newInput3.placeholder = 'Name';
  newInput3.maxLength = 30;
  const newInput4 = document.createElement('input');
  newInput4.id = 'product-quantity';
  newInput4.name = 'quantity';
  newInput4.type = 'text';
  newInput4.placeholder = 'Quantity';
  const newInput5 = document.createElement('select');
  newInput5.id = 'product-measure';
  newInput5.name = 'measure';
  const option1 = document.createElement('option');
  option1.value = 'l';
  option1.text = 'liter';
  const option2 = document.createElement('option');
  option2.value = 'kg';
  option2.text = 'kilogram';
  const option3 = document.createElement('option');
  option3.value = 'piece';
  option3.text = 'piece';
  const newInput6 = document.createElement('input');
  newInput6.id = 'product-expirydate';
  newInput6.name = 'expirydate';
  newInput6.type = 'date';
  newInput6.placeholder = 'Expiry-Date';
  const newButton = document.createElement('button');
  newButton.id = 'delete-self-row';
  newButton.setAttribute('onclick', 'deleteSelfRow(this)');
  newButton.type = 'button';
  const buttonMinus = document.createElement('i');
  buttonMinus.className = 'fa-solid fa-minus';
  gridTemplate.appendChild(rowWrapper);
  rowWrapper.appendChild(newInput1);
  rowWrapper.appendChild(newInput2);
  rowWrapper.appendChild(newInput3);
  rowWrapper.appendChild(newInput4);
  newInput5.appendChild(option1);
  newInput5.appendChild(option2);
  newInput5.appendChild(option3);
  rowWrapper.appendChild(newInput5);
  rowWrapper.appendChild(newInput6);
  rowWrapper.appendChild(newButton);
  newButton.appendChild(buttonMinus);
}

function deleteRow() {
  gridTemplate.removeChild(gridTemplate.lastChild);
}

function deleteSelfRow(e) {
  e.parentElement.remove();
}

function closeAusgabe() {
  ausgabeDifferenz.style.visibility = 'hidden';
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

function saveList() {
  let pNameList = document.getElementsByName('name');
  let pQuantityList = document.getElementsByName('quantity');
  let pExpirydateList = document.getElementsByName('expirydate');
  let pMeasureList = document.getElementsByName('measure');
  let pPhotoList = document.getElementsByTagName('canvas');

  /* let test = pPhotoList[0].toBlob(function (blob) {
    blobArray.push(blob);
  }, 'image/png');
  console.log(blobArray); */

  deleteProducts();
  for (let i = 0; i < gridTemplate.childElementCount; i++) {
    let dbElement = {
      /* photo: blobArray, */
      name: pNameList[i].value,
      quantity: pQuantityList[i].value,
      measure: pMeasureList[i].selectedIndex,
      expirydate: pExpirydateList[i].value,
    };
    if (dbElement.name === '' || dbElement.quantity === '' || dbElement.expirydate === '') {
      saveSuccess.style.visibility = 'hidden';
      saveSuccess.innerHTML = "Name, Quantity or Expiry-Date can't be empty.";
      saveSuccess.style.visibility = 'visible';
      saveSuccess.style.color = 'red';
    } else {
      saveSuccess.style.visibility = 'hidden';
      saveSuccess.innerHTML = 'Save successful!';
      saveSuccess.style.visibility = 'visible';
      saveSuccess.style.color = 'green';
      insertTable(dbElement);
    }
  }
}

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
  // console.log(dataValue);
  dataValue.forEach(element => {
    child = gridTemplate.getElementsByTagName('form')[dataValue.indexOf(element)];
    if (element.includes(filter)) {
      child.style.display = '';
    } else {
      child.style.display = 'none';
    }
    console.log(typeof element);
    console.log(element);
    if (element === '') {
      child.style.display = 'none';
    }
  });
};

search.addEventListener('input', filterList);
