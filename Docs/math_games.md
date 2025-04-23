# Casino Game Mathematical Models (Target RTP 95-97%)

**Date:** 2025-04-23

**Objective:** Define mathematical models and payout structures for 10 simple casino-style games to achieve a theoretical Return to Player (RTP) between 95% and 97%.

**Key Definitions:**
* **RTP (Return to Player):** The theoretical percentage of wagered money paid back to players over the long term.
* **House Edge:** 100% - RTP. The theoretical advantage the casino holds.
* **Payout:** The total amount returned to the player on a winning bet, including the original stake, per unit wagered. (e.g., Payout 2 means a $1 bet returns $2 total: $1 stake + $1 net win).
* **Net Win:** Payout - 1 (based on a 1 unit stake).
* **Assumption:** All games rely on a cryptographically secure pseudo-random number generator (CSPRNG) for fair outcomes.

---

## 1. Coin Flip

* **Rules:** Player bets on "Heads" or "Tails".
* **Probabilities:**
    * P(Heads) = 0.5
    * P(Tails) = 0.5
* **Target RTP:** 96.00% (House Edge = 4%)
* **Calculation:** RTP = P(Win) * Payout => 0.96 = 0.5 * Payout => Payout = 1.92
* **Model:**
    * Win Probability: P_win = 0.5
    * Loss Probability: P_loss = 0.5
    * **Payout on Win: 1.92** (Net Win 0.92 : 1)
    * **RTP: 96.00%**

---

## 2. Dice Roll (Bet on Number)

* **Rules:** Player bets on a specific number resulting from a single 6-sided die roll (1, 2, 3, 4, 5, or 6).
* **Probabilities:** P(Any specific number k) = 1/6
* **Target RTP:** 95.00% (House Edge = 5%)
* **Calculation:** RTP = P(Win) * Payout => 0.95 = (1/6) * Payout => Payout = 5.7
* **Model:**
    * Win Probability: P_win = 1/6 ≈ 0.1667
    * Loss Probability: P_loss = 5/6 ≈ 0.8333
    * **Payout on Win: 5.7** (Net Win 4.7 : 1)
    * **RTP: 95.00%**

---

## 3. Simple Roulette (Red/Black Bet)

* **Rules:** European-style wheel with 37 slots (18 Red, 18 Black, 1 Green '0'). Player bets on Red or Black. If '0' hits, the bet loses.
* **Probabilities:**
    * P(Red) = 18/37
    * P(Black) = 18/37
    * P(Zero) = 1/37
* **Target RTP:** Use standard 1:1 payout for even money bets.
* **Calculation:** RTP = P(Win) * Payout = (18/37) * 2 = 36/37 ≈ 0.973
* **Model:**
    * Bet on Red or Black.
    * Win Probability: P_win = 18/37 ≈ 0.4865
    * Loss Probability: P_loss = 19/37 ≈ 0.5135
    * **Payout on Win: 2** (Net Win 1 : 1)
    * **RTP: 97.30%**

---

## 4. High/Low Card (Simplified)

* **Rules:** Standard 52-card deck (Ace High). Player bets *before* a card is drawn whether it will be Low (2-7, 6 ranks, 24 cards) or High (8-Ace, 7 ranks, 28 cards). Assumes reshuffle each time.
* **Probabilities:**
    * P(Low) = 24/52
    * P(High) = 28/52
* **Target RTP:** ~96% for both bet types.
* **Calculation:**
    * Low Bet Payout (X_L): RTP = P(Low) * X_L => 0.96 = (24/52) * X_L => X_L = 2.08
    * High Bet Payout (X_H): RTP = P(High) * X_H => 0.96 = (28/52) * X_H => X_H ≈ 1.783 (use 1.78 for simplicity)
* **Model:**
    * Bet Low (2-7): P_win = 24/52, **Payout = 2.08**, RTP = 96.00%
    * Bet High (8-A): P_win = 28/52, **Payout = 1.78**, RTP ≈ 95.8%
    * **Overall RTP is approximately 96%.**

---

## 5. Simple Wheel of Fortune

* **Rules:** A wheel with 10 equal segments. Player places a bet before the spin.
* **Segment Structure & Payouts:**
    * 5 Segments: Lose (Payout 0) - P = 0.5
    * 3 Segments: Win 0.5x stake (Payout 1.5) - P = 0.3
    * 1 Segment: Win 1x stake (Payout 2) - P = 0.1
    * 1 Segment: Win 2x stake (Payout 3) - P = 0.1
* **RTP Calculation:** RTP = (0.5 * 0) + (0.3 * 1.5) + (0.1 * 2) + (0.1 * 3) = 0 + 0.45 + 0.20 + 0.30 = 0.95
* **Model:**
    * **Payouts and Probabilities:** As listed above.
    * **RTP: 95.00%**

---

## 6. Simple 3-Reel Slot

