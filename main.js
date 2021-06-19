const Symbols = [
  'https://image.flaticon.com/icons/svg/105/105223.svg', // 黑桃
  'https://image.flaticon.com/icons/svg/105/105220.svg', // 愛心
  'https://image.flaticon.com/icons/svg/105/105212.svg', // 方塊
  'https://image.flaticon.com/icons/svg/105/105219.svg' // 梅花
]

const GAME_STATE = {
  FirstCardAwaits: 'FirstCardAwaits',
  SecondCardAwaits: 'SecondCardAwaits',
  CardsMatchFailed: 'CardsMatchFailed',
  CardsMatched: 'CardsMatched',
  GameFinished: 'GameFinished'
}


const view = {
  displayCards(indexes) {
    const rootElement = document.querySelector('#cards')
    // join將52個卡片的陣列轉成字串，因為innerHTML只吃字串不吃陣列
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join('')
  },
  getCardElement(index) {
    return `
      <div data-index="${index}" class="card back">
      </div>`
  },
  flipCards(...cards) {
    cards.map(card => {
      // 如果是背面
      if (card.classList.contains('back')) {
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(card.dataset.index)
        return
      }
      // 回傳正面(牌面內容)
      //如果是正面
      card.classList.add('back')
      card.innerHTML = null
      // 回傳背面
    })
  },
  getCardContent(index) {
    // 餘數不能大於除數，所以餘數的最大值就是除數-1
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]
    return `<p>${number}</p>
        <img src="${symbol}" />
        <p>${number}</p>`
  },
  transformNumber(number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },
  paired(...cards) {
    cards.map(card => {
      card.classList.add('paired')
    })
  },
  renderScore(score) {
    document.getElementById('score').innerText = `score: ${score}`
  },
  renderTriedTimes(times) {
    document.getElementById('tried').innerText = `you've tried: ${times} times`
  },
  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add("wrong")
      card.addEventListener('animationend', e => {
        e.target.classList.remove("wrong")
      }, { once: true })
    })
  },
  appendAddScoreAnimation() {
    const scoreBoard = document.getElementById('score')
    scoreBoard.classList.add("add-score")
    scoreBoard.addEventListener('animationend', e => {
      e.target.classList.remove('add-score')
    })
  },
  appendTriedAnimation() {
    const triedBoard = document.getElementById('tried')
    triedBoard.classList.add('triedTimes')
    triedBoard.addEventListener('animationend', e => {
      triedBoard.classList.remove('triedTimes')
    })
  },
  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `<p>Win</p>
  <p>你的分數：${model.score}分 翻牌次數：${model.triedTimes}</p>
  <img id="turtle" src="https://image.flaticon.com/icons/png/512/3077/3077443.png" alt="turtle">
  <img id="fish" src="https://image.flaticon.com/icons/png/512/3050/3050583.png" alt="fish">
  <img class="
coral-reef 1" src="https://image.flaticon.com/icons/png/512/2739/2739347.png" alt="coral-reef">`
    const header = document.querySelector('#header')
    header.before(div)
  },
}

const model = {
  score: 0,
  triedTimes: 0,
  revealedCards: [],
  isRevealedCardsMatched() {
    // 比對數字是否一樣
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  }
}
const controller = {
  currentState: GAME_STATE.FirstCardAwaits,
  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },
  dispatchCardAction(card) {
    if (!card.classList.contains('back')) {
      return
    }
    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break
      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(model.triedTimes += 1)
        view.flipCards(card)
        model.revealedCards.push(card)
        // 判斷配對是否成功
        if (model.isRevealedCardsMatched()) {
          //如果配對成功
          //卡片維持翻面狀態(paired樣式)
          view.renderScore(model.score += 10)
          view.appendAddScoreAnimation()
          this.currentState = GAME_STATE.CardsMatched
          view.paired(...model.revealedCards)
          model.revealedCards = []
          this.currentState = GAME_STATE.FirstCardAwaits
          if (model.score === 260) {
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
            return
          }
        } else {
          this.currentState = GAME_STATE.CardsMatchFailed
          view.appendTriedAnimation()
          // 配對失敗
          view.appendWrongAnimation(...model.revealedCards)
          setTimeout(
            this.resetCards
            , 1000)
        }
        break
    }
  },
  resetCards() {
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  },
}
const utility = {
  getRandomNumberArray(count) {
    // 要被隨機排列的陣列
    const number = Array.from(Array(count).keys())
    // 洗牌演算法，最後一張卡牌都會隨機跟前面的某張交換，迭代的次數根據陣列長度，讓每張卡都被換到
    for (let index = number.length - 1; index > 0; index--) {
      //交換的對象也可能是他自己 +1
      let random = Math.floor(Math.random() * (index + 1));[number[index], number[random]] = [number[random], number[index]]
    }
    return number
  }
}
controller.generateCards()
// 監聽器掛住卡片，所以監聽器的宣告一定要在卡片出來之後，否則會未定義
const card = document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', e => {
    controller.dispatchCardAction(card)
  })
})




// dispatchCardAction(card) {
//   if (!card.classList.contains('back')) {
//     return
//   }
//   switch (this.currentState) {
//     case GAME_STATE.FirstCardAwaits:
//       view.flipCards(card)
//       model.revealedCards.push(card)
//       this.currentState = GAME_STATE.SecondCardAwaits
//       break
//     case GAME_STATE.SecondCardAwaits:
//       view.renderTriedTimes(model.triedTimes += 1)
//       view.flipCards(card)
//       model.revealedCards.push(card)
//       // 判斷配對是否成功
//       if (model.isRevealedCardsMatched()) {
//         this.currentState = GAME_STATE.CardsMatched
//       } else {
//         this.currentState = GAME_STATE.CardsMatchFailed
//       }
//       break
//   }
//   switch (this.currentState) {
//     case GAME_STATE.CardsMatched:
//       view.renderScore(model.score += 10)
//       view.paired(...model.revealedCards)
//       model.revealedCards = []
//       this.currentState = GAME_STATE.FirstCardAwaits
//       break
//     case GAME_STATE.CardsMatchFailed:
//       setTimeout(
//         this.resetCards
//         , 1000)
//       break
//   }
//   console.log('this.currentState', this.currentState)
// },


// 隨機產生一組數字陣列
// 將數字陣列傳入產生器
// const totalCardNum = []
// function generateTotalNum() {
//   let randomNum = Math.floor(Math.random() * totoalCards)
//   while (!totalCardNum.length === totoalCards) {
//     randomNum = Math.floor(Math.random() * totoalCards)
//     if (!totalCardNum.some(cardNum => cardNum === randomNum)) {
//       totalCardNum.push(num)
//     }
//   }
//   console.log(totalCardNum)
// }

// 隨機產生數字
// 檢查是否重複
// 把數字推到陣列裡面
// 將傳入getCardElement()