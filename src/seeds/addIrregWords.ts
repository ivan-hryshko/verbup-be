import AppDataSource from '../config/app-data-source'
import { IrrWordEntity } from '../modules/irr-words-en/irr-words.entity'
import * as fs from 'fs'

type IrrWordJSON = {
  base_form: string
  past_simple: string
  past_participle: string
  uk: string
}

async function addIrregWords() {
  try {
    const irrWordsRepository = AppDataSource.getRepository(IrrWordEntity)
    const irrWords = await irrWordsRepository.find()
    if (irrWords.length > 0) {
      console.log('addIrregWords SKIPPED!!!')
      return
    }
    const data: { [key: string]: IrrWordJSON[] } = JSON.parse(
      fs.readFileSync('src/json-data/irr-verbs.filtered.json', 'utf-8'),
    )
    let index = 1
    let verbsToSave = []
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
        const entryEng = irrWordsRepository.create(preparedWordEng)
        verbsToSave.push(entryEng)
        const preparedWordUk = {
          wordGroupId: index,
          basic: word.uk,
          level,
          lang: 'uk',
        }
        const entryUk = irrWordsRepository.create(preparedWordUk)
        verbsToSave.push(entryUk)
        // await irrWordsRepository.save(entryEng);
        index += 1
      }
    }
    await irrWordsRepository.save(verbsToSave)

    console.log('addIrregWords seed COMPLETED!!!')
  } catch (error) {
    console.log('addIrregWords seed FAILED!!!')
  }
}

export default addIrregWords

// addIrregWords().catch((error) => {
//   console.error('Seeding failed:', error);
//   // process.exit(1);
// });
