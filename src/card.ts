import { Suit } from "./suit";
export class Card {
  constructor(public readonly rank: string, private readonly suit: Suit) {}

  public get Suit() {
    return this.suit;
  }
}
