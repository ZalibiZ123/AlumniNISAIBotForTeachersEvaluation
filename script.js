const rowsContainer = document.getElementById('rows-container');
const addRowBtn = document.getElementById('add-row-btn');
const sendBtn = document.getElementById('send-btn');
const responseBox = document.getElementById('response');

function createInput(placeholder) {
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = placeholder;
  input.required = true;
  input.addEventListener('input', updateSendButtonState);
  return input;
}

function createRow() {
  const row = document.createElement('div');
  row.className = 'input-row';

  const inputA = createInput('Value 1');
  const inputB = createInput('Value 2');
  const inputC = createInput('Value 3');

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'icon-btn remove';
  removeBtn.textContent = '×';
  removeBtn.addEventListener('click', () => {
    rowsContainer.removeChild(row);
    updateSendButtonState();
  });

  row.append(inputA, inputB, inputC, removeBtn);
  rowsContainer.appendChild(row);

  updateSendButtonState();
}

function getAllInputs() {
  return Array.from(rowsContainer.querySelectorAll('input[type="text"]'));
}

function updateSendButtonState() {
  const inputs = getAllInputs();
  const hasRows = rowsContainer.children.length > 0;
  const allFilled = inputs.every((input) => input.value.trim().length > 0);
  sendBtn.disabled = !(hasRows && allFilled);
}

async function handleSubmit(event) {
  event.preventDefault();
  if (sendBtn.disabled) return;

  const rows = Array.from(rowsContainer.children).map((row) => {
    const inputs = row.querySelectorAll('input');
    return Array.from(inputs).map((input) => input.value.trim());
  });

  try {
    sendBtn.disabled = true;
    sendBtn.textContent = 'Sending...';
    responseBox.textContent = '';

    const res = await fetch('/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rows),
    });

    if (!res.ok) {
      throw new Error(`Request failed with status ${res.status}`);
    }

    const data = await res.json();
    responseBox.textContent = data?.result || 'No response received.';
  } catch (error) {
    console.error(error);
    responseBox.textContent = `Error: ${error.message}`;
  } finally {
    sendBtn.textContent = 'Send';
    updateSendButtonState();
  }
}

addRowBtn.addEventListener('click', createRow);
document
  .getElementById('dynamic-form')
  .addEventListener('submit', handleSubmit);

// Initialize with one row
createRow();

