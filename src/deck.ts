import { Card } from "./card";
import { Suit } from "./suit";
export class Deck {
  public cards: Array<Card> = [];

  constructor() {
    const rankStrings = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

    for (var suit in Object.keys(Suit)) {
      for (var rank of rankStrings) {
        this.cards.push(new Card(rank, Object.values(Suit)[suit]));
      }
    }
  }
}
