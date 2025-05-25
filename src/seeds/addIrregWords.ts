import AppDataSource from '../config/app-data-source';
import { IrrWordEntity } from '../modules/irr-words-en/irr-words.entity'
import * as fs from 'fs';

type IrrWordJSON = {
  base_form: string
  past_simple: string,
  past_participle: string,
  uk: string
}

async function addIrregWords() {
  console.log('irr');
  const irrWordsRepository = AppDataSource.getRepository(IrrWordEntity);
  console.log('repo');
  const irrWords = await irrWordsRepository.find()
  if (irrWords.length > 0) {
    console.log('addIrregWords SKIPPED!!!')
    return
  }
  console.log('irrWords :>> ', irrWords);
  // chech if table empty

  const data: { [key: string]: IrrWordJSON[] } = JSON.parse(fs.readFileSync('src/json-data/irr-verbs.json', 'utf-8'));
  // console.log('data :>> ', data);
  let index = 1
  for (const [level, words] of Object.entries(data)) {
    for (const word of words) {
      const preparedWordEng = {
        wordGroupId: index,
        basic: word.base_form,
        pastSimple: word.past_simple,
        pastParticiple: word.past_participle,
        level,
        lang: 'en',
      }
      const entryUk = irrWordsRepository.create(preparedWordEng);
      const preparedWordUk = {
        wordGroupId: index,
        basic: word.uk,
        level,
        lang: 'uk',
      }
      const entryEng = irrWordsRepository.create(preparedWordUk);
      // await irrWordsRepository.save(entryEng);
      // await irrWordsRepository.save(entryUk);
      index += 1
    }
  }

  console.log('Seeding completed.');
  // await AppDataSource.destroy();
}

export default addIrregWords

// addIrregWords().catch((error) => {
//   console.error('Seeding failed:', error);
//   // process.exit(1);
// });
