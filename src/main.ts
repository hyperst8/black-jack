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

function handToString(hand: Card[]) {
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

function calculateTotal(hand: Card[]) {
  let handTotal = 0;
  for (let i = 0; i < hand.length; i++) {
    if (hand[i]) {
      handTotal += getValue(hand[i].rank);
    }
  }
  return handTotal;
}

async function main(whenFinished: () => void) {
  const deck = new Deck();
  shuffleDeck(deck.cards);

  const playerHand = new Array<Card | undefined>();
  const dealerHand = new Array<Card | undefined>();

  // Deal the initial cards
  playerHand.push(deck.cards.pop()!); // Player's first card
  dealerHand.push(deck.cards.pop()!); // Dealer's first card
  playerHand.push(deck.cards.pop()!); // Player's second card
  dealerHand.push(deck.cards.pop()!); // Dealer's second card

  // Calculate the initial totals
  let playerTotal = calculateTotal(playerHand);
  let dealerTotal = calculateTotal(dealerHand);

  let playing = true;
  let canHit = false;
  let dealerTurn = false;
  let determineWinner = false;
  let playAgain = false;

  console.log("Cards in deck", deck.cards.length);
  console.log("Player's hand: ", handToString(playerHand));
  console.log("Dealer's hand: ", handToString(dealerHand));

  while (playing) {
    console.log(`Your total is ${playerTotal}`);

    // Player's turn
    while (canHit) {
      // Check if the deck is empty
      if (deck.cards.length === 0) {
        console.log("No more cards in the deck.");
        break;
      }

      const card = deck.cards.pop();

      if (card) {
        // total = hand.reduce((total, card) => total + (card?.rank) || 0), 0));
        // Push the card into the playerHand array
        playerTotal += getValue(card.rank);
        playerHand.push(card);

        console.log(`Hit with ${card?.rank}${card?.Suit}.`);
        console.log(
          `Cards in your hand: ${handToString(
            playerHand
          )} and total is ${playerTotal}`
        );
      }
      break;
    }

    //Dealer's turn
    if (dealerTurn) {
      while (dealerTotal < 17) {
        const card = deck.cards.pop();

        if (card) {
          dealerTotal += getValue(card.rank);
          dealerHand.push(card);
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
      console.log("Who is the winner?");
      playAgain = true;
    }
    //   console.log(
    //     `Cards in dealer's hand: ${handToString(dealer.hand)} and total is ${
    //       dealer.total
    //     }`
    //   );

    //   if (blackJackPlayer && !blackJackDealer) {
    //     console.log("BLACK JACK! You win!");
    //   } else if (!blackJackPlayer && blackJackDealer) {
    //     console.log("BLACK JACK! Dealer wins!");
    //   } else if (dealer.total > 21) {
    //     console.log("Dealer bust! You win!");
    //   } else if (playerTotal > dealer.total) {
    //     console.log("You win!");
    //   } else if (dealer.total > playerTotal) {
    //     console.log("Dealer wins!");
    //   } else if (dealer.total > 21 && playerTotal > 21) {
    //     console.log("Busty boys! Dealer wins!");
    //   } else {
    //     console.log("It's a tie!");
    //   }

    // playAgain = true;
    //   // break;
    // }

    if (!playAgain) {
      const response = await readConsole.questionAsync("Stand, Hit (s/h) \n");

      if (response === "h") {
        canHit = true;
      } else if (response === "s") {
        dealerTurn = true;
        canHit = false;
      }
    } else {
      const response = await readConsole.questionAsync("Play again? (y/n) \n");

      if (response !== "y") {
        playing = false;
      } else {
        playing = true;
        playAgain = false;
        // Restart game
      }
    }
  }
  whenFinished();
}

main(() => {
  process.exit();
});
