const hexacodes = document.querySelectorAll(".hexacode");
const generateButton = document.querySelector(".generate_button");
const ul = document.querySelector("#display-colors");
const html = String.raw;

let lockChecker = "open";
let lockObject = [];
/**
 * @param {MouseEvent} ev
 */
function changeImgSource(ul) {
  ul.currentTarget.classList.toggle("lock--closed");
}

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

const fetchColors = async () => {
  try {
    const response = await fetch("http://colormind.io/api/", {
      method: "POST",
      mode: "cors",
      body: JSON.stringify({ model: "default" }),
    });

    if (!response.ok) throw Error("Can't get the response");
    const data = await response.json();

    return data.result;
  } catch (err) {
    console.error(err);
  }
};

const loadColors = async () => {
  const fetchedColors = await fetchColors();

  //return colors in hexacodes
  let colorCodes = fetchedColors.map((color) => {
    let colorsPaletteCodes = color
      .map((specificColor) => {
        return specificColor.toString(16).padStart(2, "0");
      })
      .join("");

    return colorsPaletteCodes;
  });

  const renderedColors = colorCodes
    .map((code) => {
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
            title="copy colour"
            class="lock"
            data-lock="open"
            onclick="changeImgSource(event)"
          >
            <img src="open-lock.svg" role="presentation" class="active_img" />
            <img src="closed-lock.svg" role="presentation" class="active_img" />
          </button>
        </li>
      `;
    })
    .join("");
  ul.innerHTML = renderedColors;
};

generateButton.addEventListener("click", loadColors);
window.addEventListener("load", loadColors);

document.addEventListener("keyup", (ev) => {
  if (ev.code === "Space") {
    loadColors();
    console.log("Space pressed");
  }
});
