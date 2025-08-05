
import dotenv from 'dotenv';
import * as path from 'path';

// Manually configure and load environment variables
// This ensures process.env is populated before any other imports that might need it.
const envPath = path.resolve(__dirname, '..', '..', '.env.development.local');
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error("Error loading .env file", result.error);
  process.exit(1);
}

import 'reflect-metadata';
import * as fs from 'fs';
import { S3Service } from '../modules/s3/s3.service';
import { createTypeOrmConn } from '../config/app-data-source';
import { IrrWordRepository } from '../modules/irr-words/irr-words.repository';
import { IrrWordLang } from '../modules/irr-words/irr-words.types';

async function uploadAssets() {
  try {
    await createTypeOrmConn();
    console.log('Data Source has been initialized!');
  } catch (err) {
    console.error('Error during Data Source initialization:', err);
    return;
  }

  const s3Service = new S3Service();
  const irrWordRepository = new IrrWordRepository();

  const assetsDir = path.join(__dirname, '../../assets');
  const files = fs.readdirSync(assetsDir);

  for (const file of files) {
    if (path.extname(file) === '.png') {
      const base = path.basename(file, '.png');
      const filePath = path.join(assetsDir, file);
      const fileBuffer = fs.readFileSync(filePath);
      const filename = `irr-words/${file}`;

      try {
        const word = await irrWordRepository.getWordsByBase({
          basic: base,
          lang: IrrWordLang.EN,
        });

        if (word) {
          await s3Service.upload(
            {
              buffer: fileBuffer,
              mimetype: 'image/png',
              originalname: file,
            } as any,
            filename,
          );

          word.image = filename;
          await irrWordRepository.save(word);
          console.log(`Uploaded ${file} and updated ${base}`);
        } else {
          console.log(`Word not found for ${base}`);
        }
      } catch (error) {
        console.error(`Failed to upload ${file}:`, error);
      }
    }
  }
   console.log('Asset upload complete.');
   process.exit(0);
}

uploadAssets();
