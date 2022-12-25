// CONSTANTS
const MAX_HEX_VALUE = parseInt("FFFFFF", 16);
const TEMP_COLOR = {
  code: "000",
  locked: false,
};

const hexacodes = document.querySelectorAll(".hexacode");
const generateButton = document.querySelector(".generate_button");
const ul = document.querySelector("#display-colors");
const ulForNav = document.querySelector("#mobile-view");
const navBar = document.getElementById("nav");
const html = String.raw;
let lastScrollTop = 0;

const fr = " 1fr";
let grid = "auto-flow /";
let gridColumnNumber;

// UTILITIES
function generateHexCode() {
  const letters = "0123456789ABCDEF";
  let color = "";
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
  const tempState = colorsState.filter((_, index) => {
    return deletedIndex !== index;
  });

  colorsState = tempState;
}

function renderOnTransitionEnd() {
  render(colorsState);
}

function hideNavOnScroll() {
  let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  if (scrollTop > lastScrollTop) {
    navBar.style.top = "-300px";
  } else {
    navBar.style.top = "10px";
  }
  lastScrollTop = scrollTop;
}
function deleteFromNav() {
  gridColumnNumber = occurrences(grid, "1fr");
  if (gridColumnNumber > colorsState.length) {
    grid = grid.slice(0, -4);
    ulForNav.style.grid = grid;
  }
}

/** Function that count occurrences of a substring in a string;
 * @param {String} string               The string
 * @param {String} subString            The sub string to search for
 * @param {Boolean} [allowOverlapping]  Optional. (Default:false)
 *
 * @author Vitim.us https://gist.github.com/victornpb/7736865
 * @see Unit Test https://jsfiddle.net/Victornpb/5axuh96u/
 * @see https://stackoverflow.com/a/7924240/938822
 */
function occurrences(string, subString, allowOverlapping) {
  string += "";
  subString += "";
  if (subString.length <= 0) return string.length + 1;

  var n = 0,
    pos = 0,
    step = allowOverlapping ? 1 : subString.length;

  while (true) {
    pos = string.indexOf(subString, pos);
    if (pos >= 0) {
      ++n;
      pos += step;
    } else break;
  }
  return n;
}

// CORE/LIB
let colorsState = [];

async function swalAlertOnReload() {
  const { value } = await Swal.fire({
    title: "Welcome",
    input: "number",
    inputPlaceholder: "Select a number of colors",
    confirmButtonText: "Generate",
    inputValidator: (value) => {
      if (!value || Number(value) < 1) {
        return "You need to choose a positive value!";
      } else if (Number(value) > 12) {
        return "You need to choose a number below 13";
      }
    },
  });

  const colorsNumber = Number(value);

  swal
    .fire({
      title: `Are you sure you want to generate ${colorsNumber} colors?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
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
    } else {
      return {
        code: generateHexCode(),
        locked: false,
      };
    }
  });
}

function Colour(color, index) {
  const { code, locked } = color;

  return html`
    <li class="item1" ontransitionend="renderOnTransitionEnd()">
      <div class="container">
        <button
          title="copy colour"
          onclick="copyHexcode(this)"
          data-color="#${code}"
        >
          <div class="color" style="background:#${code}"></div>
        </button>
        <button
          title="copy colour"
          class="hexacode"
          onclick="copyHexcode(this)"
          data-color="#${code}"
        >
          <p class="color_hexcode">#${code}</p>
        </button>
      </div>
      <div class="function_buttons">
        <button
          title="lock colour"
          class="lock ${locked ? "lock--closed" : ""}"
          data-index="${index}"
          onclick="lockColor(event)"
        >
          <img src="open-lock.svg" role="presentation" />
          <img src="closed-lock.svg" role="presentation" />
        </button>

        <button
          title="delete colour"
          data-index="${index}"
          id="delete_button"
          onclick="deleteColor(event)"
        >
          <img src="delete-icon.svg" role="presentation" />
        </button>

         <input
          type="color"
          value="#${code}"
          data-index="${index}"
          oninput="updateToCustomColor(event)"
          title="update color"
        />
      </div>
    </li>
  `;
}

function ColourList(colors) {
  const renderedColors = colors
    .map((color, index) => {
      return Colour(color, index);
    })
    .join("");

  const extraButton = html`<li>
    <button
      class="extra_color"
      title="add extra color"
      onclick="addExtraColor()"
    >
      <img src="add.svg" alt="add icon" />
    </button>
  </li>`;

  return html`${renderedColors} ${extraButton} `;
}

function navColors(color, index) {
  const { code, locked } = color;
  return html` <li style=" background-color:#${code}">
    <button
      title="lock colour"
      class="lock ${locked ? "lock--closed" : ""}"
      data-index="${index}"
      onclick="lockColor(event)"
    >
      <img src="open-lock.svg" role="presentation" />
      <img src="closed-lock.svg" role="presentation" />
    </button>
  </li>`;
}

function navBarList(colors) {
  const renderedNav = colors
    .map((color, index) => {
      return navColors(color, index);
    })
    .join("");

  for (let i = 0; i < colorsState.length; i++) {
    gridColumnNumber = occurrences(grid, "1fr");
    if (
      gridColumnNumber < 4 &&
      gridColumnNumber <= colorsState.length &&
      i >= gridColumnNumber
    ) {
      grid += fr;
      ulForNav.style.grid = grid;
    }
    if (i > 4) {
      break;
    }
  } 
 

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

// function  for buttons on colors
/**
 * @param {MouseEvent} ev
 */
function lockColor(ev) {
  const { index } = ev.currentTarget.dataset;
  colorsState[index].locked = !colorsState[index].locked;
  render(colorsState);
}

function deleteColor(ev) {
  const index = Number(ev.currentTarget.dataset.index);
  const li = ev.currentTarget.closest("li");

  li.classList.add("removed");
  deleteFromColorState(index);
  deleteFromNav();
}

function updateToCustomColor(ev) {
  const updateColor = ev.currentTarget.value;
  const currentIndex = Number(ev.currentTarget.dataset.index);
  if (colorsState[currentIndex].locked === false) {
    colorsState[currentIndex].code = updateColor.substr(1);
  }

  render(colorsState);
}

/**
 * @param {MouseEvent} ev
 */
function copyHexcode(element) {
  const copiedText = element.dataset.color;

  navigator.clipboard.writeText(copiedText).then(
    () => {
      swal.fire("Copied the color: " + copiedText);
    },
    () => {
      swal.fire("the text faild to copy ");
    }
  );
}

function addExtraColor() {
  if (colorsState.length < 12) {
    colorsState.push({
      code: generateHexCode(),
      locked: false,
    }); // colorsState = [...colorsState, TEMP_COLOR]

    render(colorsState);
  } else {
    swal.fire(
      "you reached the maximum number of colors, Please delete a color to generate another"
    );
  }
}

// EVENTS
window.addEventListener("load", loadColors);
window.addEventListener("load", swalAlertOnReload);
window.addEventListener("scroll", hideNavOnScroll);

generateButton.addEventListener("click", loadColors);

document.addEventListener("keyup", (ev) => {
  if (ev.code === "Enter") {
    loadColors();
  }
});
