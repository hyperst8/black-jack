import { describe, expect, it, test } from "@jest/globals";
import { Card } from "../src/card";
import { Deck } from "../src/deck";
import { calculateTotal, handToString } from "../src/main";
import { Suit } from "../src/suit";

describe.skip("Test deck", () => {
  test("Should have 52 cards", () => {
    expect(new Deck().cards.length).toBe(52);
  });

  test("Should have 4 distinct suits", () => {
    expect(new Set(new Deck().cards.map((card) => card.Suit)).size).toBe(4);
  });
});

describe("handToString function", () => {
  it("should convert an array of cards to a string as expected", () => {
    const cards = [new Card("5", Suit.Hearts), new Card("10", Suit.Hearts)];

    const result = handToString(cards);

    expect(result).toBe("5♥, 10♥");
  });
});

describe("calculateTotal function", () => {
  it("No face and Ace card should sumarize correctly", () => {
    const cards = [
      new Card("5", Suit.Diamonds),
      new Card("10", Suit.Hearts),
      new Card("6", Suit.Spades),
    ];

    const result = calculateTotal(cards);

    expect(result).toBe(21);
  });

  it("A face and Ace should be 0 = Black Jack", () => {
    const cards = [new Card("A", Suit.Diamonds), new Card("K", Suit.Hearts)];

    const result = calculateTotal(cards);

    expect(result).toBe(0);
  });

  it("Should reduce total score if contain one Ace and total is over 21", () => {
    const cards = [
      new Card("4", Suit.Diamonds),
      new Card("2", Suit.Clubs),
      new Card("A", Suit.Hearts),
      new Card("6", Suit.Spades),
      new Card("7", Suit.Diamonds),
    ];

    const result = calculateTotal(cards);

    expect(result).toBe(20);
  });

  it("Should reduce total score if contain more than one Ace and total is over 21", () => {
    const cards = [
      new Card("4", Suit.Diamonds),
      new Card("2", Suit.Clubs),
      new Card("A", Suit.Hearts),
      new Card("6", Suit.Spades),
      new Card("A", Suit.Diamonds),
    ];

    const result = calculateTotal(cards);

    expect(result).toBe(14);
  });
});
