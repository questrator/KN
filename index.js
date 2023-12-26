const settings = {
    rows: 6,
    cols: 6,
    winSeq: 3,
    players: 2    
};
const x = `(\\(\\d+\\)){${settings.winSeq},}`;
const matchSeq = new RegExp(x, "g");

const fieldBlock = document.querySelector(".field");
fieldBlock.style.gridTemplateColumns = `repeat(${settings.cols}, 1fr)`;
fieldBlock.style.gridTemplateRows = `repeat(${settings.rows}, 1fr)`;
fieldBlock.addEventListener("click", clickField);

const totalCells = settings.cols * settings.rows;
const playerField = {col: {}, row: {}, ad: {}, dd: {}};
const field = {empty: totalCells, player: 0, win: false, draw: false};

for (let i = 0; i < totalCells; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.id = i;
    cell.dataset.col = i % settings.cols;
    cell.dataset.row = Math.floor(i / settings.cols);
    cell.dataset.dd = settings.rows + (i % settings.cols) - (Math.floor(i / settings.cols)) - 1;
    cell.dataset.ad = i % settings.cols + Math.floor(i / settings.cols);
    cell.dataset.selected = 0;
    cell.dataset.player = "";
    fieldBlock.insertAdjacentElement("beforeend", cell);

    ["col", "row", "ad", "dd"].forEach(e => {
        playerField[e][cell.dataset[e]] ||= [];
        playerField[e][cell.dataset[e]].push(i);
    });
}

for (let i = 0; i < settings.players; i++) {
    field[i] = JSON.parse(JSON.stringify(playerField));
}

function clickField(event) {
    const cell = event.target.dataset;
    if (!cell.id) return;
    if (cell.selected == 0) {        
        cell.selected = 1;
        cell.player = field.player;

        field.empty--;
        ["col", "row", "ad", "dd"].map(e => field[field.player][e][cell[e]])
        .forEach(e => e[e.indexOf(+cell.id)] = `(${e[e.indexOf(+cell.id)]})`);

        field.win = checkWinSeq(event.target.dataset);
        if (field.win) {
            console.log(field.player, "wins")
            fieldBlock.removeEventListener("click", clickField);
        }
        else if (field.empty === 0) {
            field.draw = true;
            fieldBlock.removeEventListener("click", clickField);
            console.log("draw");
        }
        else changePlayer();
    }
    console.log(field)
}

function changePlayer() {
    if (field.player >= settings.players - 1) field.player = 0;
    else field.player++;
}

function checkWinSeq(cell) {
    if (field.empty > totalCells - (settings.winSeq - 1) * settings.players) return false;
    return ["col", "row", "ad", "dd"].map(e => field[field.player][e][cell[e]])
    .map(e => {
        const match = e.join("").match(matchSeq);
        if (match != null) {
            const line = match[0].replaceAll(")(", "-").slice(1,-1).split("-");
            console.log(line);
            mark(line);
        }
        return matchSeq.test(e.join(""));
    }).some(e => e === true);
}

function mark(line) {
    const cells = line.map(e => document.querySelector(`.cell[data-id="${e}"]`)).forEach(e => {
        e.classList.add("win-line");
    });
    console.log(cells);
}