* **Rules:** 3 Reels, 1 center payline. Symbols: Cherry (C), Lemon (L), BAR (B). *Assumption: Each symbol has an equal probability (1/3) of landing on each reel's payline.* Total combinations = $3^3 = 27$.
* **Paytable (Payout per 1 unit bet):**
    * C-C-C: Payout 5
    * L-L-L: Payout 8
    * B-B-B: Payout 13
    * All other combinations: Payout 0
* **Probabilities & RTP Calculation:**
    * P(CCC) = P(LLL) = P(BBB) = (1/3)^3 = 1/27
    * RTP = P(CCC)*5 + P(LLL)*8 + P(BBB)*13 = (1/27)*5 + (1/27)*8 + (1/27)*13 = (5+8+13)/27 = 26/27 ≈ 0.963
* **Model:**
    * 3 reels, 3 symbols (equal probability assumed).
    * **Paytable:** C-C-C=5, L-L-L=8, B-B-B=13.
    * **RTP: 96.30%**

---

## 7. Rock Paper Scissors (vs House)

* **Rules:** Player chooses Rock, Paper, or Scissors. The House chooses randomly (P=1/3 for each). A tie results in a Push (bet returned).
* **Target RTP:** 97.00%
* **Calculation (Win Payout X):**
    * RTP = P(Push)*1 + P(Win)*X + P(Loss)*0
    * 0.97 = (1/3)*1 + (1/3)*X + (1/3)*0 => 0.97 = (1+X)/3 => 2.91 = 1+X => X = 1.91
* **Model:**
    * Win Probability: P_win = 1/3
    * Loss Probability: P_loss = 1/3
    * Push Probability: P_push = 1/3
    * **Payout on Win: 1.91** (Net Win 0.91 : 1)
    * **Tie/Push: Stake Returned** (Payout 1)
    * **RTP: 97.00%**

---

## 8. Number Guess (1-10)

* **Rules:** House randomly selects an integer between 1 and 10 (inclusive). Player bets on a single number.
* **Probabilities:**
    * P(Win - Correct Guess) = 1/10 = 0.1
    * P(Loss - Incorrect Guess) = 9/10 = 0.9
* **Target RTP:** 95.00%
* **Calculation (Payout X):** RTP = P(Win) * X => 0.95 = 0.1 * X => X = 9.5
* **Model:**
    * Win Probability: P_win = 0.1
    * Loss Probability: P_loss = 0.9
    * **Payout on Win: 9.5** (Net Win 8.5 : 1)
    * **RTP: 95.00%**

---

## 9. Scratch Card Simulator

* **Rules:** Player "buys" a virtual card for a fixed price (1 unit stake). The outcome (prize) is determined randomly based on predefined probabilities.
* **Target RTP:** 96.00%
* **Prize Structure (Payout includes 1 unit stake):**
    * Payout 0 (Lose): P = 0.620 (62.0%)
    * Payout 1 (Push): P = 0.160 (16.0%)
    * Payout 2 (Win 1x): P = 0.150 (15.0%)
    * Payout 5 (Win 4x): P = 0.050 (5.0%)
    * Payout 10 (Win 9x): P = 0.015 (1.5%)
    * Payout 20 (Win 19x): P = 0.005 (0.5%)
    * *(Check: Sum of Probabilities = 1.00)*
* **RTP Calculation:** RTP = (0.16*1) + (0.15*2) + (0.05*5) + (0.015*10) + (0.005*20) = 0.16 + 0.30 + 0.25 + 0.15 + 0.10 = 0.96
* **Model:**
    * **Probabilities and Payouts:** As listed above.
    * **RTP: 96.00%**

---

## 10. Simplified Blackjack

* **Rules:** Player vs Dealer. Goal: Hand value closer to 21 than Dealer without exceeding 21. Ace=1 or 11, Face Cards=10. Dealer Stands on all 17s (Hard and Soft - S17). Player basic actions: Hit/Stand. No Double Down, Split, Insurance.
* **Key Rule Modifications for Target RTP:**
    * **Blackjack (Ace + 10/Face on first two cards) pays 1:1** (Payout 2), same as a regular win. (Standard BJ pays 3:2).
    * **Tie (Player hand = Dealer hand): Push** (Stake returned, Payout 1).
* **Mathematical Model & RTP:**
    * Calculating exact Blackjack RTP is complex and depends heavily on player strategy (Basic Strategy assumed for calculation).
    * The rule "Blackjack pays 1:1" significantly reduces the RTP compared to standard rules (by approx. 2.2-2.3%).
    * Assuming standard S17 rules yield ~99.5% RTP with Basic Strategy, reducing payout for Blackjack to 1:1 lowers this significantly.
    * **Estimated RTP ≈ 97.3%** (Requires simulation or reference tables for precise value under these specific rules and assuming optimal Basic Strategy).
    * **Payouts:**
        * Player Win (including Blackjack): **Payout 2**
        * Push/Tie: **Payout 1**
        * Player Loss (Bust or Dealer Wins): **Payout 0**

---

**Disclaimer:** These models provide theoretical RTPs. Actual results will vary based on the statistical variance of the games and the quality of the Random Number Generator used.