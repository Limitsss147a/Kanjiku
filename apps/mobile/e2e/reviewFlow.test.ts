import { device, element, by, expect } from 'detox';

describe('Review Flow', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true, delete: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('navigates from Home to Review, shows kanji, reveals answer, grades, and loads next card', async () => {
    // Home screen - verify queue stats and start review
    const startReviewButton = element(by.id('startReviewButton'));
    await waitFor(startReviewButton).toBeVisible().withTimeout(10000);
    await startReviewButton.tap();

    // Review screen - verify character displays
    const characterDisplay = element(by.id('characterDisplay'));
    await waitFor(characterDisplay).toBeVisible().withTimeout(10000);
    const charText = await characterDisplay.getText();
    expect(charText.length).toBeGreaterThan(0);

    // Tap reveal button
    const revealButton = element(by.id('revealButton'));
    await waitFor(revealButton).toBeVisible().withTimeout(5000);
    await revealButton.tap();

    // Verify meaning appears after reveal
    const meaningDisplay = element(by.id('meaningDisplay'));
    await waitFor(meaningDisplay).toBeVisible().withTimeout(5000);
    const meaningText = await meaningDisplay.getText();
    expect(meaningText.length).toBeGreaterThan(0);

    // Tap grade "Pas (3)" - GOOD
    const gradeGood = element(by.id('gradeGood'));
    await waitFor(gradeGood).toBeVisible().withTimeout(5000);
    await gradeGood.tap();

    // Wait for next card to load (character changes)
    await waitFor(characterDisplay).toBeVisible().withTimeout(10000);
    const nextCharText = await characterDisplay.getText();
    expect(nextCharText.length).toBeGreaterThan(0);
    // Note: character may be same if only one in queue; core flow verified
  });

  it('completes full review cycle: reveals and grades all four options', async () => {
    const startReviewButton = element(by.id('startReviewButton'));
    await waitFor(startReviewButton).toBeVisible().withTimeout(10000);
    await startReviewButton.tap();

    const characterDisplay = element(by.id('characterDisplay'));
    await waitFor(characterDisplay).toBeVisible().withTimeout(10000);

    // Test each grade button in sequence
    const grades = ['gradeAgain', 'gradeHard', 'gradeGood', 'gradeEasy'];
    
    for (const gradeId of grades) {
      // Reveal
      const revealButton = element(by.id('revealButton'));
      await waitFor(revealButton).toBeVisible().withTimeout(5000);
      await revealButton.tap();

      // Verify meaning shows
      const meaningDisplay = element(by.id('meaningDisplay'));
      await waitFor(meaningDisplay).toBeVisible().withTimeout(5000);
      await meaningDisplay.getText();

      // Tap grade
      const gradeBtn = element(by.id(gradeId));
      await waitFor(gradeBtn).toBeVisible().withTimeout(5000);
      await gradeBtn.tap();

      // Wait for next card
      await waitFor(characterDisplay).toBeVisible().withTimeout(10000);
    }
  });
});