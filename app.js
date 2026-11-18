const API_URL = "https://latest.currency-api.pages.dev/v1/currencies";

const form = document.querySelector("form");
const fromSelect = document.querySelector("#from");
const toSelect = document.querySelector("#to");
const amountInput = document.querySelector("#amount");
const msg = document.querySelector(".msg");

function updateFlag(select) {
  const countryCode = countryList[select.value];
  const image = select.parentElement.querySelector("img");

  if (countryCode && image) {
    image.src = `https://flagsapi.com/${countryCode}/flat/64.png`;
    image.alt = `${countryCode} flag`;
  }
}

async function updateExchangeRate() {
  const amount = amountInput.valueAsNumber;

  if (!Number.isFinite(amount) || amount < 0) {
    msg.textContent = "Enter a valid amount.";
    return;
  }

  const from = fromSelect.value.toLowerCase();
  const to = toSelect.value.toLowerCase();
  msg.textContent = "Getting exchange rate…";

  try {
    const response = await fetch(`${API_URL}/${from}.json`);
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);

    const data = await response.json();
    const rate = data[from]?.[to];

    if (typeof rate !== "number") {
      throw new Error(`No rate available for ${from.toUpperCase()} to ${to.toUpperCase()}`);
    }

    const result = new Intl.NumberFormat(undefined, {
      maximumFractionDigits: 4,
    }).format(amount * rate);

    msg.textContent = `${amount} ${from.toUpperCase()} = ${result} ${to.toUpperCase()}`;
  } catch (error) {
    console.error(error);
    msg.textContent = "Could not load the exchange rate. Check your internet connection and try again.";
  }
}

async function initializeConverter() {
  try {
    // Use the API's available rates to avoid adding unsupported currencies.
    const response = await fetch(`${API_URL}/usd.json`);
    if (!response.ok) throw new Error(`Currency list request failed: ${response.status}`);

    const data = await response.json();
    const availableCurrencies = Object.keys(data.usd).filter(
      (code) => countryList[code.toUpperCase()]
    );

    for (const select of [fromSelect, toSelect]) {
      select.replaceChildren();

      for (const code of availableCurrencies) {
        const option = document.createElement("option");
        option.value = code.toUpperCase();
        option.textContent = code.toUpperCase();
        select.append(option);
      }
    }

    fromSelect.value = "USD";
    toSelect.value = "INR";

    updateFlag(fromSelect);
    updateFlag(toSelect);
    await updateExchangeRate();
  } catch (error) {
    console.error(error);
    msg.textContent = "Could not load currencies. Check your internet connection.";
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  updateExchangeRate();
});

fromSelect.addEventListener("change", () => {
  updateFlag(fromSelect);
  updateExchangeRate();
});

toSelect.addEventListener("change", () => {
  updateFlag(toSelect);
  updateExchangeRate();
});

amountInput.addEventListener("input", updateExchangeRate);

initializeConverter();