'use strict';

const saveButton = document.getElementById('save-button');
const inputPicture = document.getElementById('file-selector');
const newRow = document.getElementById('new-row');
const deleteRow = document.getElementById('delete-row');
const gridTemplate = document.getElementById('grid-template');
const deleteSelfRow = document.getElementById('delete-self-row');
const search = document.getElementById('search-input');
let search_term = '';

window.onload = function () {
  let output = '';

  inputPicture.addEventListener('change', function () {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      output = '';
      output = reader.result;
      this.style.backgroundImage = `url(${output})`;
    });
    reader.readAsDataURL(this.files[0]);
  });

  newRow.addEventListener('click', function () {
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
    newButton.addEventListener('click', function () {
      this.parentElement.remove();
    });
    const buttonMinus = document.createElement('i');
    buttonMinus.className = 'fa-solid fa-minus';
    gridTemplate.appendChild(rowWrapper);
    rowWrapper.appendChild(newInput2);
    rowWrapper.appendChild(newInput3);
    rowWrapper.appendChild(newInput4);
    rowWrapper.appendChild(newInput5);
    rowWrapper.appendChild(newButton);
    newButton.appendChild(buttonMinus);
  });

  deleteRow.addEventListener('click', function () {
    console.log('clicked');
    gridTemplate.removeChild(gridTemplate.lastChild);
  });

  deleteSelfRow.addEventListener('click', function () {
    this.parentElement.remove();
  });
};

saveButton.addEventListener('click', e => {
  let pImageList = document.getElementsByName('image');
  let pNameList = document.getElementsByName('name');
  let pQuantityList = document.getElementsByName('quantity');
  let pExpirydateList = document.getElementsByName('expirydate');

  e.preventDefault();
  truncateTable();

  for (let i = 0; i < gridTemplate.childElementCount; i++) {
    let dbElement = {
      image: pImageList[i].value,
      name: pNameList[i].value,
      quantity: pQuantityList[i].value,
      expirydate: pExpirydateList[i].value,
    };

    if (dbElement.name === '' || dbElement.quantity === '' || dbElement.expirydate === '') {
      console.log('Fehler');
    } else {
      console.log(dbElement);
      insertTable(dbElement);
    }
  }
});

const truncateTable = function () {
  let xhr = new XMLHttpRequest();
  xhr.open('POST', '/truncate');
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
  const data = document.getElementsByName('name');
  let dataValue = [];
  let child;
  for (let i = 0; i < data.length; i++) {
    dataValue.push(data[i].value.toLowerCase());
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
