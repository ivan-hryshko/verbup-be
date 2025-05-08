// // import { AppDataSource } from './data-source';
// import { IrrWordEn } from './entities/IrrWordEn';
// import * as fs from 'fs';

// async function seed() {
//   await AppDataSource.initialize();
//   const repository = AppDataSource.getRepository(IrrWordEn);
//   // chech if table empty

//   const data = JSON.parse(fs.readFileSync('data/irregular-verbs.json', 'utf-8'));

//   for (const [level, words] of Object.entries(data)) {
//     for (const word of words) {
//       const entry = repository.create({
//         basic_word: word['base form'],
//         past_simple: word['past simple'],
//         past_participle: word['past participle'],
//         level,
//       });
//       await repository.save(entry);
//     }
//   }

//   console.log('Seeding completed.');
//   await AppDataSource.destroy();
// }

// seed().catch((error) => {
//   console.error('Seeding failed:', error);
//   process.exit(1);
// });
