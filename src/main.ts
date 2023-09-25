import readline from "readline-promise";
import { Card } from "./card";
import { Deck } from "./deck";
const readConsole = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true,
});

class Dealer {
  public hand: Card[] = [];
  public total: number = 0;
}

// Get card.rank and convert to number value 
function getValue(card: string, currentTotal: number) {

    if (card === "A") {
      return currentTotal + 11 <= 21 ? 11 : 1;
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
      stringHand += `${hand[i].rank}${hand[i].Suit}, `
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
      handTotal += getValue(hand[i].rank, handTotal)
    }
  }
  return handTotal;
}

function countAces(hand: Card[]) {
  let aceTotal = 0;
  for (let i = 0; i < hand.length; i++) {
    if (hand[i] && hand[i].rank === "A") {
      aceTotal++;
    }
    // Do I need to exit the loop when a non-Ace card is encountered?
    // else {
    //   break;
    // }
  }
  return aceTotal;
}

// Check number of aces in hand and reduce for best score possible
function reduceAce(total: number, totalAce: number) {
  while (total > 21 && totalAce > 0) {
    total -= 10;
    totalAce -= 1;
  }
  return total;
}

async function main(whenFinished: () => void) {
  const deck = new Deck();
  shuffleDeck(deck.cards);
  
  const playerHand = new Array<Card | undefined>();
  const dealer = new Dealer();

  // Deal the initial cards
  playerHand.push(deck.cards.pop()!); // Player's first card
  dealer.hand.push(deck.cards.pop()!); // Dealer's first card
  playerHand.push(deck.cards.pop()!); // Player's second card

  // Calculate the initial totals
  let playerTotal = calculateTotal(playerHand);
  let playerAceCount = countAces(playerHand);
  let dealerAceCount = countAces(dealer.hand);

  let playing = true;
  let canHit = false;
  let dealerTurn = false;
  let determineWinner = false;
  let blackJackPlayer = false;
  let blackJackDealer = false;
  let playAgain = false;

  function restartGame () {
    // Reset game state for a new round
    playerHand.length = 0;
    dealer.hand.length = 0;
    dealer.total = 0;
    playerAceCount = 0;
    dealerAceCount = 0;
    playing = true;
    canHit = false;
    dealerTurn = false;
    determineWinner = false;
    playAgain = false;
    blackJackPlayer = false;
    blackJackDealer = false;
    
    shuffleDeck(deck.cards);
    
    playerHand.push(deck.cards.pop()!);
    dealer.hand.push(deck.cards.pop()!);
    playerHand.push(deck.cards.pop()!);

    playerTotal = calculateTotal(playerHand);
    console.log("Cards in deck RESET",deck.cards.length)
    console.log("Player's hand: ", handToString(playerHand));
    console.log("Dealer's hand: ", handToString([dealer.hand[0]]));
}
  console.log("Cards in deck",deck.cards.length)
  console.log("Player's hand: ", handToString(playerHand));
  console.log("Dealer's hand: ", handToString([dealer.hand[0]]));
  
  
  while (playing) {

    console.log(`Your total is ${playerTotal}`);

    // Check if player has Black Jack
    if (handToString(playerHand).includes("A") && playerTotal === 21) {
      blackJackPlayer = true;
      canHit = false;
      dealerTurn = true;
    }
    
    // Player's turn
    while (canHit) {

      // Check if the deck is empty
      if (deck.cards.length === 0) {
        console.log("No more cards in the deck.");
        break;
      }

      const card = deck.cards.pop();
      
      if (card) {
        
        // Check number of aces in hand and reduce for best score possible
        if ((card.rank === "A" && playerTotal > 21) || (card.rank !== "A" && playerTotal > 21)) {
          playerTotal += reduceAce(playerTotal, playerAceCount);
        } else {
          playerTotal += getValue(card.rank, playerTotal);
        }

        
        // total = hand.reduce((total, card) => total + (card?.rank) || 0), 0));
        // Push the card into the playerHand array
        playerHand.push(card);
        console.log(`Hit with ${card?.rank}${card?.Suit}.`);
        console.log(`Cards in your hand: ${handToString(playerHand)} and total is ${playerTotal}`)
      }

      // Check if the player's total is less than or equal 21 or they choose to stand
      if ( playerTotal <= 21 && !canHit) {
        dealerTurn = true;
        // break;
      }

      break;
    }

    // Check if the player's total is greater than 21 (bust)
    if (playerTotal > 21) {
      console.log("Bust! You lose");
      playAgain = true;
      // break;
    }


    //Dealer's turn
    while (dealerTurn) {
      // Check if Dealer has Black Jack
      if (handToString(dealer.hand).includes("A") && dealer.total === 21) {
        blackJackDealer = true;
        dealerTurn = false;
        determineWinner = true;
      }


      // Include the first card in the dealer's total
      if (dealer.hand.length === 1) {
        dealer.total += getValue(dealer.hand[0].rank, dealer.total);
      }
  
      // Continue drawing cards for the dealer until their total is 17 or higher and they don't need to draw
      while(dealer.total < 17 || (dealer.total < playerTotal && dealer.total <= 21)) {
        const card = deck.cards.pop();
        if (card) {
          // Check number of aces in hand and reduce for best score possible
          if ((card.rank === "A" && dealer.total > 21) || (card.rank !== "A" && dealer.total > 21)) {
            dealer.total += reduceAce(dealer.total, dealerAceCount);
          } else {
            dealer.total += getValue(card.rank, dealer.total);
          }
          
          dealer.hand.push(card);
        }
      }


      // Check if the player's total is greater than 21
      if (dealer.total > 21) {
        console.log("Haha! Dealer bust! Haha!");
        playAgain = true;
        // break;
      }
  
      dealerTurn = false;
      determineWinner = true;
      break;
    }
    
    
    // Determine the winner
    if (determineWinner) {
      console.log(`Cards in dealer's hand: ${handToString(dealer.hand)} and total is ${dealer.total}`);
      if (dealer.total > 21) {
        console.log("Dealer bust! You win!");
      } else if (playerTotal > dealer.total) {
        console.log("You win!");
      } else if (dealer.total > playerTotal) {
        console.log("Dealer wins!");
      } else if (dealer.total > 21 && playerTotal > 21) {
        console.log("Busty boys! Dealer wins!");
      } else if (blackJackPlayer && !blackJackDealer) {
        console.log("BLACK JACK! You win!");
      } else if (!blackJackPlayer && blackJackDealer) {
        console.log("BLACK JACK! Dealer wins!");
      } else {
        console.log("It's a tie!");
      }
      
      playAgain = true;
      // break;
    }
    
   if (!playAgain) {
     const response = await readConsole.questionAsync("Stand, Hit (s/h) \n");
 
     if (response !== "h" && response !== "s") {
       playing = false;
     }

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
        playAgain = true;
        restartGame();
      }
   }
    
  }
  whenFinished();
}

main(() => {
  process.exit();
});
