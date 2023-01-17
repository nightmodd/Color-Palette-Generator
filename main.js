//CONSTANTS
const generateButton = document.querySelector('.generate_button');
const ul = document.querySelector('#display-colors');
const ulForNav = document.querySelector('#mobile-view');
const navBar = document.getElementById('nav');
const html = String.raw;
let lastScrollTop = 0;

//UTILITIES
function generateHexCode() {
  const letters = '0123456789ABCDEF';
  let color = '';

  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;

  //return Math.floor(Math.random() * MAX_HEX_VALUE).toString(16);
}

function initColorState(colorsNumber) {
  colorsState = new Array(colorsNumber).fill(null).map(() => ({
    code: generateHexCode(),
    locked: false,
  }));
}

function deleteFromColorState(deletedIndex) {
  const tempState = colorsState.filter((_, index) => deletedIndex !== index);
  colorsState = tempState;
}

function renderOnTransitionEnd() {
  render(colorsState);
}

function hideNavOnScroll() {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  if (scrollTop > lastScrollTop) {
    navBar.style.top = '-300px';
  } else {
    navBar.style.top = '10px';
  }
  lastScrollTop = scrollTop;
}
//CORE/LIB
let colorsState = [];

async function swalAlertOnReload() {
  const { value } = await swal.fire({
    title: 'Welcome',
    input: 'number',
    inputPlaceholder: 'Select a number of colors',
    confirmButtonText: 'Generate',
    inputValidator: (value) => {
      if (!value || Number(value) < 1) {
        return 'You need to choose a positive value!';
      }
      if (Number(value) > 12) {
        return 'You need to choose a number below 13';
      }
    },
  });

  const colorsNumber = Number(value);

  swal
    .fire({
      title: `Are you sure you want to generate ${colorsNumber} colors?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
    })
    .then((result) => {
      if (result.isConfirmed) {
        initColorState(colorsNumber);
        loadColors();
      } else {
        swalAlertOnReload();
      }
    });
}

function generateRandomColors() {
  return colorsState.map((color) => {
    if (color.locked) {
      return color;
    }
    return {
      code: generateHexCode(),
      locked: false,
    };
  });
}

function Colour(color, index) {
  const { code, locked } = color;
  /*eslint no-irregular-whitespace: "error"*/
  return html`
    <li
      class="item"
      ontransitionend="renderOnTransitionEnd()"
      data-index="${index}"
      id="${index}"
      ondrop="dropHandler(event)"
      ondragstart="dragStartHandler(event)"
      ondragover="dragOverHandler(event)"
      ondragenter="dragEnterHandler(event)"
      ondragleave="dragLeaveHandler(event)"
      draggable="true"
    >
      <div class="whole_color_data" id="${index}">
        <div class="color_container">
          <button
            title="copy colour"
            onclick="copyHexcode(event)"
            data-color="#${code}"
          >
            <div class="color" style="background:#${code}"></div>
          </button>
          <button
            title="copy colour"
            class="hexacode"
            onclick="copyHexcode(event)"
            data-color="#${code}"
          >
            <p class="color_hexcode">#${code}</p>
          </button>
        </div>
        <div class="function_buttons">
          <button
            title="lock colour"
            class="lock ${locked ? 'lock--closed' : ''}"
            data-index="${index}"
            onclick="lockColor(event)"
          >
            <img src="./assets/open-lock.svg" role="presentation" />
            <img src="./assets/closed-lock.svg" role="presentation" />
          </button>

          <button
            title="delete colour"
            data-index="${index}"
            id="delete_button"
            onclick="deleteColor(event)"
          >
            <img src="./assets/delete-icon.svg" role="presentation" /></button
          > 
          <input
            type="color"
            value="#${code}"
            data-index="${index}"
            oninput="updateToCustomColor(event)"
            title="update color"
          />
        </div>
      </div>
    </li>
  `;
}
//function  for buttons on colors
/**
 * @param {MouseEvent} ev
 */
function copyHexcode(ev) {
  const copiedText = ev.currentTarget.dataset.color;

  navigator.clipboard.writeText(copiedText).then(
    () => {
      swal.fire(`Copied the color: ${copiedText}`);
    },
    () => {
      swal.fire('the text faild to copy ');
    }
  );
}
/**
 * @param {MouseEvent} ev
 */
function lockColor(ev) {
  const { index } = ev.currentTarget.dataset;
  colorsState[index].locked = !colorsState[index].locked;
  render(colorsState);
}
/**
 * @param {MouseEvent} ev
 */
function deleteColor(ev) {
  const index = Number(ev.currentTarget.dataset.index);
  const li = ev.currentTarget.closest('li');

  li.classList.add('removed');
  deleteFromColorState(index);
}
/**
 * @param {MouseEvent} ev
 */
function updateToCustomColor(ev) {
  const updateColor = ev.currentTarget.value;
  const currentIndex = Number(ev.currentTarget.dataset.index);
  if (colorsState[currentIndex].locked === false) {
    colorsState[currentIndex].code = updateColor.substr(1);
  }

  render(colorsState);
}
//End of function  for buttons on colors
/*drag functions*/

function dragStartHandler(ev) {
  const target = ev.currentTarget;

  ev.dataTransfer.setData('text/plain', target.dataset.index);
  ev.dataTransfer.effectAllowed = 'move';
}

function dragEnterHandler(ev) {
  ev.currentTarget.classList.add('drag_animation');
}

function dragLeaveHandler(ev) {
  ev.currentTarget.classList.remove('drag_animation');
}

function dragOverHandler(ev) {
  ev.preventDefault();
  ev.dataTransfer.dropEffect = 'move';
}

function dropHandler(ev) {
  ev.preventDefault();

  const sourceIndex = Number(ev.dataTransfer.getData('text/plain'));
  const targetIndex = ev.currentTarget.dataset.index;

  const tempColor = {
    ...colorsState[sourceIndex],
  };
  colorsState[sourceIndex] = colorsState[targetIndex];
  colorsState[targetIndex] = tempColor;
  render(colorsState);
}

function addExtraColor() {
  if (colorsState.length < 12) {
    colorsState.push({
      code: generateHexCode(),
      locked: false,
    }); //colorsState = [...colorsState, TEMP_COLOR]

    render(colorsState);
  } else {
    swal.fire(
      'you reached the maximum number of colors, Please delete a color to generate another'
    );
  }
}

function ColourList(colors) {
  const renderedColors = colors
    .map((color, index) => Colour(color, index))
    .join('');

  const extraButton = html`<li>
    <button
      class="extra_color"
      title="add extra color"
      onclick="addExtraColor()"
    >
      <img src="./assets/add.svg" alt="add icon" />
    </button>
  </li>`;

  return html`${renderedColors} ${extraButton} `;
}

function navColors(color, index) {
  const { code, locked } = color;
  return html` <li style=" background-color:#${code}">
    <button
      title="lock colour"
      class="lock ${locked ? 'lock--closed' : ''}"
      data-index="${index}"
      onclick="lockColor(event)"
    >
      <img src="./assets/open-lock.svg" role="presentation" />
      <img src="./assets/closed-lock.svg" role="presentation" />
    </button>
  </li>`;
}

function navBarList(colors) {
  const renderedNav = colors
    .map((color, index) => navColors(color, index))
    .join('');

  return renderedNav;
}

function render(colors) {
  ul.innerHTML = ColourList(colors);
  ulForNav.innerHTML = navBarList(colors);
}

const loadColors = async () => {
  const newColors = generateRandomColors();
  colorsState = newColors;
  render(colorsState);
};

//EVENTS
window.addEventListener('load', loadColors);
window.addEventListener('load', swalAlertOnReload);
window.addEventListener('scroll', hideNavOnScroll);

generateButton.addEventListener('click', loadColors);

document.addEventListener('keyup', (ev) => {
  if (ev.code === 'Enter') {
    loadColors();
  }
});
