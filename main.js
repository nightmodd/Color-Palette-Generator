const hexacodes = document.querySelectorAll(".hexacode");
const generateButton = document.querySelector(".generate_button");
const ul = document.querySelector("#display-colors");
const html = String.raw;

let colorsState = [
  {
    code: "#000",
    locked: false,
  },
  {
    code: "#000",
    locked: false,
  },
  {
    code: "#000",
    locked: false,
  },
  {
    code: "#000",
    locked: false,
  },
  {
    code: "#000",
    locked: false,
  },
];

// let blockedColorRGB = [];
// let fetchedColorsRGB = [];

// /**
//  * @param {MouseEvent} ev
//  */
// function lockColor(ev) {
//   // ev.currentTarget.classList.toggle("lock--closed");

//   const { index } = ev.currentTarget.dataset;
//   const numberIndex = Number(index);
//   colorsState[numberIndex].locked = !colorsState[numberIndex].locked;

//   if (colorsState[numberIndex].locked) {
//      let colorObj = {
//        color: fetchedColorsRGB[numberIndex],
//        index: numberIndex,
//      };
//      blockedColorRGB.push(colorObj);
//   } else {
//     //bug doesnot delete after remove lock
//     blockedColorRGB.splice(numberIndex, 1);
//   }

//   render(colorsState);
// }
// function createRequestFilter() {
//   let obj = [];
//   for (let i = 0; i < 5; i++) {
//     if (blockedColorIndex.includes(i)) {
//       blockedColorRGB.forEach((colorObj) => {
//         if (colorObj.index === i) {
//           obj.push(colorObj.color);
//         }
//       });
//     } else {
//       obj.push("N");
//     }
//   }
//   return obj;
// }

/**
 * @param {MouseEvent} ev
 */
function lockColor(ev) {
  const { index } = ev.currentTarget.dataset;
  colorsState[index].locked = !colorsState[index].locked;

  render(colorsState);
}

/**
 * @param {string} code
 */
function mapHexToRGB(code) {
  const [, red, blue, green] = code.match(
    /([0-9a-z]{2})([0-9a-f]{2})([0-9a-z]{2})/i
  );

  return [parseInt(red, 16), parseInt(blue, 16), parseInt(green, 16)];
}

// Maps colorState -> [rgb, rgb, N, N, N]
function createRequestFilter() {
  return colorsState.map((color) => {
    if (color.locked) return mapHexToRGB(color.code);
    else return "N";
  });
}

// function to map colors array to hex array only and "N" -> []
const fetchColors = async () => {
  try {
    const object = createRequestFilter();
    const response = await fetch("http://colormind.io/api/", {
      method: "POST",
      mode: "cors",
      body: JSON.stringify({
        input: object,
        model: "default",
      }),
    });

    if (!response.ok) throw Error("Can't get the response");
    const data = await response.json();

    return data.result;
  } catch (err) {
    console.error(err);
  }
};

function mapColorResponseToState(fetchedColors) {
  fetchedColorsRGB = fetchedColors;

  let colorCodes = fetchedColors.map((colors) => {
    let colorsPaletteCodes = colors
      .map((specificColor) => {
        return specificColor.toString(16).padStart(2, "0");
      })
      .join("");

    return colorsPaletteCodes;
  });

  const newState = colorCodes.map((code, index) => ({
    code, // colors[index].locked? colors[index].code: code
    locked: colorsState[index] ? colorsState[index].locked : false,
  }));

  return newState;
}
function render(colors) {
  const renderedColors = colors
    .map((color, index) => {
      const { code, locked } = color;

      return html`
        <li class="item1">
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

          <button
            title="lock colour"
            class="lock ${locked ? "lock--closed" : ""}"
            data-index="${index}"
            onclick="lockColor(event)"
          >
            <img src="open-lock.svg" role="presentation" class="active_img" />
            <img src="closed-lock.svg" role="presentation" class="active_img" />
          </button>
        </li>
      `;
    })
    .join("");

  ul.innerHTML = renderedColors;
}

const loadColors = async () => {
  const fetchedColors = await fetchColors();

  //return colors in hexacodes
  const newColors = mapColorResponseToState(fetchedColors);
  colorsState = newColors;
  render(colorsState);
};

/**
 * @param {MouseEvent} ev
 */

function copyHexcode(element) {
  const copiedText = element.dataset.color;

  navigator.clipboard.writeText(copiedText).then(
    () => {
      alert("Copied the text: " + copiedText);
    },
    () => {
      alert("the text faild to copy ");
    }
  );
}

document.addEventListener("keyup", (ev) => {
  if (ev.code === "Space") {
    loadColors();
    console.log("Space pressed");
  }
});

generateButton.addEventListener("click", loadColors);
window.addEventListener("load", loadColors);
