import readline from "readline-promise";
import { Card } from "./card";
import { Deck } from "./deck";
const readConsole = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true,
});

// Get card.rank and convert to number value
function getValue(card: string) {
  if (card === "A") {
    return 11;
  } else if (card === "J" || card === "Q" || card === "K") {
    return 10;
  } else {
    return parseInt(card);
  }
}

function shuffleDeck(deck: any[]) {
  // Create a new deck with all 52 cards
  const newDeck = new Deck().cards;

  for (let i = 0; i < newDeck.length; i++) {
    let j = Math.floor(Math.random() * newDeck.length); // (0-1) * 52 => (0-51.9999)
    // let temp = newDeck[i];
    // newDeck[i] = newDeck[j];
    // newDeck[j] = temp;
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]]; // Swap elements
  }

  // Replace the old deck with the shuffled new deck
  deck.length = 0;
  deck.push(...newDeck);
}

export function handToString(hand: Card[]) {
  let stringHand = "";
  for (let i = 0; i < hand.length; i++) {
    if (hand[i]) {
      stringHand += `${hand[i].rank}${hand[i].Suit}, `;
    }
  }
  // Remove the trailing comma and space
  stringHand = stringHand.slice(0, -2);
  return stringHand;
}

export function calculateTotal(hand: Card[]) {
  let handTotal = 0;
  let hasAce = 0;
  for (let i = 0; i < hand.length; i++) {
    if (hand[i]) {
      handTotal += getValue(hand[i].rank);
      if (hand[i].rank === "A") {
        hasAce += 1;
      }
    }
  }
  // Check if two cards in hand and total is 21 then return 0, which means Black Jack
  if (hand.length === 2 && handTotal === 21) {
    return 0;
  }

  // Loop through number of aces and reduce times 10 if total is over 21
  if (hasAce > 0 && handTotal > 21) {
    handTotal -= hasAce * 10;
  }

  return handTotal;
}

function whoWins(playerScore: number, dealerScore: number) {
  if (playerScore === dealerScore) {
    console.log("It's a draw");
  } else if (dealerScore === 0) {
    console.log("You lose. Dealer has Black Jack");
  } else if (playerScore === 0) {
    console.log("You win with Black Jack");
  } else if (playerScore > 21) {
    console.log("Bust. You lose");
  } else if (dealerScore > 21) {
    console.log("Dealer bust.You win");
  } else if (playerScore > dealerScore) {
    console.log("You win");
  } else {
    console.log("You lose");
  }
}

async function main(whenFinished: () => void) {
  const deck = new Deck();
  shuffleDeck(deck.cards);

  const playerHand = new Array<Card | undefined>();
  const dealerHand = new Array<Card | undefined>();

  // Deal the initial cards
  playerHand.push(deck.cards.pop()!);
  dealerHand.push(deck.cards.pop()!);
  playerHand.push(deck.cards.pop()!);

  // Calculate the initial totals
  let playerTotal = calculateTotal(playerHand);
  let dealerTotal = calculateTotal(dealerHand);

  let playing = true;
  let canHit = false;
  let playertTurn = true;
  let dealerTurn = false;
  let determineWinner = false;
  let playAgain = false;

  console.log("Cards in deck", deck.cards.length);
  console.log("Player's hand: ", handToString(playerHand));
  console.log("Dealer's hand: ", handToString(dealerHand));

  while (playing) {
    console.log(`Your total is ${playerTotal}`);
    if (playerTotal === 0) {
      playertTurn = false;
      dealerTurn = true;
    }

    // Player's turn
    if (playertTurn) {
      while (canHit) {
        const card = deck.cards.pop();

        if (card) {
          // total = hand.reduce((total, card) => total + (card?.rank) || 0), 0));
          // Push the card into the playerHand array
          // playerTotal += getValue(card.rank);
          playerHand.push(card);
          playerTotal = calculateTotal(playerHand);

          console.log(`Hit with ${card?.rank}${card?.Suit}.`);
          console.log(
            `Cards in your hand: ${handToString(
              playerHand
            )} and total is ${playerTotal}`
          );

          if (playerTotal > 21) {
            canHit = false;
            playertTurn = false;
            determineWinner = true;
          }
        }
        canHit = false;
      }
    }

    //Dealer's turn
    if (dealerTurn) {
      if (dealerTotal === 0) {
        dealerTurn = false;
        determineWinner = true;
      }

      while (dealerTotal > 0 && dealerTotal < 17) {
        const card = deck.cards.pop();

        if (card) {
          // dealerTotal += getValue(card.rank);
          dealerHand.push(card);
          dealerTotal = calculateTotal(dealerHand);
          console.log(
            `Cards in dealer's hand: ${handToString(
              dealerHand
            )} and total is ${dealerTotal}`
          );
        }
        dealerTurn = false;
        determineWinner = true;
      }
    }

    // Determine the winner
    if (determineWinner) {
      whoWins(playerTotal, dealerTotal);
      playAgain = true;
    }

    if (playertTurn) {
      const response = await readConsole.questionAsync("Stand, Hit (s/h) \n");

      if (response === "h") {
        canHit = true;
      } else if (response === "s") {
        canHit = false;
        playertTurn = false;
        dealerTurn = true;
      }
    }
    if (playAgain) {
      const response = await readConsole.questionAsync("Play again? (y/n) \n");

      if (response !== "y") {
        playing = false;
        console.clear();
      } else {
        // Restart game
        console.clear();
        main(whenFinished);
      }
    }
  }
  whenFinished();
}

main(() => {
  process.exit();
});
