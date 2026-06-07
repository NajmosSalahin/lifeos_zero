import { BreathingTechnique } from '../../models/BreathingTechnique.model';
import { DrinkTemplate } from '../../models/DrinkTemplate.model';
import { logger } from '../../config/logger';

export const seedSystemData = async () => {
  const techCount = await BreathingTechnique.countDocuments({ isSystem: true });
  if (techCount === 0) {
    await BreathingTechnique.insertMany([
      { name: 'Box Breathing', description: 'Equal-count breathing for calm focus', category: 'focus', isSystem: true, recommendedCycles: 6,
        phases: [{ name: 'inhale', durationSeconds: 4, instruction: 'Breathe in slowly' }, { name: 'hold-in', durationSeconds: 4, instruction: 'Hold' }, { name: 'exhale', durationSeconds: 4, instruction: 'Breathe out' }, { name: 'hold-out', durationSeconds: 4, instruction: 'Hold empty' }], totalCycleDuration: 16 },
      { name: '4-7-8 Relaxation', description: 'Calming technique for sleep and anxiety', category: 'sleep', isSystem: true, recommendedCycles: 4,
        phases: [{ name: 'inhale', durationSeconds: 4, instruction: 'Inhale through nose' }, { name: 'hold-in', durationSeconds: 7, instruction: 'Hold breath' }, { name: 'exhale', durationSeconds: 8, instruction: 'Exhale through mouth' }], totalCycleDuration: 19 },
      { name: 'Coherent Breathing', description: '5-5 pattern for balance and calm', category: 'relaxation', isSystem: true, recommendedCycles: 10,
        phases: [{ name: 'inhale', durationSeconds: 5, instruction: 'Breathe in' }, { name: 'exhale', durationSeconds: 5, instruction: 'Breathe out' }], totalCycleDuration: 10 },
      { name: 'Energising Breath', description: 'Quick breaths to increase energy', category: 'energy', isSystem: true, recommendedCycles: 8,
        phases: [{ name: 'inhale', durationSeconds: 2, instruction: 'Short sharp inhale' }, { name: 'exhale', durationSeconds: 2, instruction: 'Short sharp exhale' }], totalCycleDuration: 4 },
      { name: 'Deep Diaphragmatic', description: 'Slow deep belly breathing for stress', category: 'relaxation', isSystem: true, recommendedCycles: 8,
        phases: [{ name: 'inhale', durationSeconds: 4, instruction: 'Expand belly' }, { name: 'hold-in', durationSeconds: 2, instruction: 'Pause' }, { name: 'exhale', durationSeconds: 6, instruction: 'Slow release' }], totalCycleDuration: 12 },
    ]);
    logger.info('Seeded breathing techniques');
  }

  const drinkCount = await DrinkTemplate.countDocuments({ isSystem: true });
  if (drinkCount === 0) {
    await DrinkTemplate.insertMany([
      { name: 'Glass of Water',   amountMl: 250,  drinkType: 'water',        emoji: '💧', color: '#3b82f6', waterFactor: 1.0,  isSystem: true },
      { name: 'Water Bottle',     amountMl: 500,  drinkType: 'water',        emoji: '🍶', color: '#3b82f6', waterFactor: 1.0,  isSystem: true },
      { name: 'Large Bottle',     amountMl: 1000, drinkType: 'water',        emoji: '🫙', color: '#3b82f6', waterFactor: 1.0,  isSystem: true },
      { name: 'Cup of Coffee',    amountMl: 240,  drinkType: 'coffee',       emoji: '☕', color: '#92400e', waterFactor: 0.85, isSystem: true },
      { name: 'Cup of Tea',       amountMl: 240,  drinkType: 'tea',          emoji: '🍵', color: '#d97706', waterFactor: 0.98, isSystem: true },
      { name: 'Juice Glass',      amountMl: 200,  drinkType: 'juice',        emoji: '🥤', color: '#f97316', waterFactor: 0.85, isSystem: true },
      { name: 'Milk Glass',       amountMl: 250,  drinkType: 'milk',         emoji: '🥛', color: '#e5e7eb', waterFactor: 0.87, isSystem: true },
      { name: 'Sports Drink',     amountMl: 500,  drinkType: 'sports',       emoji: '⚡', color: '#22c55e', waterFactor: 0.95, isSystem: true },
      { name: 'Soda Can',         amountMl: 330,  drinkType: 'soda',         emoji: '🫧', color: '#a855f7', waterFactor: 0.85, isSystem: true },
      { name: 'Energy Drink',     amountMl: 250,  drinkType: 'energy',       emoji: '🔋', color: '#eab308', waterFactor: 0.80, isSystem: true },
      { name: 'Smoothie',         amountMl: 350,  drinkType: 'smoothie',     emoji: '🥤', color: '#ec4899', waterFactor: 0.88, isSystem: true },
      { name: 'Coconut Water',    amountMl: 330,  drinkType: 'coconut',      emoji: '🥥', color: '#84cc16', waterFactor: 0.95, isSystem: true },
    ]);
    logger.info('Seeded drink templates');
  }
};