'use strict'

class CrossWord {
  constructor(data) {
    this.data = data;
    this.wordList = [];
    this.currentWord = {
      'dir': '',
      'word': []
    };
  }

  init() {
    this.makeGrid(this.data.gridSize);
    this.data.clueList.forEach(item => this.parseJson(item));
    this.data.clueList.forEach(item => this.clueNumber(item));
    const grid = document.querySelector('#xword-grid');
    grid.addEventListener('click', e => {
      if (e.target.tagName === 'INPUT') {
        this.selectWord(Number(e.target.parentElement.getAttribute('id').replace('grid-item-', '')))
      }
    })
    grid.addEventListener('input', e => this.moveFocus(e))
    document.querySelector('#clues').addEventListener('click', e => this.selectClue(e));
    document.querySelector('#solve').addEventListener('click', e => this.solve(e));
    document.querySelector('#check').addEventListener('click', e => this.check(e));
  }

  findWord(cell) {
    /* Finds word from cell */
    let thisWord = [];
    this.wordList.forEach((word) => {
      word.forEach((letter) => {
        if (letter[1] === cell) {
          thisWord.push(word);
        }
      })
    })
    return thisWord;
  }

  solve() {
    /* Fills in grid with answers */
    if (confirm('Reveal all solutions?')) {
      this.wordList.forEach((item) => {
        item.forEach((letter) => {
          document.querySelector('#grid-item-' + letter[1]).firstElementChild.value = letter[0];
        })
      })
    }
  }

  check() {
    /* Deletes wrong letters */
    this.wordList.forEach((item) => {
      item.forEach((letter) => {
        const val = document.querySelector('#grid-item-' + letter[1]).firstElementChild;
        const ans = letter[0];
        if (val.value.toUpperCase() !== ans && val.value !== '') {
          val.value = '';    
        }
      })
    })
  }

  moveFocus(e) {
    /* Moves cursor to next cell after inserting letter */
    // Only one leter in input 
    if (e.target.value.length > 1) e.target.value = e.target.value.slice(-1);
    const span = e.target.parentElement
    const cell = Number(span.getAttribute('id').replace('grid-item-', ''));
    const diff = this.currentWord.word[1] - this.currentWord.word[0]; // Across or down?
    if (this.currentWord.word.indexOf(cell) < this.currentWord.word.length - 1) {
      document.querySelector('#grid-item-' + (cell + diff)).firstElementChild.focus();
    }
  }

  deSelect() {
    /* Reset any previously selected words or cells */
    const tmp = document.querySelectorAll('.grid-item > input')
    tmp.forEach((item) => {
      item.style.boxShadow  = 'none';
    })
  }

  clueNumber(item) {
    /* Fills in the clue numbers in first cell */
    const cell = item.y * this.data.gridSize + item.x;
    if (document.querySelector('#grid-item-' + cell).querySelector('.clueNo') === null) {
      document.querySelector('#grid-item-' + cell).innerHTML += '<span class="clueNo">' 
        + item.clueNo 
        + '</span>';
    }
  }

  selectWord(cell, dir) {
    /* Selects word in grid when clue clicked */
    this.deSelect();
    this.currentWord.word = [];
    let clue = [];
    let wordNum;
    const word = this.findWord(cell);
    // If up and down words in cell word will be 2 arrays. Cycle between them
    let tmp;
    if (word.length === 2 && (dir === 'd' || (this.currentWord.dir === 'a' && dir !== 'a'))) {
      wordNum = 1;
      tmp = 'd';
    } else {
      wordNum = 0;
      tmp = 'a';
    }
    if (dir === undefined) {
      this.currentWord.dir = tmp;
    } else {
      this.currentWord.dir = dir;
    }
    word[wordNum].forEach((letter) => {
      document.querySelector('#grid-item-' + letter[1]).firstElementChild.style.boxShadow = '0 0 7px 7px #dddddd inset';
      this.currentWord.word.push(letter[1]);
      clue.push(letter[0]);
    })
    // Puts clue in curentClue div
    clue = clue.join('');
    this.data.clueList.forEach((item) => {
      if (item.solution === clue) {
        document.querySelector('#currentClue').innerHTML = item.clueNo + item.dir + ': ' + item.clue;
      }
    })
  }

  selectClue(e) {
    /* Returns first cell of word when user clicks clue list */
    let id = e.target.getAttribute('id').split('');
    const dir = id.pop();
    id = Number(id.join(''));
    //this.data.clueList.forEach((item) => 
    const item = this.data.clueList;
    let i = 0;
    do {
      const cell = item[i].y * this.data.gridSize + item[i].x;
      this.selectWord(cell, dir);
      document.querySelector('#grid-item-' + cell).firstElementChild.focus();
      i++;
    }
    while (item[i-1].clueNo !== id || item[i-1].dir !== dir)
  }

  makeGrid(gridSize) {
    /* Creates blank grid */
    document.querySelector('#xword-grid').style.gridTemplate += 'repeat(' 
      + gridSize 
      + ', 1fr)/repeat('
      + gridSize + ', 1fr)';
    for (let i = 0; i < gridSize ** 2 ; i++) {
      document.querySelector('#xword-grid').innerHTML += 
        '<span class="grid-item" id="grid-item-'
        + i 
        + '"></span>'
    }
  }

  parseJson(item) {
    /* Fills in grid with input elements and creates clue list */
    let word = [];
    const clue = document.querySelector('#clue-list');
    clue.innerHTML += 
      '<li id="' + item.clueNo + item.dir + '">' 
      + '<span class="bold">' 
      + item.clueNo 
      + item.dir
      + ': </span>' 
      + item.clue 
      + ' (' 
      + item.solution.length 
      + ')</li>';  

    for (let i = 0; i < item.solution.length; i++) {
      /* Iterates through solution putting input element in cell */
      if (item.dir === 'a') {
        document.querySelector('#grid-item-' 
          + (item.y * this.data.gridSize 
            + item.x 
            + i))
          .innerHTML = '<input type="text" size="1">';
        word.push([item.solution[i], (item.y * this.data.gridSize 
          + item.x + i )]);

      } else {
        document.querySelector('#grid-item-' 
          + (item.y * this.data.gridSize 
            + item.x 
            + (i * this.data.gridSize)))
          .innerHTML = '<input type="text" size="1">'
        word.push([item.solution[i], (item.y * this.data.gridSize 
          + item.x 
          + (i * this.data.gridSize))]);
      }
    }
    this.wordList.push(word);
  }
}

window.onload = () => {
  const data = JSON.parse(document.getElementById('data').textContent);
  let crossWord = new CrossWord(data);
  crossWord.init()
}
